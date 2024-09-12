import type { Warning } from "@argent/x-shared/simulation"
import { getHighestSeverity } from "@argent/x-shared/simulation"
import { B2, L2, riskToSemanticTokenMap } from "@argent/x-ui"
import { Button, Flex, useDisclosure } from "@chakra-ui/react"

import AlertFillIconWithHalo from "./AlertFillIconWithHalo"
import { WarningModalContainer } from "./WarningModalContainer"
import { useWarningsTitle } from "./helper"
import { riskToHeaderMap } from "./warningMap"

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

  const title = useWarningsTitle(warnings)

  if (!highestSeverityWarning) {
    return null
  }

  const semanticToken = riskToSemanticTokenMap[highestSeverityWarning.severity]
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
        alignItems="center"
      >
        <Flex>
          <AlertFillIconWithHalo color={semanticToken} />
          <Flex
            direction="column"
            ml={2}
            justifyContent="space-between"
            my={0.5}
          >
            <B2 color={semanticToken}>{header}</B2>
            <L2>{title}</L2>
          </Flex>
        </Flex>
        {highestSeverityWarning.severity !== "info" && (
          <Button
            bgColor="surface-elevated-hover"
            size="3xs"
            rounded="base"
            p={2}
            onClick={onWarningModalOpen}
          >
            Review
          </Button>
        )}
      </Flex>
      <WarningModalContainer
        onClose={onClose}
        onReject={handleReject}
        isOpen={isWarningModalOpen}
        warnings={warnings}
        highestSeverityWarning={highestSeverityWarning}
      />
    </>
  )
}
