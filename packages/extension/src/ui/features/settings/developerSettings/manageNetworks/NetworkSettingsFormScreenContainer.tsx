import { zodResolver } from "@hookform/resolvers/zod"
import { FC, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { Network, networkSchema } from "../../../../../shared/network"
import { settingsStore } from "../../../../../shared/settings"
import { defaultBlockExplorers } from "../../../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../../hooks/useStorage"
import { slugify } from "./slugify"
import {
  addressSchema,
  isArgentNetworkId,
  TXV3_ACCOUNT_CLASS_HASH,
} from "@argent/x-shared"
import { addAddressPadding } from "starknet"
import { NetworkSettingsFormScreen } from "./NetworkSettingsFormScreen"
import {
  ETH_TOKEN_ADDRESS,
  MULTICALL_CONTRACT_ADDRESS,
} from "../../../../../shared/network/constants"
import { networkService } from "../../../../../shared/network/service"
import { Token } from "../../../../../shared/token/__new/types/token.model"
import { TokenSchema } from "../../../../../shared/token/__new/types/token.model"
import { clientTokenService } from "../../../../services/tokens"
import { useDisclosure } from "@chakra-ui/react"
import { mainnetChainIdSchema } from "../../../../../shared/network/schema"
import { AlertDialog } from "@argent/x-ui"

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  const [userAcceptedRisk, setUserAcceptedRisk] = useState(false)

  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === "add") {
      return {
        id: "",
        name: "",
        chainId: "",
        rpcUrl: "",
        status: "unknown",
        accountClassHash: {
          standard: TXV3_ACCOUNT_CLASS_HASH,
        },
        possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS], // Default to ETH. User can change this if they want
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

  const { chainId } = watch()

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
      if (mainnetChainIdSchema.safeParse(network.chainId).success) {
        if (!userAcceptedRisk) {
          onOpen()
          return
        }
      }
      await networkService.add(network)

      const promises = network.possibleFeeTokenAddresses.map(
        async (feeTokenAddress) => {
          const parsedFeeTokenAddress = addressSchema.parse(feeTokenAddress)

          const token = await clientTokenService.fetchDetails(
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

            await clientTokenService.addToken(addTokenData)
          }
        },
      )

      await Promise.allSettled(promises)

      navigate(-1)
    } catch (e) {
      console.error("Failed to add network: ", e)
    }
  }

  const onAcceptRisk = () => {
    setUserAcceptedRisk(true)
    onClose()
  }

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        title={"Mainnet Chain ID"}
        message={`${chainId} is a Mainnet Chain ID. Adding such network is a potential security risk.`}
        onCancel={onClose}
        onDestroy={onAcceptRisk}
        destroyTitle={`Accept risk`}
      />
      <NetworkSettingsFormScreen
        control={control}
        defaultNetwork={defaultNetwork}
        errors={errors}
        expanded={expanded}
        mode={props.mode}
        onSubmit={handleSubmit(onSubmit)}
        setExpanded={setExpanded}
      />
    </>
  )
}
