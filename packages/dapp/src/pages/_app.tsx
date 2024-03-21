import type { AppProps } from "next/app"
import { ThemeProvider } from "@argent/x-ui"
import { FC } from "react"

const GlobalStyle: FC = () => {
  return (
    <>
      <style>
        {`
          html, body {
            background-color: #333;
          }

          * {
            font-family: Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
            -webkit-font-smoothing: antialiased;
          }
        `}
      </style>
    </>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
