import { aspect } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { BalanceChangeOverview } from "@argent/ui"

export default {
  component: BalanceChangeOverview,
}

export const Default = {
  args: {
    ...aspect,
    aggregatedSimData: aspect.aggregatedData,
  } as any,
}
