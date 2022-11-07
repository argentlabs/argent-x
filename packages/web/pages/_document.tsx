import { theme } from "@argent/ui"
import { ColorModeScript } from "@chakra-ui/react"
import NextDocument, { Head, Html, Main, NextScript } from "next/document"

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
