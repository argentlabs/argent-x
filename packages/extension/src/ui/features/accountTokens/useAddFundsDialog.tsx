import { AlertDialog } from "@argent/x-ui"
import { useDisclosure } from "@chakra-ui/react"
import { noop } from "lodash-es"
import type { FC, PropsWithChildren } from "react"
import { createContext, useCallback, useContext, useMemo } from "react"
import type { To } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import type { SendQuery } from "../../../shared/send/schema"
import { isSendQuery } from "../../../shared/send/schema"
import { useIsAccountDeploying } from "./useIsAccountDeploying"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useHasNonZeroBalance } from "./useHasNonZeroBalance"
import { useNativeFeeTokenAddress } from "../actions/useNativeFeeToken"

interface AddFundsDialogContextProps {
  onSend: (queryOrTo?: SendQuery | To) => void
}

const AddFundsDialogContext = createContext<AddFundsDialogContextProps | null>(
  null,
)

const useAddFundsDialogContext = () => useContext(AddFundsDialogContext)

export const useAddFundsDialogSend = () =>
  useAddFundsDialogContext()?.onSend ?? noop

interface AddFundsDialogProviderProps extends PropsWithChildren {
  account?: WalletAccount
}

export const AddFundsDialogProvider: FC<AddFundsDialogProviderProps> = ({
  account,
  children,
}) => {
  const navigate = useNavigate()
  const accountIsDeploying = useIsAccountDeploying(account)
  const returnTo = useCurrentPathnameWithQuery()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const feeTokenAddress = useNativeFeeTokenAddress(account)

  const hasNonZeroBalance = useHasNonZeroBalance(account)

  const onAddFunds = useCallback(() => {
    onClose()
    navigate(routes.funding())
  }, [navigate, onClose])

  const onSend = useCallback(
    (queryOrTo?: SendQuery | To) => {
      /** tokenDetailsIsInitialising - balance is unknown, let the Send screen deal with it */
      if (!accountIsDeploying && hasNonZeroBalance) {
        if (isSendQuery(queryOrTo)) {
          navigate(
            routes.sendRecipientScreen({
              ...queryOrTo,
              returnTo,
            }),
          )
        } else {
          navigate(
            routes.sendRecipientScreen({
              returnTo,
              tokenAddress: feeTokenAddress,
            }),
          )
        }
      } else {
        onOpen()
      }
    },
    [
      accountIsDeploying,
      feeTokenAddress,
      hasNonZeroBalance,
      navigate,
      onOpen,
      returnTo,
    ],
  )

  const { title, message, cancelTitle, onConfirm } = useMemo(() => {
    if (!accountIsDeploying) {
      return {
        title: "Add funds",
        message: `You need to add funds to this account before you can send`,
        onConfirm: onAddFunds,
      }
    }
    return {
      title: "Deploying",
      message: `You need to wait for this account to deploy before you can send`,
      cancelTitle: "OK",
    }
  }, [accountIsDeploying, onAddFunds])

  return (
    <AddFundsDialogContext.Provider
      value={{
        onSend,
      }}
    >
      <AlertDialog
        isOpen={isOpen}
        title={title}
        message={message}
        cancelTitle={cancelTitle}
        onCancel={onClose}
        confirmTitle="Add funds"
        onConfirm={onConfirm}
      />
      {children}
    </AddFundsDialogContext.Provider>
  )
}
