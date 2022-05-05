import { ThemeProvider, createTheme } from "@mui/material"
import { FC, Suspense } from "react"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { AppRoutes } from "./AppRoutes"
import { LoadingScreen } from "./screens/LoadingScreen"
import { swrCacheProvider } from "./utils/swrCache"

const GlobalStyle = createGlobalStyle`
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

const theme = createTheme({ palette: { mode: "dark" } })

export const App: FC = () => (
  <SWRConfig value={{ provider: () => swrCacheProvider }}>
    <ThemeProvider theme={theme}>
      <Suspense fallback={<LoadingScreen />}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <GlobalStyle />
        <AppRoutes />
      </Suspense>
    </ThemeProvider>
  </SWRConfig>
)
