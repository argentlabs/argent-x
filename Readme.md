<!-- logo -->
<p align="center">
  <img src="https://raw.githubusercontent.com/argentlabs/argent-x/HEAD/assets/readme-header.png">
</p>

---

<h3 align='center' style='margin: 1em;'>⬇️ Get <b>Argent X</b> for StarkNet today:</h3>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb/">
    <img src="https://raw.githubusercontent.com/argentlabs/argent-x/HEAD/assets/button-download.svg">
  </a>
</p>

---

<h2>🌈 Table of contents</h2>

- [🧒 Example dapp](#-example-dapp)
- [🌐 Usage with your dapp](#-usage-with-your-dapp)
- [🚀 Install from sources](#-install-from-sources)
  - [Chrome](#chrome)
  - [Firefox](#firefox)
- [👩🏾‍💻 Development](#-development)
- [🧪 Testing](#-testing)
  - [Setup](#setup)
  - [Run devnet locally](#run-devnet-locally)
  - [Run tests](#run-tests)
  - [Tools to help with testing](#tools-to-help-with-testing)
- [✏️ Contributing](#️-contributing)
- [❤️ Family and friends](#️-family-and-friends)
- [👨🏼‍🎨 Authors and license](#-authors-and-license)

## 🧒 Example dapp

You can try the extension using our example dapp hosted at:

[https://argentlabs.github.io/argent-x/](https://argentlabs.github.io/argent-x/)

The example dapp is also contained in this repository.

## 🌐 Usage with your dapp

If you want to use this StarkNet Wallet extension with your dapp, the easiest way is to checkout the `@argent/get-starknet` package developed in this repo by running:

```bash
# starknet.js is a peer dependency
yarn add @argent/get-starknet starknet
```

The package is a light wrapper around [starknet.js](https://github.com/0xs34n/starknet.js) to interact with the wallet extension. You can then use it like the following:

```javascript
import { connect } from "@argent/get-starknet"

// Let the user pick a wallet (on button click)
const starknet = connect()

// or try to connect to an approved wallet silently (on mount probably)
const starknet = connect({ showList: false })

if (!starknet) {
  throw Error("User rejected wallet selection or silent connect found nothing")
}

// (optional) connect the wallet
await starknet.enable()

// Check if connection was successful
if(starknet.isConnected) {
    // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kinds of requests through the user's wallet contract.
    starknet.account.execute({ ... })
} else {
    // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
    starknet.provider.callContract( ... )
}
```

Checkout [starknet.js](https://github.com/0xs34n/starknet.js) to learn more about how to use `Provider` and `Signer`.

## 🚀 Install from sources

First clone this repository on your machine then run:

```bash
yarn setup  # setup dependencies
yarn build  # run build process for all packages
```

Now you need to load the locally built chrome extension into your browser, by loading an unpacked extension from path `packages/extension/dist`:

### Chrome

1. Open the Extension Management page by navigating to `chrome://extensions`.
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
3. Click the Load unpacked button and select the extension directory.

![Chrome screenshot of setup](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/vOu7iPbaapkALed96rzN.png?auto=format)

[Source](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest)

### Firefox

1. Open the Extension Management page by navigating to `about:debugging#/runtime/this-firefox`
2. Select the `manifest.json` from the dist folder

[Source](https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html)

## 👩🏾‍💻 Development

To contribute to this repository please read the [contributing guidelines](Contributing.md) first.

To setup the repo on your machine just run:

```bash
yarn setup # setup dependencies
yarn dev   # run build process for all packages in watch mode
```

This project contains 3 packages:

| package | description |
| --- | --- |
| extension | Argent X extension |
| get-starknet | npm module to get started with starknet.js and Argent X quickly |
| dapp | example dapp for testing purposes and example for dapps how to use `get-starknet` |

To test changes made to the `extension` package you need to load the local unpacked extension into Chrome as [described above](#install-fromsources). Changes are shown after reopening the extension. Changes to `background.js` are just shown after a complete restart of the Chrome process.

## 🧪 Testing

### Setup

Some tests require [`starknet-devnet`](https://github.com/Shard-Labs/starknet-devnet) to be available at http://127.0.0.1:5050/. If tests are run without then you may see errors including `connect ECONNREFUSED 127.0.0.1:5050`.

### Run devnet locally

For convenience this service can be started with [Docker desktop](https://www.docker.com/get-started/) running;

- For ARM computers (e.g. Mac computers with Apple silicon)

  ```bash
  docker run -it -p 5050:5050 shardlabs/starknet-devnet:latest-arm-seed0
  ```

- Otherwise

  ```bash
  docker run -it -p 5050:5050 shardlabs/starknet-devnet:latest-seed0
  ```

### Run tests

```bash
yarn test      # run unit tests for all packages
yarn test:e2e  # run end-to-end tests for all packages
```

### Tools to help with testing

See also [/docs/tools-for-local-testing.md](/docs/tools-for-local-testing.md)

## ✏️ Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## ❤️ Family and friends

Since this project would not have been possible without [starknet.js](https://github.com/seanjameshan/starknet.js), we would like to say a big thank you to all [starknet.js contributors](https://github.com/0xs34n/starknet.js/graphs/contributors) and [@0xs34n](https://github.com/0xs34n) for starting it.

One more thank you to the StarkWare Team.

## 👨🏼‍🎨 Authors and license

[Argent](https://github.com/argentlabs) and [contributors](https://github.com/argentlabs/argent-x/graphs/contributors).

GNU General Public License V3, see the included [License.md](License.md) file.
