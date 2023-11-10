# UI

Shared theme and components using [chakra](https://chakra-ui.com/)

## Usage

### Set up the global theme

```tsx
import { Button, H1, theme } from "@argent/ui"
import { ChakraProvider } from "@chakra-ui/react"
import { FC } from "react"

export const App: FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <H1>Hello world</H1>
      <Button>Click me</Button>
    </ChakraProvider>
  )
}
```

### Theme and utilities

The theme contains standard set of attributes which are accessed using a name or key as described by chakra-ui. This allows the system to change the underlying values and units without changing the component markup.

See [chakra style props](https://chakra-ui.com/docs/styled-system/style-props) for examples

### Components

You can use primitives and components from chakra - see [chakra components](https://chakra-ui.com/docs/components) for examples

Custom components and examples unique to this package are in storybook

```bash
pnpm storybook
```

### Icons

The icons in `/src/components/icons` are generated from master artwork in Figma. To regenerate these (requires an access key - see `.env`):

You can get that access token from: https://www.figma.com/developers/api#access-tokens

```bash
pnpm gen:icons
```
