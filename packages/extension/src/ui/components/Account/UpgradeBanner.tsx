import { FC } from "react"

import { Banner } from "../Banner"
import { UpdateIcon } from "../Icons/Update"

interface UpgradeBannerProps {
  onClick: () => void
}

export const UpgradeBanner: FC<UpgradeBannerProps> = ({ onClick }) => {
  return (
    <Banner
      title="Upgrade Available"
      description="This update is required to use this wallet."
      icon={<UpdateIcon />}
      onClick={onClick}
    />
  )
}
