import { ThemeProvider } from "@argent/ui"
import { AppProps } from "next/app"

import { useAccountMessageHandler } from "../hooks/useMessages"
import { usePageGuard } from "../hooks/usePageGuard"

function MyApp({ Component, pageProps }: AppProps) {
  usePageGuard()
  useAccountMessageHandler()

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
