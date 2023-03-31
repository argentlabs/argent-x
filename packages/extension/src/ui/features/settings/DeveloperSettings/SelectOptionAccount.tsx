import { H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { formatTruncatedAddress } from "../../../services/addresses"
import { Account } from "../../accounts/Account"

interface SelectOptionAvatarProps {
  account: Account
}

const SelectOptionAccount: FC<SelectOptionAvatarProps> = ({ account }) => {
  return (
    <Flex direction="column">
      <H6 color="neutrals.200" _groupHover={{ color: "white" }}>
        {account.name}
      </H6>
      <P4 color="neutrals.400" mt={1} _groupHover={{ color: "white" }}>
        {formatTruncatedAddress(account.address)}
      </P4>
    </Flex>
  )
}

export { SelectOptionAccount }
