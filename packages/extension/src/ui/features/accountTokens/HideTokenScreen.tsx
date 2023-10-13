import { Flex, Text } from "@chakra-ui/react"
import { FC } from "react"

import { FormError } from "../../theme/Typography"
import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { TokenIcon } from "./TokenIcon"

interface HideTokenScreenProps {
  error: string
  name: string
  image?: string
  handleSubmit: () => void
}
export const HideTokenScreen: FC<HideTokenScreenProps> = ({
  error,
  name,
  image,
  handleSubmit,
}) => {
  return (
    <ConfirmScreen
      title="Hide token"
      confirmButtonText="Confirm"
      rejectButtonText="Cancel"
      onSubmit={handleSubmit}
    >
      <Flex flexDirection="column" alignItems="center" gap="5px">
        <TokenIcon url={image} name={name} size={12} />
        <Text fontSize="medium">{name}</Text>
      </Flex>
      {error && <FormError>{error}</FormError>}

      <Flex
        paddingTop={8}
        paddingBottom={8}
        marginBottom={5}
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        padding={4}
        background="rgba(255, 255, 255, 0.15)"
        borderRadius="md"
        marginX={5}
      >
        <Text fontSize="medium">
          To see this token again, you will need to add the token to your
          account.
        </Text>
      </Flex>
    </ConfirmScreen>
  )
}
