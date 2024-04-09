import { theme } from "@argent/x-ui"
import { ColorModeScript } from "@chakra-ui/react"
import NextDocument, { Head, Html, Main, NextScript } from "next/document"

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* eslint-disable-next-line @next/next/no-title-in-document-head */}
          <title>Example dapp</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="apple-mobile-web-app-title"
            content="Argent example dapp"
          />
          <meta name="application-name" content="Argent example dapp" />
          <meta name="theme-color" content={theme.colors.primary[500]} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <ColorModeScript initialColorMode={"dark"} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
