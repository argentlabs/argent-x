import type { FC } from "react"

import type { IStatusMessage } from "../../../shared/statusMessage/types"
import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"
import { StatusMessageIcon } from "../statusMessage/StatusMessageIcon"

export interface StatusMessageBannerProps
  extends Pick<BannerProps, "onClose" | "onClick"> {
  statusMessage: Pick<
    IStatusMessage,
    "summary" | "message" | "linkTitle" | "linkUrl" | "level"
  >
}

export const StatusMessageBanner: FC<StatusMessageBannerProps> = ({
  statusMessage,
  ...rest
}) => {
  if (!statusMessage || !statusMessage.message) {
    return null
  }
  const { summary, message, linkTitle, linkUrl, level } = statusMessage

  return (
    <Banner
      colorScheme={level}
      title={summary}
      description={message}
      linkTitle={linkTitle}
      linkUrl={linkUrl}
      icon={<StatusMessageIcon level={level} />}
      {...rest}
    />
  )
}
