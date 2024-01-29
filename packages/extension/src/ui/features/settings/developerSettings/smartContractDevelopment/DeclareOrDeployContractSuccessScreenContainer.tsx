import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../../routes"
import { DeclareOrDeployContractSuccessScreen } from "./DeclareOrDeployContractSuccessScreen"

export const DeclareOrDeployContractSuccessScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { type, classHashOrDeployedAddress } = useParams()
  const onClose = () => navigate(routes.accountTokens())
  const onDeployment = () => navigate(routes.settingsSmartContractDeploy())
  return (
    <DeclareOrDeployContractSuccessScreen
      type={type}
      classHashOrDeployedAddress={classHashOrDeployedAddress}
      onClose={onClose}
      onDeployment={onDeployment}
    />
  )
}
