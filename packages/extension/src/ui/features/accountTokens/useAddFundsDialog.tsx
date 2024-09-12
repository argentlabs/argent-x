import { AlertDialog } from "@argent/x-ui"
import { useDisclosure } from "@chakra-ui/react"
import { noop } from "lodash-es"
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react"
import { To, useNavigate } from "react-router-dom"

import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { useDefaultFeeToken } from "../actions/useDefaultFeeToken"
import { SendQuery, isSendQuery } from "../../../shared/send/schema"
import { useTokensWithBalance } from "./tokens.state"
import { useIsAccountDeploying } from "./useIsAccountDeploying"
import { WalletAccount } from "../../../shared/wallet.model"

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
  const tokenDetails = useTokensWithBalance(account)
  const bestFeeToken = useDefaultFeeToken(account)

  const hasNonZeroBalance = useMemo(() => {
    return tokenDetails.some(({ balance }) => balance && balance > 0n)
  }, [tokenDetails])

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
              tokenAddress: bestFeeToken?.address ?? ETH_TOKEN_ADDRESS,
            }),
          )
        }
      } else {
        onOpen()
      }
    },
    [
      accountIsDeploying,
      bestFeeToken?.address,
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
