import { Button, icons, H6, B3, P4, L1 } from "@argent/ui"
import {
  Badge,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"
import { Warning } from "../../../../../shared/transactionReview/schema"
import {
  riskToBadgeMap,
  riskToColorMap,
  riskToInvertedColorMap,
  warningMap,
} from "./warningMap"

const { AlertFillIcon } = icons
interface MultisigHideModalProps {
  isOpen: boolean
  onReject?: () => void
  onClose: () => void
  color: string
  warnings: Warning[]
  highestSeverityWarning: Warning
}

export const WarningModal: FC<MultisigHideModalProps> = ({
  isOpen,
  onReject,
  onClose,
  color,
  warnings,
  highestSeverityWarning,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700" borderRadius="2xl">
        <ModalHeader flexDir="column" pb={1} px={4}>
          <Flex justifyContent="center">
            <AlertFillIcon color={color} width={10} height={10} />
          </Flex>
          <H6 fontWeight="600" textAlign="center" mt={2}>
            {warnings.length} risk{warnings.length === 1 ? "" : "s"} identified
          </H6>
          {highestSeverityWarning.severity === "critical" && (
            <Flex
              flexDir="column"
              p={2}
              px={4}
              borderRadius={8}
              backgroundColor={color}
              mt={3}
            >
              <L1 color="white" textAlign="center">
                We strongly recommend you do not proceed with this transaction
              </L1>
            </Flex>
          )}
        </ModalHeader>
        <ModalBody px={4} maxHeight={350} overflowY={"auto"}>
          {warnings.map((warning, index) => (
            <Flex
              key={`warning-${index}`}
              flexDir="column"
              p={3}
              my={1}
              borderRadius={8}
              border="1px solid var(--neutrals-600, #595959)"
            >
              <Badge
                backgroundColor={riskToColorMap[warning.severity]}
                color={riskToInvertedColorMap[warning.severity]}
                textTransform="none"
                maxWidth="fit-content"
                my={1}
              >
                {riskToBadgeMap[warning.severity]}
              </Badge>
              <B3 my={1} color="white">
                {warningMap[warning.reason].title}
              </B3>
              <P4 my={1} color="white">
                {warningMap[warning.reason].description}
              </P4>
            </Flex>
          ))}
        </ModalBody>

        <ModalFooter flexDirection="row" gap="3">
          <Button
            w="100%"
            backgroundColor="neutrals.600"
            onClick={onClose}
            px={12}
          >
            See transaction
          </Button>
          <Button w="100%" colorScheme="primary" onClick={onReject}>
            Reject
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
