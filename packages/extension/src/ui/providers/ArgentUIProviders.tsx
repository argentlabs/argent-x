import {
  BlockExplorerProvider,
  AddressNameProvider,
  LabelsProvider,
  UseAddressName,
  UseLabel,
  UseBlockExplorer,
  UseToken,
  TokenProvider,
} from "@argent/x-ui"
import { FC, PropsWithChildren } from "react"

import { useView } from "../views/implementation/react"
import { labelsFindFamily } from "../views/transactionReviews"
import {
  onBlockExplorerOpenAddress,
  onBlockExplorerOpenTransaction,
  useBlockExplorerTitle,
} from "../services/blockExplorer.service"
import { useAccountOrContactOnNetworkId } from "../features/accounts/useAccountOrContact"
import { useTokenInfo } from "../features/accountTokens/tokens.state"

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

export const ArgentUIProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <LabelsProvider useLabel={useLabel}>
      <BlockExplorerProvider useBlockExplorer={useBlockExplorer}>
        <AddressNameProvider useAddressName={useAddressName}>
          <TokenProvider useToken={useTokenInfo as UseToken}>
            {children}
          </TokenProvider>
        </AddressNameProvider>
      </BlockExplorerProvider>
    </LabelsProvider>
  )
}
