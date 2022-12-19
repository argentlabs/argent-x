import { FC, PropsWithChildren, createContext, useContext } from "react"

import { Presentation } from "./types"

interface StackRoutesConfigProps {
  defaultPresentation: Presentation
}

const StackRoutesConfigContext =
  createContext<StackRoutesConfigProps | null>(null)

export const useStackRoutesConfig = () =>
  useContext(StackRoutesConfigContext) as StackRoutesConfigProps

interface StackContextProviderProps
  extends PropsWithChildren,
    StackRoutesConfigProps {}

export const StackRoutesConfig: FC<StackContextProviderProps> = ({
  defaultPresentation,
  children,
}) => {
  return (
    <StackRoutesConfigContext.Provider
      value={{
        defaultPresentation,
      }}
    >
      {children}
    </StackRoutesConfigContext.Provider>
  )
}
