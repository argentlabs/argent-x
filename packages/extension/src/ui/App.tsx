import { ThemeProvider, createTheme } from "@mui/material"
import { FC, Suspense, useEffect, useState } from "react"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { AppRoutes } from "./AppRoutes"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { isInTab } from "./features/recovery/useCustomNavigate"
import { swrCacheProvider } from "./utils/swrCache"

const GlobalStyleWithFixedDimensions = createGlobalStyle`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;
    color: white;
  }

  html, body {
    width: 360px;
    height: 600px;
    
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

const OverwriteDimensionsToMinDimensions = createGlobalStyle`
  html, body {
    width: unset;
    height: unset;
    min-width: 360px;
    min-height: 600px;
  }
`

const GlobalStyle: FC = () => {
  const [isTab, setIsTab] = useState(false)
  useEffect(() => {
    isInTab().then(setIsTab)
  }, [])
  return (
    <>
      <GlobalStyleWithFixedDimensions />
      {isTab && <OverwriteDimensionsToMinDimensions />}
    </>
  )
}

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
