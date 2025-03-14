import type { FC, PropsWithChildren } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { Box } from "@chakra-ui/icons"
import { AccountListScreenContainer } from "./AccountListScreenContainer"

/**
 * FIXME: This is a workaround to preload the many, many Atoms used by `AccountListScreenContainer`
 *
 * This works by creating a hidden AccountListScreenContainer that is rendered off-screen.
 * Rendering is triggered by calling startPreload curently in `AccountTokensBalanceContainer`.
 *
 * This causes the Atoms to be mounted and loaded, and then when the user navigates to the
 * account list screen, it will be rendered immediately because the Atoms are already
 * initialized.
 *
 * This requires further investigation to fix the underlying issue likely related to our heavy use of
 * atoms / atomFamily.
 */

interface AccountListScreenPreloadContextProps {
  startPreload: () => void
  preload: boolean
}

const AccountListScreenPreloadContext =
  createContext<AccountListScreenPreloadContextProps>({
    startPreload: () => undefined,
    preload: false,
  })

const useAccountListScreenPreloadContext = () =>
  useContext(AccountListScreenPreloadContext)

export const useStartAccountListScreenPreload = () =>
  useAccountListScreenPreloadContext()?.startPreload

const useAccountListScreenPreload = () =>
  useAccountListScreenPreloadContext()?.preload

interface AccountListScreenPreloadProviderProps
  extends PropsWithChildren,
    AccountListScreenPreloadContextProps {}

export const AccountListScreenPreloadProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [preload, setPreload] = useState(false)
  const startPreload = useCallback(() => {
    setPreload(true)
  }, [])
  const value = useMemo(
    () => ({ startPreload, preload }),
    [startPreload, preload],
  )
  return (
    <AccountListScreenPreloadContext.Provider value={value}>
      {children}
    </AccountListScreenPreloadContext.Provider>
  )
}

export const AccountListScreenContainerPreload: FC = () => {
  const preload = useAccountListScreenPreload()
  if (!preload) {
    return null
  }
  return (
    <Box display="none" aria-hidden>
      <AccountListScreenContainer />
    </Box>
  )
}
