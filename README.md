
<h1 align=center><code>balancer</code></h1>

## Installing

Most users will be interested in consuming the ABI definitions for various Balancer contracts.

Until this package is shipped to a package registry, the best way to use it is as a git submodule.

```
mkdir lib
git submodule add https://github.com/balancer-labs/balancer-core lib/balancer-core
```

Now you can require the package:

```
let bcore = require('./lib/balancer-core');
let types = bcore.types;  # A combined.json object with type names lifted
let BPool = bcore.types.BPool;
let pool = new web3.eth.Contract(BPool.abi);
```
 

## Usage

[Check out our API coverage issue](https://github.com/balancer-labs/balancer-core/issues/24)

## Developing

To develop you need `yarn`, `node`, and `solc`. To build the docs you need `hugo`.

```
git clone https://github.com/balancer-labs/balancer-core
cd balancer-core
yarn setup
```

```
yarn setup       # clones submodules and installs packages
yarn build       # compile the solidity contracts
yarn test        # yarn build && mocha
yarn dist        # cp artifacts to out/
yarn docs        # build doc/ to docs/
yarn docs serve  # serve docsite from doc/
```

### Project structure

```
doc/            documentation sources
docs/           docs build output (GH static site fixed path)
lib/            solidity dependencies
out/            solidity build artifacts
sol/            solidity source files (the contracts)
test/           tests for util/ and sol/
tmp/            .gitignore'd transient build out
util/           javascript support code
LICENSE         GPL3
Makefile        solidity build command defined here
package.js      package entrypoint (module.exports)
package.json
yarn.lock
```

