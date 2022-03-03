# Migration from 2.x to 3.x

## Major breaking changes

### in Argent X:
* Accounts are now upgradable, i.e. every account is now a proxy account forwarding to a given implentation
* Support for new account interface in Cairo (multicall, fees, ...)
* New backup file structure
* Small changes in `starknet` object injected in the browser (see below)

### in starknet.js
* Redefinition of [Signer](https://github.com/0xs34n/starknet.js/blob/develop/src/signer/interface.ts) and [Account](https://github.com/0xs34n/starknet.js/blob/develop/src/account/interface.ts) objects
* Support for new account interface in Cairo (multicall, fees, ...)

## What does it mean as an Argent X user?

As a new user, you have nothing to do, enjoy Argent X 3.0.0!

As a user of Argent X 2.x, after upgrading to version 3.0.0, your extension will start as a fresh new install where you'll have to create new accounts. If you want to migrate assets (you don't have too) from your old accounts, here is the procedure:

1. After installing Argent X 3.0.0 and opening the extension, you'll have a one-time the oppurtinity to download your old backup file, do it!
   
2. Continue the onboarding flow and a fresh new account will be created, take note of the address of this new account, you'll transfer all your assets from your old accounts there.
   
3. Download the zip file of Argent X 2.2.3, it's available [here](https://github.com/argentlabs/argent-x/releases/download/v2.3.0/argent-extension-v2.3.0.zip) on our github repository. Install it in chrome at [chrome://extensions/](chrome://extensions/) (you'll have to enable the developper mode). Now you should have two Argent X extensions installed!
   
4. Disable Argent X 3.0.0 by switching the toggle off
   
5. Launch the extension and restore from your backup file, the one you downloaded in step 1. Now you can transfer all your tokens to your new address, the one you copied at step 2. For ERC721 assets, you'll have to do it in [Voyager](https://voyager.online/), the Starknet block explorer, by connecting your wallet and transferring manually.

## What does it mean as a Starknet Dapp developer?

The `starknet` object (returned by `get-starknet`) will now expose an `account` object instead of a `signer` object.
This `account` object implements the [AccountInterface](https://github.com/0xs34n/starknet.js/blob/develop/src/account/interface.ts), specifically it exposes the methods `execute()` and  `signMessage()`:

```
public abstract execute(transactions: Call | Call[], abis?: Abi[], transactionsDetail?: InvocationsDetails): Promise<AddTransactionResponse>;

public abstract signMessage(typedData: TypedData): Promise<Signature>;
```
where `Call` is defined by:
```
declare type Call = {
    contractAddress: string;
    entrypoint: string;
    calldata?: BigNumberish[];
}
```

All transactions triggered by an account should go through the `execute` method. It supports multi calls, which means multiple contract interactions can be submitted in a single transactions (like bundling an approve ERC20 and a call to a contract). The property `entrypoint` is the actual name of the method (i.e. `mint`, `transfer`, ....). If ABIs are provided, the signature request will show an explicit definition of the transaction.