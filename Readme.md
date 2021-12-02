<!-- logo -->
<p align="center">
  <img src="https://raw.githubusercontent.com/argentlabs/argent-x/HEAD/assets/readme-header.png">
</p>

---

<h3 align='center' style='margin: 1em;'>⬇️ Get <b>ArgentX</b> for StarkNet today:</h3>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb/">
    <img src="https://raw.githubusercontent.com/argentlabs/argent-x/HEAD/packages/get-starknet/src/button-download.svg">
  </a>
</p>



---

<h2>🌈 Table of contents</h2>

- [🧒 Example dapp](#-example-dapp)
- [🌐 Usage with your dapp](#-usage-with-your-dapp)
- [🚀 Install from sources](#-install-from-sources)
- [👩🏾‍💻 Development](#-development)
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

The package is a light wrapper around [starknet.js](https://github.com/seanjameshan/starknet.js) to interact with the wallet extension. You can then use it like the following:

```javascript
import { getStarknet } from "@argent/get-starknet"

// check if wallet extension is installed and initialized. Shows a modal prompting the user to download ArgentX otherwise.
const starknet = getStarknet({ showModal: true })
const [userWalletContractAddress] = await starknet.enable() // may throws when no extension is detected

// check if connection was successful
if(starknet.isConnected) {
    // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kind of requests through the users wallet contract.
    starknet.signer.invokeFunction({ ... })
} else {
    // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
    starknet.provider.callContract( ... )
}
```

Checkout [starknet.js](https://github.com/seanjameshan/starknet.js) to learn more about how to use `Provider` and `Signer`.

## 🚀 Install from sources

First clone this repository on your machine then run:

```bash
yarn      # setup dependencies
yarn build  # run build process for all packages
```

Now you need to load the locally build chrome extension into your browser, by loading an unpacked extension from path `packages/extension/dist`:

1. Open the Extension Management page by navigating to `chrome://extensions`.
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
3. Click the Load unpacked button and select the extension directory.

![Chrome screenshot of setup](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/vOu7iPbaapkALed96rzN.png?auto=format)

[Source](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest)

## 👩🏾‍💻 Development

To contribute to this repository please read the [contributing guidelines](Contributing.md) first.

To setup the repo on your machine just run:

```bash
yarn      # setup dependencies
yarn dev  # run build process for all packages in watch mode
```

This project contains 3 packages:

| package | description |
| --- | --- |
| extension | ArgentX extension |
| get-starknet | npm module to get started with starknet.js and ArgentX quickly |
| playground | example dapp for testing purposes and example for DApps how to use `get-starknet` |

To test changes made to the `extension` package you need to load the local unpacked extension into Chrome as [described above](#install-fromsources). Changes are shown after reopening the extension. Changes to `background.js` are just shown after a complete restart of the Chrome process.

## ✏️ Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## ❤️ Family and friends

Since this project were not possible without [starknet.js](https://github.com/seanjameshan/starknet.js) a big thank you to all [starknet.js contributors](https://github.com/seanjameshan/starknet.js/graphs/contributors) and [@seanjameshan](https://github.com/seanjameshan) for starting it.

One more thank you to the StarkWare Team and Discord.

## 👨🏼‍🎨 Authors and license

[Argent](https://github.com/argentlabs) and [contributors](https://github.com/argentlabs/argent-x/graphs/contributors).

GNU General Public License V3, see the included [License.md](License.md) file.
