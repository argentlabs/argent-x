import type {
  UseAddressName,
  UseBlockExplorer,
  UseDappId,
  UseLabel,
  UseToken,
} from "@argent/x-ui"
import {
  AddressNameProvider,
  BlockExplorerProvider,
  DappProvider,
  ImageOptimizationProvider,
  LabelsProvider,
  TokenProvider,
} from "@argent/x-ui"
import type { FC, PropsWithChildren } from "react"

import { useView } from "../views/implementation/react"
import { labelsFindFamily } from "../views/transactionReviews"
import {
  onBlockExplorerOpenAddress,
  onBlockExplorerOpenTransaction,
  useBlockExplorerTitle,
} from "../services/blockExplorer.service"
import { useAccountOrContactOnNetworkId } from "../features/accounts/useAccountOrContact"
import { useToken } from "../features/accountTokens/tokens.state"
import { knownDappWithId } from "../views/knownDapps"

const useAddressName: UseAddressName = ({ address, networkId }) => {
  const { account, contact } = useAccountOrContactOnNetworkId({
    address,
    networkId,
  })
  return contact?.name || account?.name
}

const useLabel: UseLabel = (key: string) => {
  return useView(labelsFindFamily(key))
}

const useBlockExplorer: UseBlockExplorer = () => {
  const title = useBlockExplorerTitle()
  return {
    title,
    onOpenAddress: onBlockExplorerOpenAddress,
    onOpenTransaction: onBlockExplorerOpenTransaction,
  }
}

const useDappId: UseDappId = (dappId) => {
  return useView(knownDappWithId(dappId))
}

const imageOptimizationUrl = process.env.ARGENT_OPTIMIZER_URL

export const ArgentUIProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <LabelsProvider useLabel={useLabel}>
      <BlockExplorerProvider useBlockExplorer={useBlockExplorer}>
        <DappProvider useDappId={useDappId}>
          <AddressNameProvider useAddressName={useAddressName}>
            <TokenProvider useToken={useToken as UseToken}>
              <ImageOptimizationProvider
                imageOptimizationUrl={imageOptimizationUrl}
              >
                {children}
              </ImageOptimizationProvider>
            </TokenProvider>
          </AddressNameProvider>
        </DappProvider>
      </BlockExplorerProvider>
    </LabelsProvider>
  )
}
