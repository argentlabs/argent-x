import { EventEmitterProvider } from "@argent/shared"
import { ThemeProvider as ArgentTheme } from "@argent/ui"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { RenderOptions, render } from "@testing-library/react"
import Emittery from "emittery"
import { FC, PropsWithChildren, ReactElement } from "react"
import { MemoryRouter } from "react-router-dom"

import { ThemeProvider, muiTheme } from "../theme"

/**
 * TODO: remove after refactor: this provides a convenience for testing components that still use Mui etc.
 *
 * @see https://testing-library.com/docs/react-testing-library/setup/
 */

const emitter = new Emittery()

const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider>
        <ArgentTheme>
          <EventEmitterProvider emitter={emitter}>
            <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
          </EventEmitterProvider>
        </ArgentTheme>
      </ThemeProvider>
    </MuiThemeProvider>
  )
}

const renderWithLegacyProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: Wrapper, ...options })

// re-export everything
export * from "@testing-library/react"

// override render method
export { renderWithLegacyProviders }
