import { H5, icons } from "@argent/x-ui"
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Flex,
  ModalCloseButton,
  IconButton,
  chakra,
  Input,
  ModalFooter,
  Button,
  Box,
  InputGroup,
  Text,
  ModalOverlay,
} from "@chakra-ui/react"
import { useUserState } from "../state/user"
import { useCallback, useState } from "react"
import { isAllowedNumericInputValue } from "@argent/x-shared"
import { isNumber } from "lodash-es"

const { PlusSecondaryIcon, MinusPrimaryIcon, CheckmarkSecondaryIcon } = icons

const MAX_SLIPPAGE = 10000

export interface SlippageModalProps {
  onClose: () => void
  isOpen: boolean
}

const UpdateSlippageButton = chakra(IconButton, {
  baseStyle: {
    backgroundColor: "neutrals.800",
    borderColor: "neutrals.600",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "24px",
    minWidth: "24px",
    paddingX: "16px",
    borderRadius: "none",
  },
})

export const SlippageModal = ({ isOpen, onClose }: SlippageModalProps) => {
  const { updateUserSlippageTolerance, userSlippageTolerance } = useUserState()
  const [localSlippage, localSlippageHandler] = useState(
    userSlippageTolerance, // Convert bips to percentage for display
  )

  const onSave = useCallback(() => {
    if (isNumber(localSlippage)) {
      updateUserSlippageTolerance(localSlippage)
      onClose()
    }
  }, [localSlippage, onClose, updateUserSlippageTolerance])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="surface-elevated" borderRadius="2xl">
        <ModalHeader>
          <Flex justifyContent="space-between" alignItems="center" px="1">
            <H5 color="color">Edit max slippage</H5>
            <ModalCloseButton onClick={onClose} />
          </Flex>
        </ModalHeader>
        <ModalBody>
          <Flex
            gap="0"
            bg="surface-default"
            border="1px solid"
            borderColor="neutrals.600"
            borderRadius="lg"
          >
            <UpdateSlippageButton
              size="lg"
              borderTopLeftRadius="lg"
              borderBottomLeftRadius="lg"
              aria-label="Decrease slippage tolerance"
              disabled={localSlippage <= 0}
              onClick={() => {
                const updatedValue = localSlippage - 10
                localSlippageHandler(Math.max(updatedValue, 0))
              }}
              icon={<MinusPrimaryIcon />}
            />
            <InputGroup
              flexGrow="1"
              bg="surface-default"
              justifyContent="center"
              alignItems="center"
              borderLeft="1px solid"
              borderRight="1px solid"
              borderColor="neutrals.600"
              borderRadius="none"
            >
              <Input
                type="number"
                bg="surface-default"
                value={localSlippage / 100} // Convert bips to percentage for display
                placeholder="0"
                size="sm"
                borderRadius="none"
                border="none"
                w="auto"
                textAlign="center"
                maxW="12"
                p="0"
                onChange={(e) => {
                  const inputString = e.target.value
                  if (isAllowedNumericInputValue(inputString, 2)) {
                    let parsedValue = parseFloat(inputString) * 100
                    parsedValue = Math.min(
                      Math.round(parsedValue), // Round to nearest integer, issue with float 0.55 * 100 = 55.00000000000001
                      MAX_SLIPPAGE,
                    )
                    localSlippageHandler(parsedValue)
                  }
                }}
                _hover={{
                  border: "none",
                }}
                _focusVisible={{
                  border: "none",
                  boxShadow: "none",
                  zIndex: "0",
                }}
              />
              <Box>
                <Text color="neutrals.300" fontSize="base">
                  %
                </Text>
              </Box>
            </InputGroup>
            <UpdateSlippageButton
              size="lg"
              borderTopRightRadius="lg"
              borderBottomRightRadius="lg"
              aria-label="Increase slippage tolerance"
              disabled={localSlippage >= MAX_SLIPPAGE}
              onClick={() => {
                const validLocalSlippage = localSlippage || 0
                const updatedValue = validLocalSlippage + 10
                localSlippageHandler(Math.min(updatedValue, MAX_SLIPPAGE))
              }}
              icon={<PlusSecondaryIcon />}
            />
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Flex justifyContent="center" alignItems="center" w="full">
            <Button
              colorScheme="secondary"
              onClick={onSave}
              isDisabled={isNaN(localSlippage)}
              leftIcon={<CheckmarkSecondaryIcon />}
              size="sm"
            >
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
