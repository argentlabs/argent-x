import { Button, P3 } from "@argent/ui"
import { SimpleGrid, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { DapplandIcon } from "./assets/DapplandIcon"

const DapplandFooter: FC = () => (
  <VStack mt={4} borderTop="solid 1px" borderTopColor="border">
    <P3 color="neutrals.400" pt="6">
      Discover Starknet dapps:
    </P3>
    <SimpleGrid columns={1} gap="2" w="100%" py={4}>
      <Button
        as={"a"}
        size="sm"
        rounded={"lg"}
        leftIcon={<DapplandIcon />}
        href="https://www.dappland.com?utm_source=argent&utm_medium=extension&utm_content=settings"
        title="Dappland"
        target="_blank"
      >
        Dappland
      </Button>
    </SimpleGrid>
  </VStack>
)

export { DapplandFooter }
