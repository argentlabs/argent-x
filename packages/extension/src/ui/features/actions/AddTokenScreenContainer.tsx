import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"
import { number } from "starknet"
import { ZodError } from "zod"

import { addToken } from "../../../shared/token/storage"
import { RequestToken, Token } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { isValidAddress } from "../../services/addresses"
import { useSelectedAccount } from "../accounts/accounts.state"
import { fetchTokenDetails } from "../accountTokens/tokens.service"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { AddTokenScreen } from "./AddTokenScreen"

const isDataComplete = (data: Partial<Token>): data is Token => {
  if (
    data.address &&
    isValidAddress(data.address) &&
    data.decimals?.toString() &&
    data.name &&
    data.symbol
  ) {
    return true
  }
  return false
}

function addressFormat64Byte(address: number.BigNumberish): string {
  return `0x${number.toBN(address).toString("hex").padStart(64, "0")}`
}

/** TODO: refactor: rework to use proper from state */

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
  const account = useSelectedAccount()
  const [tokenAddress, setTokenAddress] = useState(defaultToken?.address || "")
  const [tokenName, setTokenName] = useState(defaultToken?.name || "")
  const [tokenSymbol, setTokenSymbol] = useState(defaultToken?.symbol || "")
  const [tokenDecimals, setTokenDecimals] = useState(
    defaultToken?.decimals || "0",
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tokenDetails, setTokenDetails] = useState<Token>()
  const prevValidAddress = useRef("")
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)

  const validAddress = useMemo(() => {
    return isValidAddress(tokenAddress)
  }, [tokenAddress])

  const tokenExist = useMemo(
    () =>
      tokensInNetwork.some(
        (token) => defaultToken && token.address === defaultToken.address,
      ),
    [defaultToken, tokensInNetwork],
  )

  useEffect(() => {
    if (
      defaultToken &&
      defaultToken.address === tokenAddress &&
      !tokenDetails
    ) {
      setLoading(true)
    }
  }, [defaultToken, tokenAddress, tokenDetails])

  useEffect(() => {
    if (account) {
      if (loading && account) {
        fetchTokenDetails(tokenAddress, account)
          .then((details) => {
            setTokenDetails(details)
            setTokenName(details.name || "")
            setTokenSymbol(details.symbol || "")
          })
          .catch(() => {
            setTokenDetails(undefined)
          })
          .finally(() => {
            setLoading(false)
          })
      } else if (
        isValidAddress(tokenAddress) &&
        tokenAddress !== prevValidAddress.current
      ) {
        prevValidAddress.current = tokenAddress
        setLoading(true)
      }
    }
  }, [loading, tokenAddress, account])

  const compiledData = useMemo(
    () => ({
      address: tokenAddress,
      ...(tokenDetails ?? {}),
      ...(tokenName && { name: tokenName }),
      ...(tokenSymbol && { symbol: tokenSymbol }),
      ...(!tokenDetails?.decimals && {
        decimals: parseInt(tokenDecimals.toString(), 10) || 0,
      }),
      networkId: switcherNetworkId,
    }),
    [
      switcherNetworkId,
      tokenAddress,
      tokenDecimals,
      tokenDetails,
      tokenName,
      tokenSymbol,
    ],
  )

  const onFormSubmit = useCallback(async () => {
    compiledData.address = addressFormat64Byte(compiledData.address)
    if (isDataComplete(compiledData)) {
      try {
        await addToken(compiledData)
        void onSubmit?.()
        navigate(routes.accountTokens())
      } catch (e) {
        if (e instanceof ZodError) {
          setError(e.issues[0].message)
        } else {
          setError("Token not supported")
        }
      }
    }
  }, [compiledData, navigate, onSubmit])

  return (
    <AddTokenScreen
      tokenDetails={tokenDetails}
      error={error}
      hideBackButton={hideBackButton}
      loading={loading}
      onFormSubmit={onFormSubmit}
      onReject={onReject}
      setTokenAddress={setTokenAddress}
      setTokenDecimals={setTokenDecimals}
      setTokenName={setTokenName}
      setTokenSymbol={setTokenSymbol}
      tokenAddress={tokenAddress}
      tokenExist={tokenExist}
      tokenName={tokenName}
      tokenSymbol={tokenSymbol}
      validAddress={validAddress}
      tokenDecimals={tokenDecimals}
      disableSubmit={loading || !isDataComplete(compiledData)}
    />
  )
}
