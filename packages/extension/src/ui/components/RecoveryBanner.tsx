import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../routes"
import { Banner } from "./Banner"
import { DangerIcon } from "./Icons/Danger"

interface RecoveryBannerProps {
  noMargins?: boolean
}

export const RecoveryBanner: FC<RecoveryBannerProps> = ({ noMargins }) => {
  const navigate = useNavigate()
  return (
    <Banner
      title="Set up account recovery"
      description="All your funds are at risk"
      noMargins={noMargins}
      icon={<DangerIcon />}
      onClick={() => {
        navigate(routes.setupRecovery())
      }}
    />
  )
}
