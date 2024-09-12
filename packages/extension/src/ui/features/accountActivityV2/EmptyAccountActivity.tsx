import { Empty, EmptyProps, iconsDeprecated } from "@argent/x-ui"

const { ActivityIcon } = iconsDeprecated

export function EmptyAccountActivity(props: EmptyProps) {
  return <Empty icon={<ActivityIcon />} title={"No activity"} {...props} />
}
