import { P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"

export const ReviewFooter = () => {
  return (
    <Flex
      p={3}
      backgroundColor="errorExtraDark"
      borderRadius={12}
      gap={2}
      justifyContent="center"
    >
      <P4 data-testid="review-footer" textAlign="center" color="errorText">
        Please review warnings before continuing
      </P4>
    </Flex>
  )
}
