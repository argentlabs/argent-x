import { H6, icons } from "@argent/ui"
import { Circle, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { CustomButtonCell } from "../../components/CustomButtonCell"

const { DocumentIcon } = icons

export const TransactionListErrorItem: FC = () => {
  return (
    <CustomButtonCell isDisabled>
      <Circle size={9} bg={"neutrals.600"}>
        <DocumentIcon fontSize={"base"} />
      </Circle>
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        overflow={"hidden"}
      >
        <Flex direction={"column"} overflow="hidden">
          <H6 overflow="hidden" textOverflow={"ellipsis"}>
            Contract interaction
          </H6>
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
