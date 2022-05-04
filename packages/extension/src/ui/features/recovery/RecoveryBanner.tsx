import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Banner } from "../../components/Banner"
import { DangerIcon } from "../../components/Icons/Danger"
import { routes } from "../../routes"

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
