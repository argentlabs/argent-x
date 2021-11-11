import { useMachine } from "@xstate/react"
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Suspense } from "react"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"

import { Account } from "./screens/Account"
import { AccountListScreen } from "./screens/AccountList"
import { AddToken } from "./screens/AddToken"
import { ApproveTx } from "./screens/ApproveTx"
import { Loading } from "./screens/Loading"
import { NewSeed } from "./screens/NewSeed"
import { Password } from "./screens/Password"
import { ResetScreen } from "./screens/Reset"
import { Success } from "./screens/Success"
import { UploadKeystore } from "./screens/UploadKeystore"
import { Welcome } from "./screens/Welcome"
import { routerMachine } from "./states/RouterMachine"
import { messenger } from "./utils/messaging"

async function fileToString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      const { result } = event!.target!
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
      <Welcome
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
      <NewSeed
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
      <Password
        onSubmit={(password) => {
          send({ type: "SUBMIT_PASSWORD", data: { password } })
        }}
        onForgotPassword={() => send("FORGOT_PASSWORD")}
      />
    )

  if (state.matches("uploadKeystore"))
    return (
      <UploadKeystore
        onSubmit={async (file) => {
          send({ type: "SUBMIT_KEYSTORE", data: await fileToString(file) })
        }}
      />
    )

  if (state.matches("approveTx"))
    return (
      <ApproveTx
        tx={state.context.txToApprove}
        onSubmit={async () => {
          send({ type: "APPROVED_TX" })
        }}
      />
    )

  if (state.matches("submittedTx"))
    return <Success txHash={state.context.txHash} />

  if (state.matches("account"))
    return (
      <Account
        onShowAccountList={() => send("SHOW_ACCOUNT_LIST")}
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
      />
    )

  if (state.matches("accountList"))
    return (
      <AccountListScreen
        wallets={Object.values(state.context.wallets)}
        activeWallet={state.context.selectedWallet}
        onAddAccount={() => send("ADD_WALLET")}
        onAccountSelect={(address) => {
          send({ type: "SELECT_WALLET", data: address })
        }}
      />
    )

  if (state.matches("addToken"))
    return (
      <AddToken
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

  return <Loading />
}

const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;;
    color: white;

    width: 320px;
    height: 568px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }
`

export default () => (
  <Suspense fallback={<Loading />}>
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
