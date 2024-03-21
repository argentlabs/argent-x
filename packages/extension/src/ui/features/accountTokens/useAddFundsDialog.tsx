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

import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { Account } from "../accounts/Account"
import { SendQuery, isSendQuery } from "../send/schema"
import { useTokensWithBalance } from "./tokens.state"
import { useAccountIsDeployed } from "./useAccountStatus"
import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"
import { useBestFeeToken } from "../actions/useBestFeeToken"

interface AddFundsDialogContextProps {
  onSend: (queryOrTo?: SendQuery | To) => void
}

const AddFundsDialogContext = createContext<AddFundsDialogContextProps | null>(
  null,
)

export const useAddFundsDialogContext = () => useContext(AddFundsDialogContext)

export const useAddFundsDialogSend = () =>
  useAddFundsDialogContext()?.onSend ?? noop

interface AddFundsDialogProviderProps extends PropsWithChildren {
  account: Account
}

export const AddFundsDialogProvider: FC<AddFundsDialogProviderProps> = ({
  account,
  children,
}) => {
  const navigate = useNavigate()
  const accountIsDeployed = useAccountIsDeployed(account)
  const returnTo = useCurrentPathnameWithQuery()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const tokenDetails = useTokensWithBalance(account)
  const bestFeeToken = useBestFeeToken(account)

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
      if (accountIsDeployed && hasNonZeroBalance) {
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
      accountIsDeployed,
      bestFeeToken?.address,
      hasNonZeroBalance,
      navigate,
      onOpen,
      returnTo,
    ],
  )

  const { title, message, cancelTitle, onConfirm } = useMemo(() => {
    if (accountIsDeployed) {
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
  }, [accountIsDeployed, onAddFunds])

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
