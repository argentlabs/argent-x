import type { CenterProps, ChakraComponent } from "@chakra-ui/react"
import { Center } from "@chakra-ui/react"
import type { ComponentType, FC, SVGProps } from "react"

import {
  UnframedLogo,
  FlexLogo,
  PyramidLogo,
  ElementLogo,
  StarknetLogo,
  VoyagerLogo,
} from "@argent/x-ui/logos-deprecated"
import type { NftMarketplaceLogoKeys } from "../../../../shared/nft/marketplaces"

export const nftMarketplaceLogos: Record<
  NftMarketplaceLogoKeys,
  ChakraComponent<ComponentType<SVGProps<SVGSVGElement>>>
> = {
  UnframedLogo,
  FlexLogo,
  PyramidLogo,
  ElementLogo,
  StarknetLogo,
  VoyagerLogo,
}

interface SettingsRadioIconProps extends CenterProps {
  logo: NftMarketplaceLogoKeys
}

export const SettingsMenuItemLogo: FC<SettingsRadioIconProps> = ({
  logo,
  ...rest
}) => {
  const LogoComponent = nftMarketplaceLogos[logo]
  return (
    <Center rounded="xl" bg="black" w={10} h={10} {...rest}>
      <LogoComponent fontSize="3xl" bg="black" />
    </Center>
  )
}
