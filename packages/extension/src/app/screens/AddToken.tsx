/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { InputText } from '../components/Input';
import LoadingGif from '../../assets/loading.gif';
import { H2 } from '../components/Typography';
import {
  fetchTokenDetails,
  isValidAddress,
  TokenDetails,
} from '../utils/tokens';
import { BigNumber } from '@ethersproject/bignumber';
import { BackButton } from '../components/BackButton';

const AddTokenScreen = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`;

interface AddTokenProps {
  walletAddress: string;
  onSubmit?: (addToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: string;
  }) => void;
  onBack?: () => void;
}

const isDataComplete = (data: TokenDetails) => {
  if (
    isValidAddress(data.address) &&
    data.balance?.toString() &&
    data.decimals?.toString() &&
    data.name &&
    data.symbol
  )
    return true;
  return false;
};

const Spinner = styled.img`
  max-width: 92px;
  max-height: 92px;
  margin: auto;
`;

export const AddToken: FC<AddTokenProps> = ({
  walletAddress,
  onSubmit,
  onBack,
}) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('0');
  const [loading, setLoading] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>();
  const prevValidAddress = useRef('');

  const validAddress = useMemo(() => {
    return isValidAddress(tokenAddress);
  }, [tokenAddress]);

  useEffect(() => {
    if (loading) {
      fetchTokenDetails(tokenAddress, walletAddress)
        .then((details) => {
          setLoading(false);
          setTokenDetails(details);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setTokenDetails(undefined);
        });
    } else if (
      isValidAddress(tokenAddress) &&
      tokenAddress !== prevValidAddress.current
    ) {
      prevValidAddress.current = tokenAddress;
      setLoading(true);
    }
  }, [loading, tokenAddress, walletAddress]);

  const compiledData = {
    address: tokenAddress,
    ...(tokenDetails ?? {}),
    ...(!tokenDetails?.name && { name: tokenName }),
    ...(!tokenDetails?.symbol && { symbol: tokenSymbol }),
    ...(!tokenDetails?.decimals && { decimals: BigNumber.from(tokenDecimals) }),
  };

  return (
    <AddTokenScreen>
      <BackButton onClick={onBack} />
      <H2>Add token</H2>

      <form
        onSubmit={() => {
          if (isDataComplete(compiledData)) {
            onSubmit?.({
              address: compiledData.address,
              decimals: compiledData.decimals!.toString(),
              name: compiledData.name!,
              symbol: compiledData.symbol!,
            });
          }
        }}
      >
        <InputText
          autoFocus
          placeholder="Contract address"
          type="text"
          value={tokenAddress}
          disabled={loading}
          onChange={(e: any) => {
            setTokenAddress(e.target.value?.toLowerCase());
          }}
        />
        {!loading && (
          <>
            <InputText
              placeholder="Name"
              type="text"
              value={tokenDetails?.name ?? tokenName}
              disabled={tokenDetails?.name || loading || !validAddress}
              onChange={(e: any) => setTokenName(e.target.value)}
            />
            <InputText
              placeholder="Symbol"
              type="text"
              value={tokenDetails?.symbol ?? tokenSymbol}
              disabled={tokenDetails?.symbol || loading || !validAddress}
              onChange={(e: any) => setTokenSymbol(e.target.value)}
            />
            <InputText
              placeholder="Decimals"
              type="text"
              value={tokenDetails?.decimals?.toString() ?? tokenDecimals}
              disabled={
                tokenDetails?.decimals?.toString() || loading || !validAddress
              }
              onChange={(e: any) => setTokenDecimals(e.target.value)}
            />
            <Button type="submit" disabled={!isDataComplete(compiledData)}>
              Continue
            </Button>
          </>
        )}
        {loading && <Spinner src={LoadingGif} alt="Loading..." />}
      </form>
    </AddTokenScreen>
  );
};
