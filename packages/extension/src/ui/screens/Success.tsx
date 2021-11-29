import { FC } from "react"
import styled from "styled-components"

import SuccessGif from "../../assets/loading.gif"
import { getNetwork } from "../../shared/networks"
import { Spinner } from "../components/Spinner"
import { A } from "../components/Typography"

const SuccessScreen = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
`

const SuccessText = styled(A)`
  font-size: 18px;
  line-height: 32px;
`

interface SuccessProps {
  networkId: string
  txHash: string
}

export const Success: FC<SuccessProps> = ({ networkId, txHash }) => {
  const { explorerUrl } = getNetwork(networkId)
  return (
    <SuccessScreen>
      <Spinner size={92} />
      <SuccessText href={`${explorerUrl}/tx/${txHash}`} target="_blank">
        Transaction was submitted
      </SuccessText>
    </SuccessScreen>
  )
}
