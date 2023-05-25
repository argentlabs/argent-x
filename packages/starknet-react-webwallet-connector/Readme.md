# `starknet-react` connector for webwallet

`@argent/starknet-react-webwallet-connector` is a convenient package for integrating Argent's Web Wallet with StarkNet applications using the starknet-react library. This connector enables you to easily connect to the Argent Web Wallet for user authentication and StarkNet-based transactions.

## Installation

To install the `@argent/starknet-react-webwallet-connector`, use the following command:

```bash
npm install @argent/starknet-react-webwallet-connector
```

## Example with `starknet-react`

```typescript
import { WebWalletConnector } from "@argent/starknet-react-webwallet-connector";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    // ...

    new WebWalletConnector(),
    // or for testnet:
    new WebWalletConnector({ url: "https://web.hydrogen.argent47.net" }),
  ];

  return (
    <StarknetConfig autoConnect connectors={connectors}>
      <Component {...pageProps} />
    </StarknetConfig>
  );
}
```

## Usage explained

To use the `@argent/starknet-react-webwallet-connector` in your application, follow the steps below:

1. Import the necessary components:

```typescript
import { WebWalletConnector } from "@argent/starknet-react-webwallet-connector";
import { StarknetConfig } from "@starknet-react/core";
```

Add the WebWalletConnector to your existing connectors array, specifying the wallet URL:

```typescript
const connectors = [
  // ...your other connectors
  new WebWalletConnector({
    url: "https://web.hydrogen.argent47.net",
  }),
];
```

Wrap your app component with the StarknetConfig component, providing the connectors array:

```typescript
function App({ Component, pageProps }) {
  return (
    <StarknetConfig autoConnect connectors={connectors}>
      <Component {...pageProps} />
    </StarknetConfig>
  );
}
```

With these changes, your application will now be able to connect to the Argent Web Wallet for user authentication and StarkNet-based transactions.
