import { FC } from "react"
import { Link, useLocation } from "react-router-dom"

import { Banner } from "../../components/Banner"
import { DangerIcon } from "../../components/Icons/DangerIcon"
import { routes } from "../../routes"

interface RecoveryBannerProps {
  noMargins?: boolean
}

export const RecoveryBanner: FC<RecoveryBannerProps> = ({ noMargins }) => {
  const { pathname: returnTo } = useLocation()
  return (
    <Link to={routes.setupRecovery(returnTo)}>
      <Banner
        title="Set up account recovery"
        description="Click here to secure your assets"
        noMargins={noMargins}
        icon={<DangerIcon />}
      />
    </Link>
  )
}
