const test = require('ava');
const dora = require('./');
// const path = require('path');
// const doraDir = path.join(__dirname, 'dora');
// const testFile = path.join(doraDir, 'test', 'binarydxl', 'SomeView.view');

test('dep check', t => {
  if (dora.hasDependencies()) {
    t.pass();
  } else {
    dora.installDependencies();
    if (dora.hasDependencies) {
      t.pass();
    } else {
      t.fail();
    }
  }
});

test('xsltproc check', async t => {
  if (dora.hasXsltProc()) {
    t.pass();
  } else {
    dora.installXsltProc();
    if (dora.hasXsltProc()) {
      t.pass();
    } else {
      t.fail();
    }
  }
});
