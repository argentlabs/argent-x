import { Address, addressSchema, isEqualAddress } from "@argent/shared"
import { useToast } from "@argent/ui"
import { debounce } from "lodash-es"
import { FC, Suspense, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addAddressPadding } from "starknet"
import useSWR from "swr"
import { ZodError } from "zod"

import { getAccountIdentifier } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { AddTokenScreen, AddTokenScreenSchemaType } from "./AddTokenScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { RequestToken } from "../../../shared/token/__new/types/token.model"
import { tokenService } from "../../services/tokens"

interface AddTokenScreenContainerProps {
  hideBackButton?: boolean
  defaultToken?: RequestToken
  onSubmit?: () => void
  onReject?: () => void
}

export const AddTokenScreenContainer: FC<AddTokenScreenContainerProps> = ({
  hideBackButton,
  defaultToken,
  onSubmit,
  onReject,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const account = useView(selectedAccountView)
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)
  const toast = useToast()
  const [fetchedTokenAddress, setFetchedTokenAddress] = useState(
    defaultToken?.address,
  )

  const onTokenAddressChange = useMemo(
    () =>
      debounce((address: Address) => {
        setFetchedTokenAddress(address)
      }, 500),
    [],
  )

  const {
    data: fetchedTokenDetails,
    isValidating,
    error: fetchTokenError,
  } = useSWR(
    account && fetchedTokenAddress
      ? [
          "fetchTokenDetails",
          fetchedTokenAddress,
          getAccountIdentifier(account),
        ]
      : null,
    () => tokenService.fetchDetails(fetchedTokenAddress, account?.networkId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  const onContinue = useCallback(
    async (token: AddTokenScreenSchemaType) => {
      try {
        const addTokenData = {
          ...token,
          address: addressSchema.parse(addAddressPadding(token.address)),
          networkId: switcherNetworkId,
        }
        await tokenService.addToken(addTokenData)
        void onSubmit?.()
        navigate(routes.accountTokens())
        toast({
          title: "Token added",
          status: "success",
          duration: 1000,
        })
      } catch (e) {
        if (e instanceof ZodError) {
          throw new Error(e.issues[0].message)
        } else {
          throw new Error("Token not supported")
        }
      }
    },
    [navigate, onSubmit, switcherNetworkId, toast],
  )

  const tokenDetails = fetchedTokenDetails ?? defaultToken

  const isExistingToken = useMemo(() => {
    if (!tokenDetails) {
      return false
    }
    return tokensInNetwork.some((token) =>
      isEqualAddress(token.address, tokenDetails?.address),
    )
  }, [tokenDetails, tokensInNetwork])

  const error = fetchTokenError
    ? `Unable to validate token - please check that this is a valid ERC20 contract address for this network`
    : undefined

  return (
    <Suspense fallback={null}>
      <AddTokenScreen
        tokenDetails={tokenDetails}
        error={error}
        hideBackButton={hideBackButton}
        onContinue={onContinue}
        onReject={onReject}
        onTokenAddressChange={onTokenAddressChange}
        isLoading={isValidating}
        isExistingToken={isExistingToken}
        footer={<WithActionScreenErrorFooter />}
      />
    </Suspense>
  )
}
