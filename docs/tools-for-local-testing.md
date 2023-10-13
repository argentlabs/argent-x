# 🧪 Tools for local testing

## ⬆️ Contract upgrades

To help test contract upgrades there is a simple script which will declare an upgradable contract on the locally running devnet and allow you to transfer funds to a local wallet.

- Make sure you have devnet running locally (see [Readme](../Readme.md#setup))

- Start the tool and declare the contract (make note of the contract class hash for later)

  ```bash
  # switch to Node 18
  nvm use 18

  # start the tool
  pnpm devnet:upgrade-helper
  ```

- Set the contract class hash in Settings → Manage Networks → Localhost → Advanced

- You should then see that an account upgrade is available

- Transfer some ETH to your local wallet so you have funds to upgrade

- You can reset the contract class hash to make upgrade available again
