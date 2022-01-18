import { BigNumber } from "@ethersproject/bignumber"
import { FC, Suspense, useState } from "react"
import { Link, Route, Routes, useNavigate } from "react-router-dom"
import { uint256 } from "starknet"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { waitForMessage } from "../shared/messages"
import { routes } from "./routes"
import { AccountListScreen } from "./screens/AccountListScreen"
import { AccountScreen } from "./screens/AccountScreen"
import { AddTokenScreen } from "./screens/AddTokenScreen"
import { ApproveSignScreen } from "./screens/ApproveSignScreen"
import { ApproveTransactionScreen } from "./screens/ApproveTransactionScreen"
import { ConnectScreen } from "./screens/ConnectScreen"
import { DisclaimerScreen } from "./screens/DisclaimerScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { NewSeedScreen } from "./screens/NewSeedScreen"
import { PasswordScreen } from "./screens/PasswordScreen"
import { ResetScreen } from "./screens/ResetScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { TokenScreen } from "./screens/TokenScreen"
import { UploadKeystoreScreen } from "./screens/UploadKeystoreScreen"
import { WelcomeScreen } from "./screens/WelcomeScreen"
import { useActions } from "./states/actions"
import { useGlobalState } from "./states/global"
import { swrCacheProvider } from "./utils/swrCache"
import { TokenDetails, addToken } from "./utils/tokens"

function getUint256CalldataFromBN(bn: BigNumber) {
  return {
    type: "struct" as const,
    ...uint256.bnToUint256(bn.toHexString()),
  }
}

const App: FC = () => {
  const { showLoading } = useGlobalState()
  const navigate = useNavigate()
  const { actions, approve, reject } = useActions()

  if (showLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path={routes.welcome} element={<WelcomeScreen />} />
      <Route path={routes.newAccount} element={<NewSeedScreen />} />
      <Route path={routes.deployAccount} element={<NewSeedScreen />} />
      <Route path={routes.recoverBackup} element={<UploadKeystoreScreen />} />
      <Route path={routes.password} element={<PasswordScreen />} />
      <Route path={routes.reset} element={<ResetScreen />} />
      <Route path={routes.disclaimer} element={<DisclaimerScreen />} />
      <Route path={routes.settings} element={<SettingsScreen />} />
    </Routes>
  )

  /*

  if (state.matches("settings"))
    return (
      <SettingsScreen
        onBack={() => send("GO_BACK")}
        onLock={() => send("LOCK")}
        port={state.context.localhostPort}
        onPortChange={(port) => send({ type: "CHANGE_PORT", data: port })}
      />
    )

  if (
    (state.matches("account") ||
      state.matches("accountList") ||
      state.matches("token") ||
      state.matches("addToken")) &&
    actions[0]
  ) {
    const action = actions[0]
    const isLastAction = actions.length === 1
    switch (action.type) {
      case "CONNECT":
        return (
          <ConnectScreen
            host={action.payload.host}
            onReject={async () => {
              await reject(action)
              if (isPopup && isLastAction) window.close()
            }}
            onSubmit={async () => {
              await approve(action)
              if (isPopup && isLastAction) window.close()
            }}
            port={state.context.localhostPort}
          />
        )
      case "ADD_TOKEN": {
        return (
          <AddTokenScreen
            walletAddress={state.context.selectedWallet}
            networkId={state.context.networkId}
            defaultToken={action.payload}
            onSubmit={async (tokenDetails) => {
              if (state.context.selectedWallet) {
                addToken(state.context.selectedWallet, tokenDetails)
              }
              await approve(action)
              if (isPopup && isLastAction) window.close()
            }}
            onReject={async () => {
              await reject(action)
              if (isPopup && isLastAction) window.close()
            }}
          />
        )
      }
      case "TRANSACTION":
        return (
          <ApproveTransactionScreen
            transaction={action.payload}
            onSubmit={async () => {
              await approve(action)
              setShowLoading(true)
              await waitForMessage(
                "SUBMITTED_TX",
                ({ data }) => data.actionHash === action.meta.hash,
              )
              if (isPopup && isLastAction) window.close()
              setShowLoading(false)
            }}
            onReject={async () => {
              await reject(action)
              if (isPopup && isLastAction) window.close()
            }}
            selectedAccount={{
              accountNumber:
                Object.keys(state.context.wallets).findIndex(
                  (wallet) => wallet === state.context.selectedWallet,
                ) + 1,
              networkId: state.context.networkId,
            }}
            port={state.context.localhostPort}
          />
        )
      case "SIGN":
        return (
          <ApproveSignScreen
            dataToSign={action.payload}
            onSubmit={async () => {
              await approve(action)
              setShowLoading(true)
              await waitForMessage(
                "SUCCESS_SIGN",
                ({ data }) => data.actionHash === action.meta.hash,
              )
              if (isPopup && isLastAction) window.close()
              setShowLoading(false)
            }}
            onReject={async () => {
              await reject(action)
              if (isPopup && isLastAction) window.close()
            }}
            selectedAccount={{
              accountNumber:
                Object.keys(state.context.wallets).findIndex(
                  (wallet) => wallet === state.context.selectedWallet,
                ) + 1,
              networkId: state.context.networkId,
            }}
            port={state.context.localhostPort}
          />
        )
    }
  }

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
                  amount: getUint256CalldataFromBN(action.amount),
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
                  amount: getUint256CalldataFromBN(action.amount),
                },
              },
            })
          }
        }}
        networkId={state.context.networkId}
        onChangeNetwork={(networkId) => {
          send({ type: "CHANGE_NETWORK", data: networkId })
        }}
        port={state.context.localhostPort}
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
        port={state.context.localhostPort}
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
                amount: getUint256CalldataFromBN(amount),
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
        networkId={state.context.networkId}
        onBack={() => {
          send("GO_BACK")
        }}
        onSubmit={(tokenDetails) => {
          send({ type: "ADD_TOKEN", data: tokenDetails })
        }}
      />
    )

    */
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
  <SWRConfig value={{ provider: () => swrCacheProvider }}>
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
  </SWRConfig>
)
