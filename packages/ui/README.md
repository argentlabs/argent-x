# UI

Shared theme and components

## Usage

### Set up the global theme

```tsx
import {
  FixedGlobalStyle,
  ThemeProvider,
  ThemedGlobalStyle
} from "@argent-x/ui/src/theme"

export const App: FC = () => {
  return (
    <>
      <FixedGlobalStyle />
      <ThemeProvider>
        <ThemedGlobalStyle />
        <MyApp />
      </ThemeProvider>
    </>
  )
}
```

### Theme

The theme contains standard set of attributes which are accessed using a name or key. This allows the system to change the underlying values and units without changing the markup.

- Spacing number 5 `theme.spacings[5]`
- Standard font size `theme.fontSizes['base']`
- A large font size `theme.fontSizes['5xl']`

### Utilities

The package contains a small set of both `css` and component-level utility functions providing shorthand to specify common component attributes:

```tsx
import { utilities, fontSize, padding } from "@argent-x/ui/src/theme/utilities"

/** The folllowing examples will all have equivalent styles */

/** a component using styled-components to access theme properties */
const VanillaBox = styled.div`
  padding: ${({ theme }) => theme.spacings[5]};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
`

/** a component using css functions to access theme properties */
const CssUtilitiesBox = styled.div`
  ${padding(5)}
  ${fontSize('2xl')}
`

/** a component enhanced with component utilities */
const ComponentUtilitiesBox = styled.div`
  ${utilities}
`

/** component utilities are used as props on the enhanced component */
<ComponentUtilitiesBox padding={5} fontSize={'2xl'} />

```

### Utilities and breakpoints

The utility functions also accept an array which will be mapped to the breakpoints in the order specified in the theme.

```tsx
/** both examples will have 'mobile-first' padding 1 and fontSize 2xl by default, then padding 5 and fontSize 5xl at the first theme breakpoint up */

const ResponsiveCssUtilitiesBox = styled.div`
  ${padding([1, 5])}
  ${fontSize(['2xl', '5xl'])}
`

const ResponsiveComponentUtilitiesBox = styled.div`
  ${utilities}
`

<ResponsiveComponentUtilitiesBox padding={[1, 5]} fontSize={['2xl', '5xl']} />

```
