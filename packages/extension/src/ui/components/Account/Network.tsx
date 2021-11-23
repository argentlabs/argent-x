import styled from "styled-components"

import { WalletStatusCode } from "../../utils/wallet"

export const AccountNetwork = styled.div`
  display: flex;
  align-items: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 14.4px;
  margin-bottom: 2px;

  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  padding: 8px 12px;

  & > span {
    padding-right: 5px;
  }
`
export const AccountStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 4px;
`

export const AccountStatusIndicator = styled.span<{
  status?: WalletStatusCode
}>`
  height: 8px;
  width: 8px;
  border-radius: 8px;

  background-color: ${({ status = "CONNECTED" }) =>
    status === "CONNECTED"
      ? "#02BBA8"
      : status === "DEPLOYING"
      ? "#ffa85c"
      : "transparent"};
`
