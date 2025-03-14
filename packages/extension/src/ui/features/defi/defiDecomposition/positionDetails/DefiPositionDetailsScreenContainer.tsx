import { type FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRouteAccountDefi } from "../../../../hooks/useRoute"
import { selectedAccountView } from "../../../../views/account"
import { useView } from "../../../../views/implementation/react"
import { investmentPositionViewFindByIdAtom } from "../../../../views/investments"
import { DefiPositionDetailsScreen } from "./DefiPositionDetailsScreen"

export const DefiPositionDetailsScreenContainer: FC = () => {
  const { positionId, dappId } = useParams<{
    positionId: string
    dappId: string
  }>()
  const selectedAccount = useView(selectedAccountView)
  const navigate = useNavigate()
  const defiRoute = useRouteAccountDefi()

  const onBack = () => {
    navigate(defiRoute)
  }

  const positionWithUsdValue = useView(
    investmentPositionViewFindByIdAtom({
      positionId,
    }),
  )

  if (!positionWithUsdValue || !selectedAccount) {
    return null
  }

  return (
    <DefiPositionDetailsScreen
      onBack={onBack}
      position={positionWithUsdValue}
      account={selectedAccount}
      dappId={dappId}
    />
  )
}
