import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { SettingsMenuItem } from "../ui/SettingsMenuItem"
import { SettingsMenuItemLogo } from "../ui/SettingsMenuItemLogo"
import { SettingsRadioIcon } from "../ui/SettingsRadioIcon"
import {
  NftMarketplaceKey,
  defaultNftMarketplaces,
} from "../../../../shared/nft/marketplaces"

interface NftMarketplaceSettingsScreenProps {
  onBack: ReactEventHandler
  nftMarketplaceKey: NftMarketplaceKey
  onChange: (key: NftMarketplaceKey) => void
}

export const NftMarketplaceSettingsScreen: FC<
  NftMarketplaceSettingsScreenProps
> = ({ onBack, nftMarketplaceKey, onChange }) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Default NFT marketplace"}
    >
      <CellStack>
        {Object.entries(defaultNftMarketplaces).map(([key, nftMarketplace]) => {
          const { title, logo } = nftMarketplace
          const checked = nftMarketplaceKey === key
          const leftIcon = logo ? (
            <SettingsMenuItemLogo logo={logo} />
          ) : undefined
          const rightIcon = <SettingsRadioIcon checked={checked} />
          const onClick = () => {
            onChange(key)
          }
          return (
            <SettingsMenuItem
              key={key}
              title={title}
              onClick={onClick}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
            />
          )
        })}
      </CellStack>
    </NavigationContainer>
  )
}
