import { ThemeProvider } from "@argent/ui"
import { AppProps } from "next/app"

import { useAccountMessageHandler } from "../hooks/useMessages"

function MyApp({ Component, pageProps }: AppProps) {
  useAccountMessageHandler()

  return (
    <ThemeProvider>
      <style>
        {`
          * {
            font-family: Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
            -webkit-font-smoothing: antialiased;
          }
        `}
      </style>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
