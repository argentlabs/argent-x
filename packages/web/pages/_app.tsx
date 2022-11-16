import { ThemeProvider } from "@argent/ui"
import { AppProps } from "next/app"

import { usePageGuard } from "../hooks/usePageGuard"

function MyApp({ Component, pageProps }: AppProps) {
  usePageGuard()

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
