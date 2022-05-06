import { FC } from "react"

import { Banner } from "../Banner"
import { UpdateIcon } from "../Icons/Update"

export const UpgradeBanner: FC = () => (
  <Banner
    title="Upgrade Available"
    description="This update is required to use this wallet."
    icon={<UpdateIcon />}
  />
)
