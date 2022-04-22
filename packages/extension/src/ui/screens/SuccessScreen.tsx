import { FC } from "react"
import styled from "styled-components"

import { Spinner } from "../components/Spinner"
import { A } from "../components/Typography"
import { useNetwork } from "../hooks/useNetworks"

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
  const {
    network: { explorerUrl },
  } = useNetwork(networkId)
  return (
    <SuccessScreenWrapper>
      <Spinner size={92} />
      {explorerUrl && (
        <SuccessText href={`${explorerUrl}/tx/${txHash}`} target="_blank">
          Transaction was submitted
        </SuccessText>
      )}
    </SuccessScreenWrapper>
  )
}
