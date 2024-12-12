import type { Address } from "@argent/x-shared"
import { addressSchema, isEqualAddress } from "@argent/x-shared"
import { useToast } from "@argent/x-ui"
import { debounce } from "lodash-es"
import type { FC } from "react"
import { Suspense, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addAddressPadding } from "starknet"
import useSWR from "swr"
import { ZodError } from "zod"

import type { RequestToken } from "../../../shared/token/__new/types/token.model"
import { routes } from "../../../shared/ui/routes"
import { clientTokenService } from "../../services/tokens"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"
import {
  useTokenInfo,
  useTokensInCurrentNetworkIncludingSpam,
} from "../accountTokens/tokens.state"
import type { AddTokenScreenSchemaType } from "./AddTokenScreen"
import { AddTokenScreen } from "./AddTokenScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"

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
  const selectedNetworkId = useView(selectedNetworkIdView)
  const account = useView(selectedAccountView)
  const tokensInNetwork = useTokensInCurrentNetworkIncludingSpam()
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
      ? ["fetchTokenDetails", fetchedTokenAddress, account.id]
      : null,
    () =>
      clientTokenService.fetchDetails(fetchedTokenAddress, account?.networkId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  const tokenDetails = fetchedTokenDetails ?? defaultToken

  const { isExistingToken, existingToken } = useMemo(() => {
    if (!tokenDetails) {
      return {
        isExistingToken: false,
      }
    }
    const existingToken = tokensInNetwork.find((token) =>
      isEqualAddress(token.address, tokenDetails?.address),
    )

    // we show a warning only if the user wants to add a token they already added before, or if it's a ETH or STRK token
    const isExistingToken = Boolean(
      existingToken && (existingToken?.custom || existingToken?.showAlways),
    )
    return {
      isExistingToken,
      existingToken,
    }
  }, [tokenDetails, tokensInNetwork])

  const tokenInfo = useTokenInfo({
    address: fetchedTokenAddress,
    networkId: selectedNetworkId,
  })

  const isSpamToken = tokenInfo?.tags?.includes("scam") ?? false

  const onContinue = useCallback(
    async (token: AddTokenScreenSchemaType) => {
      try {
        if (isExistingToken) {
          return
        }
        /** merge existing token info to retain icon, tags etc. */
        const rawTokenData = {
          ...(tokenInfo ?? {}),
          ...token,
          address: addressSchema.parse(addAddressPadding(token.address)),
          networkId: selectedNetworkId,
        }

        await clientTokenService.addToken(rawTokenData)
        void onSubmit?.()
        setFetchedTokenAddress(undefined)
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
    [isExistingToken, navigate, onSubmit, selectedNetworkId, toast, tokenInfo],
  )

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
        isHiddenToken={existingToken?.hidden}
        isSpamToken={isSpamToken}
        footer={<WithActionScreenErrorFooter />}
      />
    </Suspense>
  )
}
