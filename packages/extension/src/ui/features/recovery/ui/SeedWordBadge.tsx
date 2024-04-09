import { typographyStyles } from "@argent/x-ui"
import { FlexProps, Flex } from "@chakra-ui/react"
import { FC } from "react"

export const SeedWordBadge: FC<FlexProps> = (props) => {
  return (
    <Flex
      gap={1}
      px={2}
      py={3}
      borderRadius="lg"
      textAlign="center"
      backgroundColor="neutrals.800"
      alignItems="center"
      justifyContent="space-between"
      {...typographyStyles.L1}
      {...props}
    />
  )
}
