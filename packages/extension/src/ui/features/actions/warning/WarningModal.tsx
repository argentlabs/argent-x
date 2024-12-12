import { pluralise, type ITransactionReviewWarning } from "@argent/x-shared"
import type { Warning } from "@argent/x-shared/simulation"
import {
  B3,
  Button,
  H5,
  icons,
  L1Bold,
  P3,
  riskToSemanticTokenMap,
  scrollbarStyleThin,
} from "@argent/x-ui"
import type { ModalProps } from "@chakra-ui/react"
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
import type { FC } from "react"

import { riskToBadgeMap, riskToColorSchemeMap } from "./warningMap"

const { WarningCirclePrimaryIcon } = icons

export type WarningsByReason = Record<string, ITransactionReviewWarning>

export interface WarningModalProps extends Omit<ModalProps, "children"> {
  onReject?: () => void
  highestSeverityWarning: Warning
  warningsByReason: WarningsByReason
  warnings: Warning[]
}

export const WarningModal: FC<WarningModalProps> = ({
  onReject,
  onClose,
  warnings,
  highestSeverityWarning,
  warningsByReason,
  ...rest
}) => {
  const semanticToken = riskToSemanticTokenMap[highestSeverityWarning.severity]
  const risks = pluralise(warnings.length, "risk")

  const title = `${risks} identified`

  return (
    <Modal onClose={onClose} isCentered data-testid="warning-modal" {...rest}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent
        color="text-primary"
        bgColor="surface-elevated"
        rounded="2xl"
        py={5}
        w={312}
        gap={5}
      >
        <ModalHeader
          display="flex"
          alignItems="center"
          px={4}
          flexDir="column"
          p={0}
          title={title}
          gap={1}
        >
          <WarningCirclePrimaryIcon
            color={semanticToken}
            width={10}
            height={10}
          />
          <H5 fontWeight="bold" textAlign="center">
            {title}
          </H5>
        </ModalHeader>
        <ModalBody
          display="flex"
          flexDirection="column"
          p={0}
          maxHeight={350}
          overflowY={"auto"}
          gap={2}
          sx={scrollbarStyleThin}
        >
          {highestSeverityWarning.severity === "critical" && (
            <Flex
              flexDir="column"
              p={2}
              px={4}
              borderRadius={8}
              backgroundColor={semanticToken}
              mx={4}
            >
              <L1Bold color="white.white" textAlign="center">
                We strongly recommend you do not proceed with this transaction
              </L1Bold>
            </Flex>
          )}
          {warnings.map((warning, index) => (
            <Flex
              key={`warning-${index}`}
              flexDir="column"
              p={3}
              borderRadius={8}
              border="1px solid"
              borderColor="stroke-default-web"
              mx={4}
              alignItems="flex-start"
            >
              <Badge
                colorScheme={riskToColorSchemeMap[warning.severity]}
                my={1}
              >
                {riskToBadgeMap[warning.severity]}
              </Badge>
              <B3 my={1}>{warningsByReason[warning.reason].title}</B3>
              <P3 my={1}>{warningsByReason[warning.reason].description}</P3>
            </Flex>
          ))}
        </ModalBody>
        <ModalFooter p={0} gap="2" px={4}>
          <Button w="full" size="sm" onClick={onReject} colorScheme="secondary">
            Cancel
          </Button>
          <Button
            w="full"
            size="sm"
            colorScheme={riskToColorSchemeMap[highestSeverityWarning.severity]}
            onClick={onClose}
            px={12}
          >
            Accept risk
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
