import { Flex } from "@chakra-ui/react"
import {
  AssessmentReason,
  AssessmentSeverity,
} from "../../../../../shared/transactionReview/schema"
import { riskToColorMap, riskToHeaderMap, warningMap } from "./warningMap"
import { B2, L2 } from "@argent/ui"

import AlertFillIconWithHalo from "./AlertFillIconWithHalo"

export const WarningBanner = ({
  reason,
  severity,
}: {
  reason: AssessmentReason
  severity: AssessmentSeverity
}) => {
  const { title } = warningMap[reason]
  const color = riskToColorMap[severity]
  const header = riskToHeaderMap[severity]

  return (
    <Flex borderRadius="lg" bgColor="surface.elevated" p={2}>
      <AlertFillIconWithHalo color={color} />
      <Flex direction="column" ml={2} justifyContent="space-between" my={0.5}>
        <B2 color={color}>{header}</B2>
        <L2 color="text.primary">{title}</L2>
      </Flex>
    </Flex>
  )
}
