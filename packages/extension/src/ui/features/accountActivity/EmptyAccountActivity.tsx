import type { EmptyProps } from "@argent/x-ui"
import { ActivitySecondaryIcon } from "@argent/x-ui/icons"
import { Empty } from "@argent/x-ui"

export function EmptyAccountActivity(props: EmptyProps) {
  return (
    <Empty icon={<ActivitySecondaryIcon />} title={"No activity"} {...props} />
  )
}
