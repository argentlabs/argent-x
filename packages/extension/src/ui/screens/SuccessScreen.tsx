import { FC } from "react"
import styled from "styled-components"

import { getNetwork } from "../../shared/networks"
import { Spinner } from "../components/Spinner"
import { A } from "../components/Typography"

const SuccessScreenWrapper = styled.div`
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

interface SuccessScreenProps {
  networkId: string
  txHash: string
}

export const SuccessScreen: FC<SuccessScreenProps> = ({
  networkId,
  txHash,
}) => {
  const { explorerUrl } = getNetwork(networkId)
  return (
    <SuccessScreenWrapper>
      <Spinner size={92} />
      <SuccessText
        href={explorerUrl && `${explorerUrl}/tx/${txHash}`}
        target="_blank"
      >
        Transaction was submitted
      </SuccessText>
    </SuccessScreenWrapper>
  )
}
