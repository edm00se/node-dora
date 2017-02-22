# node-dora
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg)](#contributors) [![Dependency Status](https://dependencyci.com/github/edm00se/node-dora/badge)](https://dependencyci.com/github/edm00se/node-dora) [![NPM version][npm-image]][npm-url]

A node wrapper for [DORA](https://github.com/camac/dora), the Domino On-Disk Repository Assistant, by [Cameron Gregor](https://github.com/camac).

## Installation

```sh
npm install --save node-dora
```

### From Source

- `git clone --recursive https://github.com/edm00se/node-dora.git`
- `cd node-dora`
- `npm install`

To hook to your cloned copy to your global `npm_modules`, run `npm link` from within the project directory's root.

## Use

```javascript
const dora = require('node-dora');
const path = require('path');

const odp = path.join(__dirname, 'Some ODP');
dora.performFilter(odp, function(er){
    if(er){
        console.error(er);
    }
    console.log('dora done!');
});
```

There are some other functions exposed, but are mainly for internal purposes. The full list of functions exposed are:

- hasDependencies
- installDependencies
- hasXsltProc
- installXsltProc
- performFilter <- this is what you want!

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request 😁

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/622118?v=3" width="100px;"/><br /><sub>Eric McCormick</sub>](https://ericmccormick.io)<br />📝 [💻](https://github.com/edm00se/node-dora/commits?author=edm00se) [📖](https://github.com/edm00se/node-dora/commits?author=edm00se) 🔧 📹 |
| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## History

Cameron Gregor created [DORA](https://github.com/camac/dora) which is great, but then he made [Swiper](https://github.com/camac/Swiper). Swiper is also great, but doesn't (yet) work with Domino Designer when it does not have Build Automatically enabled.

Being concerned about both this one limitation and my ability to use DORA in a CI environment, I wrote a Grunt config, which is now being replaced by the CLI tool for this package.

## Credits

- Cameron Gregor, for DORA, which this is a wrapper for

## Related

- [dora-cli](https://github.com/edm00se/node-dora-cli#readme)

## License

MIT

[npm-image]: https://badge.fury.io/js/node-dora.svg
[npm-url]: https://npmjs.org/package/node-dora
