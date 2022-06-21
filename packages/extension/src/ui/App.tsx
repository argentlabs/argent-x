import { ThemeProvider, createTheme } from "@mui/material"
import { FC, Suspense, useCallback, useEffect, useState } from "react"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { useExtensionIsInTab } from "./features/browser/tabs"
import { swrCacheProvider } from "./services/swr"

export interface GlobalStyleProps {
  extensionIsInTab: boolean
}

const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;
    color: white;
  }

  html, body {
    min-width: 360px;
    min-height: 600px;

    width: ${({ extensionIsInTab }) => (extensionIsInTab ? "unset" : "360px")};
    height: ${({ extensionIsInTab }) => (extensionIsInTab ? "unset" : "600px")};
    
    overscroll-behavior: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar { /* Chrome, Safari, Opera */
      display: none;
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`

/** @see `./theme.d.ts` for adding additional variables to the theme */
const theme = createTheme({
  palette: {
    mode: "dark",
  },
  margin: {
    extensionInTab: "10%",
  },
})

const isDev = process.env.NODE_ENV === "development"

const Thrower: FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false)
  const throwClicked = useCallback(() => {
    setShouldThrow((shouldThrow) => !shouldThrow)
  }, [])
  useEffect(() => {
    if (shouldThrow) {
      throw "Threw a manual exception"
    }
  }, [shouldThrow])
  return <button onClick={throwClicked}>Throw</button>
}

export const App: FC = () => {
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <SWRConfig value={{ provider: () => swrCacheProvider }}>
      <ThemeProvider theme={theme}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <GlobalStyle extensionIsInTab={extensionIsInTab} />
        <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
          <Suspense fallback={<LoadingScreen />}>
            <>
              {isDev && <Thrower />}
              <AppRoutes />
            </>
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </SWRConfig>
  )
}
