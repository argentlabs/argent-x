import type { FC, PropsWithChildren } from "react"
import { createContext, useContext } from "react"

import type { Presentation } from "./types"

interface StackRoutesConfigProps {
  defaultPresentation: Presentation
  onExitComplete?: () => void
}

const StackRoutesConfigContext = createContext<StackRoutesConfigProps | null>(
  null,
)

export const useStackRoutesConfig = () =>
  useContext(StackRoutesConfigContext) as StackRoutesConfigProps

interface StackContextProviderProps
  extends PropsWithChildren,
    StackRoutesConfigProps {}

export const StackRoutesConfig: FC<StackContextProviderProps> = ({
  defaultPresentation,
  onExitComplete,
  children,
}) => {
  return (
    <StackRoutesConfigContext.Provider
      value={{
        defaultPresentation,
        onExitComplete,
      }}
    >
      {children}
    </StackRoutesConfigContext.Provider>
  )
}
