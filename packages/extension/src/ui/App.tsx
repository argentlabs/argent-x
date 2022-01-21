import { FC, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { useEntry } from "./hooks/useEntry"
import { routes } from "./routes"
import { AccountListScreen } from "./screens/AccountListScreen"
import { AccountScreen } from "./screens/AccountScreen"
import { ActionScreen } from "./screens/ActionScreen"
import { AddTokenScreen } from "./screens/AddTokenScreen"
import { DisclaimerScreen } from "./screens/DisclaimerScreen"
import { ErrorScreen } from "./screens/ErrorScreen"
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

export const App: FC = () => (
  <SWRConfig value={{ provider: () => swrCacheProvider }}>
    <Suspense fallback={<LoadingScreen />}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <GlobalStyle />
      <Screen />
    </Suspense>
  </SWRConfig>
)

const Screen: FC = () => {
  useEntry()

  const { showLoading } = useGlobalState()
  const { actions } = useActions()

  if (showLoading) {
    return <LoadingScreen />
  }

  if (actions[0]) {
    return <ActionScreen />
  }

  return (
    <Routes>
      <Route path={routes.welcome} element={<WelcomeScreen />} />
      <Route path={routes.newAccount} element={<NewSeedScreen />} />
      <Route path={routes.deployAccount} element={<NewSeedScreen />} />
      <Route path={routes.recoverBackup} element={<UploadKeystoreScreen />} />
      <Route path={routes.password} element={<PasswordScreen />} />
      <Route path={routes.account} element={<AccountScreen />} />
      <Route path={routes.accounts} element={<AccountListScreen />} />
      <Route path={routes.newToken} element={<AddTokenScreen />} />
      <Route path={routes.tokenPath} element={<TokenScreen />} />
      <Route path={routes.reset} element={<ResetScreen />} />
      <Route path={routes.disclaimer} element={<DisclaimerScreen />} />
      <Route path={routes.settings} element={<SettingsScreen />} />
      <Route path={routes.error} element={<ErrorScreen />} />
    </Routes>
  )
}
