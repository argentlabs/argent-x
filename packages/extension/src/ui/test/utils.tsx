import {
  EventEmitterProvider,
  ThemeProvider as ArgentTheme,
} from "@argent/x-ui"
import type { RenderOptions } from "@testing-library/react"
import { render } from "@testing-library/react"
import Emittery from "emittery"
import type { FC, PropsWithChildren, ReactElement } from "react"
import { MemoryRouter } from "react-router-dom"

const emitter = new Emittery()

const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ArgentTheme>
      <EventEmitterProvider emitter={emitter}>
        <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
      </EventEmitterProvider>
    </ArgentTheme>
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
