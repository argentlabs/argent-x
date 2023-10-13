import { B3, icons, logos } from "@argent/ui"
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { FC, useRef } from "react"

import { useOnClickOutside } from "../../services/useOnClickOutside"
import { openNftOnFlex, openNftOnUnframed } from "@argent/shared"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"

const { ViewIcon } = icons
const { Unframed, Flex: FlexLogo } = logos

export interface TokenMenuProps {
  contractAddress: string
  networkId: string
  tokenId: string
}

const ViewOnMenu: FC<TokenMenuProps> = ({
  contractAddress,
  networkId,
  tokenId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const ref = useRef<HTMLDivElement>(null)
  const isMainnet = useIsMainnet()

  useOnClickOutside(ref, () => onClose())
  return (
    <>
      <Menu isOpen={isOpen} onClose={onClose} matchWidth gutter={2} size="3xs">
        <MenuButton
          onMouseOver={onOpen}
          aria-label="NFT actions"
          padding="1.5"
          fontSize="xl"
          size="auto"
          rounded="full"
          w="100%"
          as={Button}
          bg="neutrals.700"
          _hover={{ bg: "neutrals.600" }}
          isDisabled={!isMainnet}
        >
          <Flex justifyContent="center" alignItems="center" gap="2">
            <ViewIcon />
            <B3>View on</B3>
          </Flex>
        </MenuButton>
        <MenuList
          bg="transparent"
          boxShadow="none"
          ref={ref}
          onMouseLeave={onClose}
          minW="0"
        >
          <Button
            gap="2"
            my="1"
            w="100%"
            onClick={() =>
              openNftOnUnframed(contractAddress, tokenId, networkId)
            }
            bg="neutrals.700"
            _hover={{ bg: "neutrals.600" }}
          >
            <Unframed />
            <B3>Unframed</B3>
          </Button>
          <Button
            gap="2"
            my="1"
            w="100%"
            onClick={() => openNftOnFlex(contractAddress, tokenId, networkId)}
            bg="neutrals.700"
            _hover={{ bg: "neutrals.600" }}
          >
            <FlexLogo />
            <B3>Flex</B3>
          </Button>
        </MenuList>
      </Menu>
    </>
  )
}

export { ViewOnMenu }
