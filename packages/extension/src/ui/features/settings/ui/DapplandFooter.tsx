import { Button, P3 } from "@argent/x-ui"
import type { StackProps } from "@chakra-ui/react"
import { VStack } from "@chakra-ui/react"
import type { FC } from "react"

import { DapplandIcon } from "./DapplandIcon"

export const DapplandFooter: FC<StackProps> = (props) => (
  <VStack
    borderTop="solid 1px"
    borderTopColor="stroke-default"
    p={4}
    gap={4}
    {...props}
  >
    <P3 color="text-secondary">Discover Starknet dapps</P3>
    <Button
      as={"a"}
      rounded={"lg"}
      size="sm"
      minHeight={12}
      w="full"
      leftIcon={<DapplandIcon />}
      href="https://www.dappland.com?utm_source=argent&utm_medium=extension&utm_content=settings"
      title="Dappland"
      target="_blank"
    >
      Dappland
    </Button>
  </VStack>
)
