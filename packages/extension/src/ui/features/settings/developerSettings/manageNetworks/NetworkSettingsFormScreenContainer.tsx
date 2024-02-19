import { zodResolver } from "@hookform/resolvers/zod"
import { FC, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { Network, networkSchema } from "../../../../../shared/network"
import { settingsStore } from "../../../../../shared/settings"
import { defaultBlockExplorers } from "../../../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../../hooks/useStorage"
import { slugify } from "./slugify"
import { addressSchema, isArgentNetworkId } from "@argent/shared"
import { addAddressPadding } from "starknet"
import { NetworkSettingsFormScreen } from "./NetworkSettingsFormScreen"
import {
  MULTICALL_CONTRACT_ADDRESS,
  TXV1_ACCOUNT_CLASS_HASH,
} from "../../../../../shared/network/constants"
import { networkService } from "../../../../../shared/network/service"
import { Token } from "../../../../../shared/token/__new/types/token.model"
import { TokenSchema } from "../../../../../shared/token/__new/types/token.model"
import { tokenService } from "../../../../services/tokens"
import { useFeeTokenPreference } from "../../../actions/useFeeTokenPreference"

type NetworkSettingsFormScreenContainerProps =
  | {
      mode: "add"
    }
  | {
      mode: "edit"
      network: Network
    }

export const NetworkSettingsFormScreenContainer: FC<
  NetworkSettingsFormScreenContainerProps
> = (props) => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]

  const { prefer: preferredFeeToken } = useFeeTokenPreference()

  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === "add") {
      return {
        id: "",
        name: "",
        chainId: "",
        rpcUrl: "",
        status: "unknown",
        accountClassHash: {
          standard: TXV1_ACCOUNT_CLASS_HASH,
        },
        possibleFeeTokenAddresses: [preferredFeeToken], // TODO: let the user add feetokens
        // should we add a default for this or use undefined? For better UX, its a good idea to have a default imo - Dhruv
        multicallAddress: MULTICALL_CONTRACT_ADDRESS,
      }
    }
    /** display selected block explorer url from settings for readonly network */
    if (props.network.readonly && isArgentNetworkId(props.network.id)) {
      const blockExplorerUrl = settingsBlockExplorer.url[props.network.id]
      return {
        ...props.network,
        blockExplorerUrl,
      }
    }
    return props.network
    // due to an or type we need to check different values depending on the mode
  }, [props.mode === "add" || props.network]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    formState: { errors },
    control,
    watch,
    setValue,
    handleSubmit,
  } = useForm<Network>({
    defaultValues: defaultNetwork,
    resolver: zodResolver(networkSchema),
  })

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (props.mode === "add" && type === "change" && name === "name") {
        setValue("id", slugify(value.name || ""))
      }
    })
    return subscription.unsubscribe
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (network: Network) => {
    try {
      await networkService.add(network)

      const promises = network.possibleFeeTokenAddresses.map(
        async (feeTokenAddress) => {
          const parsedFeeTokenAddress = addressSchema.parse(feeTokenAddress)

          const token = await tokenService.fetchDetails(
            parsedFeeTokenAddress,
            network.id,
          )

          const parsedToken = TokenSchema.parse({
            ...token,
            networkId: network.id,
          })

          if (parsedToken) {
            const addTokenData: Token = {
              ...parsedToken,
              address: addressSchema.parse(
                addAddressPadding(parsedFeeTokenAddress),
              ),
              networkId: network.id,
              custom: true,
              showAlways: true, // fee token should always be shown
            }

            await tokenService.addToken(addTokenData)
          }
        },
      )

      await Promise.allSettled(promises)

      navigate(-1)
    } catch (e) {
      console.error("Failed to add network: ", e)
    }
  }

  return (
    <NetworkSettingsFormScreen
      control={control}
      defaultNetwork={defaultNetwork}
      errors={errors}
      expanded={expanded}
      mode={props.mode}
      onSubmit={handleSubmit(onSubmit)}
      setExpanded={setExpanded}
    />
  )
}
