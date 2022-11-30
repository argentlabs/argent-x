import { ThemeProvider } from "@argent/ui"
import { AppProps } from "next/app"

import { useAccountMessageHandler } from "../hooks/useMessages"

function MyApp({ Component, pageProps }: AppProps) {
  useAccountMessageHandler()

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
