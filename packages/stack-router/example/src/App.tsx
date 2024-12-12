import { SetDarkMode, ThemeProvider as ArgentTheme } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { RootRoutes } from "./routes/RootRoutes"

const App: FC = () => {
  return (
    <ArgentTheme>
      <SetDarkMode />
      <Flex
        w="100vw"
        h="100vh"
        px={[0, "20%"]}
        overflow={"hidden"}
        bg={"black"}
        color={"white"}
        flexDirection={"column"}
      >
        <Router>
          <RootRoutes />
        </Router>
      </Flex>
    </ArgentTheme>
  )
}

export default App
