import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { H2, P } from '../components/Typography';
import { Button } from '../components/Button';
import { StickyArgentFooter } from '../components/StickyArgentFooter';
import { InputText } from '../components/Input';
import { makeClickable } from '../utils/a11y';
import { BackButton } from '../components/BackButton';

const NewSeedScreen = styled.div`
  padding: 48px 40px 24px;
  display: flex;
  flex-direction: column;

  ${InputText} {
    margin-top: 15px;
  }
  ${InputText}:last-of-type {
    margin-bottom: 116px;
  }
`;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface NewSeedProps {
  onSubmit?: (password: string) => void;
  onBack?: () => void;
}

export function isValidPassword(password: string): boolean {
  return password.length > 5;
}

export const NewSeed: FC<NewSeedProps> = ({
  onSubmit = noop,
  onBack = noop,
}) => {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const continueDisabled = useMemo(() => {
    return !(
      isValidPassword(password) &&
      isValidPassword(repeatPassword) &&
      password === repeatPassword
    );
  }, [password, repeatPassword]);

  return (
    <NewSeedScreen>
      <BackButton onClick={onBack} />
      <H2>New password</H2>
      <P>Enter a password to protect your recovery phrase</P>
      <form onSubmit={() => onSubmit(password)}>
        <InputText
          autoFocus
          type="password"
          placeholder="Password"
          onChange={(e: any) => setPassword(e.target.value)}
          value={password}
        />
        <InputText
          type="password"
          placeholder="Repeat password"
          onChange={(e: any) => setRepeatPassword(e.target.value)}
          value={repeatPassword}
        />

        <Button type="submit" disabled={continueDisabled}>
          Continue
        </Button>
      </form>
      <StickyArgentFooter />
    </NewSeedScreen>
  );
};
