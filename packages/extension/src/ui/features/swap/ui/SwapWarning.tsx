import { B3, Button, H3, P3, icons } from "@argent/ui"
import {
  Circle,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useCallback, useEffect } from "react"

const { AlertIcon, ExpandIcon } = icons

const SwapWarning = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (localStorage.getItem("seenSwapWarning") !== "true") {
      onOpen()
    }
  }, [onOpen])

  const onClick = useCallback(() => {
    localStorage.setItem("seenSwapWarning", "true")
    onClose()
  }, [onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalContent bg="neutrals.900">
        <ModalBody
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Circle size="24" bg="#371709" mb="8">
            <Text fontSize="48" color="primary.500">
              <AlertIcon />
            </Text>
          </Circle>
          <H3>Alpha warning</H3>
          <P3 color="neutrals.100" textAlign="center" mt="3" mb="8">
            The swap feature is powered by JediSwap, an AMM on StarkNet that is
            not yet audited. Both JediSwap and StarkNet are in Alpha, which
            means new changes are introduced frequently and some flows might
            break. Also, Total value locked in Jediswap is still very low and
            some trades might not be favourable, specially with large volumes
          </P3>
          <B3
            display="flex"
            color="neutrals.400"
            alignItems="center"
            justifyContent="center"
            as="a"
            href="https://jediswap.xyz/"
            title="Jediswap"
            target="_blank"
            _hover={{
              textDecoration: "underline",
            }}
          >
            Learn more about Jediswap
            <Text ml="1">
              <ExpandIcon />
            </Text>
          </B3>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="primary" w="100%" onClick={onClick}>
            I understand
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export { SwapWarning }
