import { useMachine } from "@xstate/react"
import { Suspense } from "react"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"

import { AccountListScreen } from "./screens/AccountListScreen"
import { AccountScreen } from "./screens/AccountScreen"
import { AddTokenScreen } from "./screens/AddTokenScreen"
import { ApproveTransactionScreen } from "./screens/ApproveTransactionScreen"
import { ConnectScreen } from "./screens/ConnectScreen"
import { DisclaimerScreen } from "./screens/DisclaimerScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { NewSeedScreen } from "./screens/NewSeedScreen"
import { PasswordScreen } from "./screens/PasswordScreen"
import { ResetScreen } from "./screens/ResetScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { SuccessScreen } from "./screens/SuccessScreen"
import { TokenScreen } from "./screens/TokenScreen"
import { UploadKeystoreScreen } from "./screens/UploadKeystoreScreen"
import { WelcomeScreen } from "./screens/WelcomeScreen"
import { routerMachine } from "./states/RouterMachine"
import { TokenDetails } from "./utils/tokens"

async function fileToString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      const result = event?.target?.result
      if (result) {
        resolve(result.toString())
      } else {
        reject("Failed to read file")
      }
    }
    fileReader.onerror = reject
    fileReader.readAsText(file)
  })
}

function App() {
  const [state, send] = useMachine(routerMachine)
  if (state.matches("welcome"))
    return (
      <WelcomeScreen
        onPrimaryBtnClick={() => {
          send("SHOW_CREATE_NEW")
        }}
        onSecondaryBtnClick={() => {
          send("SHOW_RECOVER")
        }}
      />
    )

  if (state.matches("newSeed"))
    return (
      <NewSeedScreen
        onSubmit={(password) => {
          send({ type: "GENERATE_L1", data: { password } })
        }}
        onBack={() => {
          send("GO_BACK")
        }}
      />
    )

  if (state.matches("enterPassword"))
    return (
      <PasswordScreen
        onSubmit={(password) => {
          send({ type: "SUBMIT_PASSWORD", data: { password } })
        }}
        onForgotPassword={() => send("FORGOT_PASSWORD")}
        error={state.context.error}
      />
    )

  if (state.matches("uploadKeystore"))
    return (
      <UploadKeystoreScreen
        onSubmit={async (file) => {
          send({ type: "SUBMIT_KEYSTORE", data: await fileToString(file) })
        }}
        onBack={() => {
          send("GO_BACK")
        }}
      />
    )

  if (state.matches("approveTx"))
    return (
      <ApproveTransactionScreen
        transaction={state.context.txToApprove}
        onSubmit={async () => {
          send({ type: "APPROVED_TX" })
        }}
        onReject={async () => {
          send("REJECT_TX")
        }}
      />
    )

  if (state.matches("submittedTx"))
    return (
      <SuccessScreen
        networkId={state.context.networkId}
        txHash={state.context.txHash}
      />
    )

  if (state.matches("connect"))
    return (
      <ConnectScreen
        host={state.context.hostToWhitelist}
        onReject={() => {
          send("REJECT")
        }}
        onSubmit={() => {
          send("AGREE")
        }}
      />
    )

  if (state.matches("disclaimer"))
    return <DisclaimerScreen onSubmit={() => send("AGREE")} />

  if (state.matches("settings"))
    return <SettingsScreen onBack={() => send("GO_BACK")} />

  if (state.matches("account")) {
    return (
      <AccountScreen
        onShowAccountList={() => send("SHOW_ACCOUNT_LIST")}
        onShowToken={(token: TokenDetails) =>
          send({ type: "SHOW_TOKEN", data: token })
        }
        onAddToken={() => send("SHOW_ADD_TOKEN")}
        wallet={state.context.wallets[state.context.selectedWallet]}
        accountNumber={
          Object.keys(state.context.wallets).findIndex(
            (wallet) => wallet === state.context.selectedWallet,
          ) + 1
        }
        onAction={(tokenAddress, action) => {
          if (action.type === "MINT") {
            send({
              type: "APPROVE_TX",
              data: {
                to: tokenAddress,
                method: "mint",
                calldata: {
                  recipient: state.context.selectedWallet,
                  amount: action.amount.toHexString(),
                },
              },
            })
          } else if (action.type === "TRANSFER") {
            send({
              type: "APPROVE_TX",
              data: {
                to: tokenAddress,
                method: "transfer",
                calldata: {
                  recipient: action.to,
                  amount: action.amount.toHexString(),
                },
              },
            })
          }
        }}
        networkId={state.context.networkId}
        onChangeNetwork={(networkId) => {
          send({ type: "CHANGE_NETWORK", data: networkId })
        }}
      />
    )
  }

  if (state.matches("accountList")) {
    return (
      <AccountListScreen
        wallets={Object.values(state.context.wallets)}
        activeWallet={state.context.selectedWallet}
        onAddAccount={() => send("ADD_WALLET")}
        onSettings={() => send("SHOW_SETTINGS")}
        onAccountSelect={(address) => {
          send({ type: "SELECT_WALLET", data: address })
        }}
        networkId={state.context.networkId}
        onChangeNetwork={(networkId) => {
          send({ type: "CHANGE_NETWORK", data: networkId })
        }}
      />
    )
  }

  if (state.matches("token"))
    return (
      <TokenScreen
        token={state.context.selectedToken}
        onBack={() => {
          send("GO_BACK")
        }}
        onTransfer={(tokenAddress, recipient, amount) => {
          send({
            type: "APPROVE_TX",
            data: {
              to: tokenAddress,
              method: "transfer",
              calldata: {
                recipient,
                amount: amount.toHexString(),
              },
            },
          })
        }}
      />
    )

  if (state.matches("addToken"))
    return (
      <AddTokenScreen
        walletAddress={state.context.selectedWallet}
        onBack={() => {
          send("GO_BACK")
        }}
        onSubmit={(tokenDetails) => {
          send({ type: "ADD_TOKEN", data: tokenDetails })
        }}
      />
    )

  if (state.matches("reset"))
    return (
      <ResetScreen
        onSubmit={() => send("RESET")}
        onReject={() => send("GO_BACK")}
      />
    )

  return <LoadingScreen />
}

const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;;
    color: white;

    min-width: 320px;
    min-height: 568px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }
`

export default () => (
  <Suspense fallback={<LoadingScreen />}>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
      rel="stylesheet"
    />
    <GlobalStyle />
    <App />
  </Suspense>
)
