import { ThemeProvider } from "@argent/ui"
import { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
