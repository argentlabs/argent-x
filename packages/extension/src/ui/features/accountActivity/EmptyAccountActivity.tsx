import type { EmptyProps } from "@argent/x-ui"
import { Empty, icons } from "@argent/x-ui"

const { ActivitySecondaryIcon } = icons

export function EmptyAccountActivity(props: EmptyProps) {
  return (
    <Empty icon={<ActivitySecondaryIcon />} title={"No activity"} {...props} />
  )
}
