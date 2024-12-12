import type { FC, ReactNode } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPreviousButton,
  CarouselNextButton,
  CarouselIndicator,
} from "@argent/x-ui"

import { Box, Flex } from "@chakra-ui/react"

export interface AccountBannersProps {
  banners: ReactNode[]
}

export const AccountBanners: FC<AccountBannersProps> = ({ banners }) => {
  const hasBanners = banners.length > 0
  const hasMultipleBanners = banners.length > 1
  if (!hasBanners) {
    return null
  }
  return (
    <Box mx={-4}>
      <Carousel options={{ containScroll: false }}>
        <CarouselContent gap={2} prevNextInset={4}>
          {banners.map((banner, index) => (
            <CarouselItem key={index} w="calc(100% - 2rem)">
              {banner}
            </CarouselItem>
          ))}
        </CarouselContent>
        {hasMultipleBanners && (
          <Flex
            w="full"
            justify="space-between"
            alignItems="center"
            px={3}
            fontSize="base"
            mt={2}
          >
            <CarouselPreviousButton />
            <CarouselIndicator />
            <CarouselNextButton />
          </Flex>
        )}
      </Carousel>
    </Box>
  )
}
