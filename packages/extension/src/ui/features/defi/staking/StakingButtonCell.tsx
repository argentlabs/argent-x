import type { ButtonProps } from "@chakra-ui/react"
import { Flex, Text } from "@chakra-ui/react"
import { H4, H5, icons, L1, L1Bold } from "@argent/x-ui"
import type { FC } from "react"

import { CustomButtonCell } from "../../../components/CustomButtonCell"

const { ChevronRightSecondaryIcon } = icons

interface StakingButtonCellProps extends ButtonProps {
  title: string
  badgeText?: string
  subtitle: string
  imageSrc: string
}

export const StakingButtonCell: FC<StakingButtonCellProps> = ({
  title,
  badgeText,
  subtitle,
  imageSrc,
  ...rest
}) => {
  return (
    <CustomButtonCell
      justifyContent="space-between"
      role="group"
      backgroundImage={`url(${imageSrc})`}
      backgroundSize="cover"
      backgroundPosition="center"
      minH="10.5rem"
      alignItems="stretch"
      sx={{ textWrap: "wrap" }}
      {...rest}
    >
      <Flex direction="column" gap={1}>
        <Flex gap={2} alignItems="center">
          <H4>{title}</H4>
          {badgeText && (
            <Flex
              pointerEvents={"none"}
              rounded={"base"}
              bg={"black.6"}
              py={1}
              px={2}
              color="surface-default"
            >
              <L1Bold>{badgeText}</L1Bold>
            </Flex>
          )}
        </Flex>
        <L1 as={Text} maxW={`11rem`} sx={{ textWrap: "balance" }}>
          {subtitle}
        </L1>
        <Flex gap={0.5} mt="auto" alignItems="center">
          <H5>Stake</H5>
          <ChevronRightSecondaryIcon fontSize="0.75rem" />
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
