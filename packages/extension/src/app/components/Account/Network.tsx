import styled from 'styled-components';
import { WalletStatusCode } from '../../utils/wallet';
import { P } from '../Typography';

export const AccountNetwork = styled(P)`
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  text-align: right;
  margin-bottom: 2px;
`;
export const AccountStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 4px;
`;
export const AccountStatusText = styled(P)`
  font-size: 10px;
  line-height: 12px;
  text-align: right;
  vertical-align: bottom;
`;
export const AccountStatusIndicator = styled.div<{
  status?: WalletStatusCode;
}>`
  height: 8px;
  width: 8px;
  border-radius: 8px;

  background-color: ${({ status = 'CONNECTED' }) =>
    status === 'CONNECTED'
      ? '#02BBA8'
      : status === 'DEPLOYING'
      ? '#ffa85c'
      : 'transparent'};
`;
