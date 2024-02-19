# Migration from 2.x to 3.x

## Major breaking changes

### in Argent X:

- Accounts are now upgradable, i.e. every account is now a proxy account forwarding to a given implementation
- Support for new account interface in Cairo (multicall, fees, ...)
- New backup file structure
- Small changes in `starknet` object injected in the browser (see below)

### in starknet.js

- Redefinition of [Signer](https://github.com/0xs34n/starknet.js/blob/develop/src/signer/interface.ts) and [Account](https://github.com/0xs34n/starknet.js/blob/develop/src/account/interface.ts) objects
- Support for new account interface in Cairo (multicall, fees, ...)

## What does it mean as an Argent X user?

As a new user, you have nothing to do, enjoy Argent X 3.0.0!

As a user of Argent X 2.x, after upgrading to version 3.0.0, your extension will start as a fresh new install where you'll have to create new accounts. If you want to migrate assets from your old accounts (which you don't have to), here is the procedure:

1. After installing Argent X 3.0.0 and opening the extension, you'll have a one-time opportunity to download your old backup file, do it!

2. Continue the onboarding flow and a fresh new account will be created, take note of the address of this new account, you'll transfer all your assets from your old accounts there.

3. Download the zip file of Argent X 2.2.3, it's available [here](https://github.com/argentlabs/argent-x/releases/download/v2.3.0/argent-extension-v2.3.0.zip) on our github repository. Install it manually into your Chrome by:

   - Going to [chrome://extensions/](chrome://extensions/)
   - Enabling `Developer mode` (upper right)
   - Unzipping the previously downloaded file
   - Clicking `Load unpacked` and choosing the `dist` folder just unzipped

   Now you should have two versions of Argent X installed simultaneously!

4. Disable Argent X 3.0.0 by switching off the toggle in the lower right corner of the Argent X panel in the Chrome extensions page.

5. Open the extension v2.2.3 and restore from your backup file, the one you downloaded in step 1. Now you can transfer all your tokens to your new address, the one you copied at step 2. For ERC721 assets, you'll have to do it in [Voyager](https://voyager.online/), the Starknet block explorer, by connecting your wallet and transferring manually.

## What does it mean as a Starknet dapp developer?

The `starknet` object (returned by `get-starknet`) will now expose an `account` object instead of a `signer` object. This `account` object implements the [AccountInterface](https://github.com/0xs34n/starknet.js/blob/develop/src/account/interface.ts), specifically it exposes the methods `execute()` and `signMessage()`:

```typescript
public abstract execute(transactions: Call | Call[], abis?: Abi[], transactionsDetail?: InvocationsDetails): Promise<AddTransactionResponse>;

public abstract signMessage(typedData: TypedData): Promise<Signature>;
```

where `Call` is defined by:

```typescript
interface Call {
  contractAddress: string
  entrypoint: string
  calldata?: BigNumberish[]
}
```

All transactions triggered by an account should go through the `execute` method. It supports multi calls, which means multiple contract interactions can be submitted in a single transaction (like bundling an ERC20 `approve` followed by a call to a contract). The `entrypoint` property is the actual name of the method (i.e. `mint`, `transfer`, ...) instead of its selector. If ABIs are provided, the signature request will show an explicit definition of the transaction.

## Backwards compatibility

The `Signer` object is backwards compatible but the `Provider` is not, so dapps using the `Provider` injected by the extension should update their code as soon as possible.

## Code migration from starknet.js v2 to v3

On the left: starknet.js v2, on the right: starknet.js v3

![Migration changes](/docs/v3-code-migration.png)
