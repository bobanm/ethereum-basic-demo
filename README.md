![refunder3](https://user-images.githubusercontent.com/2560022/175058697-c7e13480-1a38-4761-af0e-f5737ae7303f.png)

Am I the only one who finds it absurd when a Hello World app requires you to download over 1 GB of
dependencies?

For all of us who love simple, fast and lean software, both when learning and in production, this
is the place to start from. It is a beginner-friendly demo which strips off all the bloat, so you
can focus on what matters: How to build a simple, lean and efficient dapp.

**Before you continue reading, check out the dapp right now, and try it out with some test ETH.**

The contract is deployed on L1 testnets:

- Ropsten
- Rinkeby
- Goerli
- Kovan

And also on L2 testnets:

- Optimism Kovan
- Arbitrum Rinkeby

Head to https://boban.ninja/refunder/, point your MetaMask to any of those networks, and make some
transfers and refunds.


About this document
-------------------

While the app is very simple and short, I made this guide to be quite comprehensive. Not only because
I wanted to document everything for people who are absolute beginners and have never used tools
like Hardhat. But also because I wanted to create a tutorial for myself, and have it all documented
in once place, in case Men in Black or some other people in suits find me and wipe out my memory 😅


Tech used
---------

The goal was to use as few dependencies as it makes sense. That's why I picked only the bare
essentials and my personal favorites:

- [Solidity](https://github.com/ethereum/solidity/) for the smart contract
- Some very basic [Vue.js](https://github.com/vuejs/core/), because writing frontend in vanilla
JavaScript can turn into a mess
- [Ethers.js](https://github.com/ethers-io/ethers.js), because I'm not nerdy enough to use low-level
Ethereum JSON-RPC API
- _[optional]_ [Hardhat](https://github.com/NomicFoundation/hardhat) with Ethers and Waffle plugins,
for streamlined blockchain access, deployment, and testing

And that's pretty much all.


I didn't want to bloat the codebase by adding other dependencies, not even basic things like
[Dotenv](https://github.com/motdotla/dotenv). A simple config file with a JavaScript object suits
much better, as you will see in [Configuration](#configuration) section.


Before we start: Your Node package manager
------------------------------------------

If you are managing your dependencies using `npm` or `yarn`, this is a great opportunity to try `pnpm`
and never look back 😀

```
npm install -g pnpm
```

`pnpm` is an amazing drop-in replacement for `npm`, which keeps all packages in a store, and creates
hardlinks in your `node_modules` folder. No longer will each project have their own separate copy of all
the dependencies, when using symlinks and hardlinks is much more elegant, and much faster.


Smart contract: Refunder
------------------------

The smart contract included in this dapp has a few simple features. It

1. accepts Ether through `receive()` function
1. keeps track of all the Ether it currently holds per each sender address
1. allows users to request a complete refund of all the Ether they transferred
1. keeps track of how many payments and refunds were completed

Besides being a nice demo which shows how you can programatically move Ether between an EOA and a
smart contract, the _Refunder_ smart contract does not really have any real-world utility.


What else is included
---------------------

Smart contracts on their own are not that useful without an easy way to interact with them. I've
included 3 different ways to interact with _Refunder_.

- web frontend in `/frontend`
- CLI demo in `/scripts/refunder-demo.js`
- unit test suite in `/test/refunder.test.js`


Run the web frontend locally
----------------------------

If you just want to access the contract from the frontend app, without deploying your own contracts
or running tests, you don't even need to run `pnpm install`.

The frontend that is in the `/frontend` folder works out of the box. For simplicity reasons, I made it
to be one big Vue component, instead of slicing it into multiple single file components. As a result,
you don't need to run tools like webpack build. Just access the files directly and you're good to go.

To interact with smart contract, you will need MetaMask extension and a local web server. MetaMask
will not inject `window.ethereum` object if you open HTML file using file protocol. An easy way to
open it using HTTP protocol is to serve it using a local web server. Installing and running a local
web server is way more simple than it sounds. Since here we like lean and fast apps, the server of
choice is `lite-server`.

If you don't have it already, install it globally using a Node package manager:

```
pnpm install -g lite-server
```

Then from the project folder, start your server, giving it `frontend` as its base folder:

```
lite-server --baseDir=frontend
```

This should start the server and automatically open your browser at address
`http://localhost:3000/`, where it will show the contents of `/frontend/index.html` which is the entry
page of our frontend.


Configuration
-------------

The configuration is needed only if you want to run CLI demo or tests on external blockchains.

You can skip this step if you only want only to:

1. access the dapp using the provided frontend
1. run CLI demo or test on internal Hardhat blockchain

However, I suggest you follow along in order to learn how Hardhat handles API keys for access to
the blockhain via Infura or Alchemy, and how it initializes the accounts you will use to send
transactions.

The first thing to do is to copy or rename `template.credentials.js` into `.credentials.js` and
update dummy values with your actual keys. The credentials file is configured to be excluded from
Git, so you don't commit it by mistake. **Nevertheless, never use private keys which have access to
funds on the mainnet.**

To send transactions to a test network and update the state of the smart contract, you will need
some test ETH, which you can obtain from a test faucet. That is quite trivial and out of
scope of this document.


CLI demo and dependencies
-------------------------

Besides the web frontend, it is also possible to interact with the smart contract using CLI script,
or even to access it on a local in-memory mock blockchain. For this, we'll need Hardhat.

Install all project dependencies:

```
pnpm install
```

Start a local in-memory blockchain:

```
pnpm hardhat node
```

Compile the _Refunder_ contract and deploy it to the local Hardhat network:

```
pnpm hardhat run ./scripts/deploy.js --network localhost
```

The first contract will be deployed at address `0x5FbDB2315678afecb367f032d93F642f64180aa3`

If you want to interact with an instance of _Refunder_ on an external test blockchain, you can use the
contract instances I've already deployed. The full list of available networks and contracts is available
in `/frontend/config.js`

Otherwise, you can deploy your own instance using deploy script with different network argument:

```
pnpm hardhat run ./scripts/deploy.js --network <network-name>
```


Unit tests
----------

Running tests requires that you have installed Hardhat, as described in the previous section.

This app comes with 1 test suite that includes several test cases. The native way to run tests in
Hardhat is:

```
pnpm hardhat test
```

That will spin a new local in-memory blockchain for you, and use it to run tests on.

By default, that will run all test files in `/test` folder. If you If you want to run a specific
test file, provide it as an argument:

```
pnpm hardhat test ./test/refunder.test.js
```

If you want to run tests on an external blockchain, add `--network` argument:

```
pnpm hardhat test --network ropsten
```


Thanks to 💗
------------

- All the wonderful people who contributed to Ethereum, Solidity, Ethers.js, Hardhat and Vue.js
- Jared Parsons for the [frontend template](https://codepen.io/jared-parsons/pen/xxVoebB) which
I've slightly modified
