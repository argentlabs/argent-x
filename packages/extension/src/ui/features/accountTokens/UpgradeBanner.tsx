import { FC } from "react"

import { Banner } from "../../components/Banner"
import { UpdateIcon } from "../../components/Icons/Update"

export const UpgradeBanner: FC = () => (
  <Banner
    title="Upgrade Available"
    description="This update is required to use this wallet."
    icon={<UpdateIcon />}
  />
)
