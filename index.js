const fs = require('fs');
const path = require('path');
const hasbin = require('hasbin');
const execa = require('execa');
const pify = require('pify');
const glob = require('glob-fs')({gitignore: true});
const git = require('simple-git')(path.join(__dirname));
const doraRepo = 'https://github.com/camac/dora.git';
const doraDir = path.join(__dirname, 'dora');
const instFile = path.join(doraDir, 'Install.pl');
const xslCleanFile = path.join(doraDir, 'xsl', 'DXLClean.xsl');
const tmpDir = '.tmp';
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

/**
 * Checks for XSLTProc binary.
 *
 * @return boolean
 */
function hasXsltProc() {
  return hasbin.sync('xsltproc');
}

/**
 * Performs installation of DORA to create xsltproc bin in user directory;
 * this is the same as invoking the `Install.pl` with a copy of DORA.
 */
function installUserDora() {
  execa(instFile, ['--install']);
}

/**
 * Checks for dependencies.
 *
 * @return boolean
 */
function hasDeps() {
  return hasXsltProc();
}

/**
 * Checks for DORA in __dirname.
 *
 * @return boolean
 */
function hasDoraSubmodule() {
  let yn = false;
  try {
    const exStat = fs.statSync(doraDir);
    if (exStat.isDirectory()) {
      yn = true;
    } else {
      yn = false;
    }
  } catch (err) {
    yn = false;
  }
  return yn;
}

/**
 * Performs install of DORA as "submodule". This is already a git submodule
 * in the git repo, but with end-user, it needs to be pulled as an asset;
 * this occurs during post-install of this npm module.
 */
function installDoraSubmodule() {
  git.clone(doraRepo, path.join(__dirname, 'dora'));
}

/**
 * checks for and installs necessary DORA components
 */
function installDeps() {
  if (!hasDoraSubmodule()) {
    // this should only occur for `npm install` users, as the git repo will include the submodule
    installDoraSubmodule();
  }
  if (!hasXsltProc()) {
    installUserDora();
  }
}

/**
 * @param  String odpPath
 * @param  funciton cb
 *
 * @returns String[] of files to match.
 */
function getFileAr(odpPath, cb) {
  const odp = odpPath[odpPath.length - 1] === '/' ? odpPath : odpPath += '/';
  const globAr = [
    odp + '**/*.aa',
    odp + '**/*.column',
    odp + '**/*.dcr',
    odp + '**/*.fa',
    odp + '**/*.field',
    odp + '**/*.folder',
    odp + '**/*.form',
    odp + '**/*.frameset',
    odp + '**/*.ija',
    odp + '**/*.ja',
    odp + '**/*.javalib',
    odp + '**/*.lsa',
    odp + '**/*.lsdb',
    odp + '**/*.metadata',
    odp + '**/*.navigator',
    odp + '**/*.outline',
    odp + '**/*.page',
    odp + '**/*.subform',
    odp + '**/*.view',
    odp + 'Resources/AboutDocument',
    odp + 'AppProperties/database.properties',
    odp + 'Resources/IconNote',
    odp + 'Code/actions/Shared Actions',
    odp + 'Resources/UsingDocument'
  ];
  glob.readdir(globAr.join('|'), (err, files) => {
    cb(err, files);
  });
}

/**
 * Ensures that a given destination directory exists.
 *
 * @param  String p
 * @param  function cb
 */
function ensureDir(p, cb) {
  cb = cb || (() => {});
  mkdirp(p, er => {
    if (er) {
      console.error(er);
    } else {
      cb();
    }
  });
}

/**
 * @param  String f
 * @param  function cb
 */
function performXsltTransform(f, cb) {
  cb = cb || (() => {});
  const cmd = 'xsltproc';
  const args = ['-o', path.join(tmpDir, f), xslCleanFile, f];
  const res = execa.sync(cmd, args);
  cb(res.error);
}

/**
 * @param  String file
 */
function handleFileToTransform(file) {
  // replaces running, per element `xsltproc -o ~/Desktop/tmp.txt xsl/DXLClean.xsl test/binarydxl/SomeView.view`
  const nameAr = file.split('/');
  nameAr.pop();
  return new Promise((resolve, reject) => {
    ensureDir(path.join(tmpDir, ...nameAr), () => {
      return pify(performXsltTransform)(file).then(er => {
        if (er) {
          reject('💩 ' + er.toString());
        } else {
          resolve('🦄');
        }
      });
    });
  });
}

/**
 * Performs actual XSLT transformations for matching files.
 *
 * @param  String dir
 * @param  function cb
 */
function performDoraXslt(dir, cb) {
  cb = cb || (() => {});
  // 1. cycle through all matching files from matches
  getFileAr(dir, (err, fileAr) => {
    // 2. perform transform, 3. output to tmp dir
    Promise.all(fileAr.map(handleFileToTransform)).then(() => {
      // 4. write back
      ncp(path.join(tmpDir, dir), dir, err => {
        if (err) {
          return console.error(err);
        }
          // clean tmpDir
        rimraf(tmpDir, () => console.log('\ndone!'));
      });
    })
    .then(() => {
      console.log(`\nprocessed ${fileAr.length} files that match criteria`);
      cb(err);
    });
  });
}

module.exports = {
  hasDependencies: hasDeps,
  installDependencies: installDeps,
  hasXsltProc,
  installXsltProc: installUserDora,
  performFilter: performDoraXslt
};
