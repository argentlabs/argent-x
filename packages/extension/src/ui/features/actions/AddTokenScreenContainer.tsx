import { Address, addressSchema, isEqualAddress } from "@argent/x-shared"
import { useToast } from "@argent/x-ui"
import { debounce } from "lodash-es"
import { FC, Suspense, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addAddressPadding } from "starknet"
import useSWR from "swr"
import { ZodError } from "zod"

import { getAccountIdentifier } from "../../../shared/wallet.service"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AddTokenScreen, AddTokenScreenSchemaType } from "./AddTokenScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { RequestToken } from "../../../shared/token/__new/types/token.model"
import { clientTokenService } from "../../services/tokens"
import { useTokensInCurrentNetworkIncludingSpam } from "../accountTokens/tokens.state"
import { mergeTokens } from "../../../shared/token/__new/repository/mergeTokens"
import { selectedNetworkIdView } from "../../views/network"

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
      ? [
          "fetchTokenDetails",
          fetchedTokenAddress,
          getAccountIdentifier(account),
        ]
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
    const isExistingToken = Boolean(existingToken)
    return {
      isExistingToken,
      existingToken,
    }
  }, [tokenDetails, tokensInNetwork])

  const onContinue = useCallback(
    async (token: AddTokenScreenSchemaType) => {
      try {
        /** merge existing token info to retain icon, tags etc. */
        const rawTokenData = {
          ...token,
          address: addressSchema.parse(addAddressPadding(token.address)),
          networkId: selectedNetworkId,
        }

        const addTokenData = isExistingToken
          ? mergeTokens(rawTokenData, existingToken)
          : rawTokenData
        await clientTokenService.addToken(addTokenData)
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
    [
      existingToken,
      isExistingToken,
      navigate,
      onSubmit,
      selectedNetworkId,
      toast,
    ],
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
        footer={<WithActionScreenErrorFooter />}
      />
    </Suspense>
  )
}
