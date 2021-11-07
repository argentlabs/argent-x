import styled from 'styled-components';
import { H1, P } from '../Typography';

export const AccountName = styled(H1)`
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  text-align: start;
  margin: 0;
`;

export const AccountAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const AccountAddressIconsWrapper = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const AccountAddress = styled(P)`
  font-size: 10px;
  line-height: 12px;
  max-width: 48px;
  text-overflow: ellipsis;
  overflow: hidden;
`;
