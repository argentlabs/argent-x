import { Button, Flex, useDisclosure } from "@chakra-ui/react"
import { Warning } from "../../../../shared/transactionReview/schema"
import { riskToColorMap, riskToHeaderMap } from "./warningMap"
import { B2, L2 } from "@argent/x-ui"

import AlertFillIconWithHalo from "./AlertFillIconWithHalo"

import { getHighestSeverity, getTitleForWarnings } from "./helper"
import { WarningModal } from "./WarningModal"

export const WarningBanner = ({
  warnings,
  onReject,
  onConfirm,
}: {
  warnings: Warning[]
  onReject: () => void
  onConfirm?: () => void
}) => {
  const highestSeverityWarning = getHighestSeverity(warnings)
  const {
    isOpen: isWarningModalOpen,
    onOpen: onWarningModalOpen,
    onClose: onWarningModalClose,
  } = useDisclosure()

  if (!highestSeverityWarning) {
    return null
  }

  const title = getTitleForWarnings(warnings)
  const color = riskToColorMap[highestSeverityWarning.severity]
  const header = riskToHeaderMap[highestSeverityWarning.severity]
  const onClose = () => {
    onConfirm?.()
    onWarningModalClose()
  }

  const handleReject = () => {
    onReject()
    onWarningModalClose()
  }
  return (
    <>
      <Flex
        borderRadius="lg"
        bgColor="surface-elevated"
        p={2}
        justifyContent="space-between"
      >
        <Flex>
          <AlertFillIconWithHalo color={color} />
          <Flex
            direction="column"
            ml={2}
            justifyContent="space-between"
            my={0.5}
          >
            <B2 color={color}>{header}</B2>
            <L2 color="text-primary">{title}</L2>
          </Flex>
        </Flex>
        {highestSeverityWarning.severity !== "info" && (
          <Button
            bgColor="neutrals.600"
            color="white"
            size="3xs"
            borderRadius={4}
            px={2}
            py={1}
            onClick={onWarningModalOpen}
          >
            Review
          </Button>
        )}
      </Flex>
      <WarningModal
        color={color}
        onClose={onClose}
        onReject={handleReject}
        isOpen={isWarningModalOpen}
        warnings={warnings}
        highestSeverityWarning={highestSeverityWarning}
      />
    </>
  )
}
