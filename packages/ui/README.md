# UI

Shared theme and components using [chakra](https://chakra-ui.com/)

This library also contains legacy global styles, styled-components and Mui themes which will eventually be removed.

## Usage

### Set up the global theme

```tsx
import {
  FixedGlobalStyle,
  ThemeProvider,
  ThemedGlobalStyle,
  chakraTheme,
  muiTheme
} from "@argent-x/ui/src/theme"
import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"

export const App: FC = () => {
  return (
    <>
      <FixedGlobalStyle />
      <ChakraProvider theme={chakraTheme}>
        <MuiThemeProvider theme={muiTheme}>
          <ThemeProvider>
            <ThemedGlobalStyle />
            <MyApp />
          </ThemeProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </>
  )
}
```

### Theme and utilities

The theme contains standard set of attributes which are accessed using a name or key as decribed by chakra-ui. This allows the system to change the underlying values and units without changing the component markup.

See [chakra style props](https://chakra-ui.com/docs/styled-system/style-props) for examples

### Components

You can use primitives and components from chakra - see [chakra components](https://chakra-ui.com/docs/components) for examples

Custom components and examples unique to this package are in storybook

```bash
yarn storybook
```
