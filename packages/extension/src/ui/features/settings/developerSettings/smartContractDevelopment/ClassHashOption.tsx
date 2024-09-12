import { H6, P4, formatDateTimeBase } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { Transaction } from "../../../../../shared/transactions"
import { formatTruncatedAddress } from "@argent/x-shared"
import { AccountAvatar } from "../../../accounts/AccountAvatar"
import { getNetworkAccountImageUrl } from "../../../accounts/accounts.service"

interface ClassHashOptionProps {
  handleToggle: () => void
  lastElement: boolean
  onClick: (transaction: Transaction) => void
  transaction: Transaction
}

const ClassHashOption: FC<ClassHashOptionProps> = ({
  handleToggle,
  lastElement,
  onClick,
  transaction,
}) => {
  return (
    <>
      <Flex
        p="4"
        _hover={{
          bg: "neutrals.600",
          borderBottomRadius: lastElement ? 8 : 0,
        }}
        onClick={() => {
          handleToggle()
          onClick(transaction)
        }}
        key={transaction.hash}
        cursor="pointer"
        data-group
      >
        <AccountAvatar
          src={getNetworkAccountImageUrl({
            accountName: transaction.account.name,
            accountAddress: transaction.account.address,
            networkId: transaction.account.networkId,
            backgroundColor: undefined,
          })}
        />
        <Flex direction="column" ml="4">
          <H6>{formatDateTimeBase(transaction.timestamp * 1000)}</H6>
          <P4 color="neutrals.400" mt={1} _groupHover={{ color: "white" }}>
            {formatTruncatedAddress(transaction.meta?.subTitle || "")}
          </P4>
        </Flex>
      </Flex>
    </>
  )
}

export { ClassHashOption }
