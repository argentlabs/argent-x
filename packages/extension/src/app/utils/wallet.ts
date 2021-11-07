import type { Wallet } from '../Wallet';

const argentColorsArray = [
  '02BBA8',
  '29C5FF',
  '0078A4',
  'FFBF3D',
  'FFA85C',
  'FF875B',
  'FF675C',
  'FF5C72',
];

export const getProfileColor = (accountNumber: number, withPrefix = true) =>
  `${withPrefix ? '#' : ''}${
    argentColorsArray[(accountNumber % (argentColorsArray.length - 1)) + 1]
  }`;

export const getProfileImageUrl = (accountNumber: number) =>
  `https://eu.ui-avatars.com/api/?name=Account+${accountNumber}&background=${getProfileColor(
    accountNumber,
    false
  )}&color=fff`;

export const getProfileName = (accountNumber: number) =>
  `Address ${accountNumber}`;

export const isWalletDeployed = (wallet: Wallet): boolean =>
  !wallet.deployTransaction;

export type WalletStatusCode = 'CONNECTED' | 'DEFAULT' | 'DEPLOYING';
export interface WalletStatus {
  code: WalletStatusCode;
  text: string;
}
export const getStatus = (
  wallet: Wallet,
  activeWalletAddress: string = wallet.address,
  forceDeployed = false
): WalletStatus => {
  if (!isWalletDeployed(wallet) && !forceDeployed) {
    return { code: 'DEPLOYING', text: 'Deploying' };
  } else if (activeWalletAddress === wallet.address) {
    return { code: 'CONNECTED', text: 'Active' };
  } else {
    return { code: 'DEFAULT', text: '' };
  }
};
