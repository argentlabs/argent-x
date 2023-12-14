import type { AppProps } from "next/app"
import { ThemeProvider } from "@argent/ui"
import { FC } from "react"
import { useColorModeValue } from "@chakra-ui/react"

const GlobalStyle: FC = () => {
  const bgColor = useColorModeValue("#F9F9F9", "neutrals.1000")
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
