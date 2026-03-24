'use client';

import { WalletModal } from './WalletModal';
import { NicknameSetup } from './NicknameSetup';

/**
 * Wrapper component that includes all wallet connection modals
 */
export function ConnectWallet() {
  return (
    <>
      <WalletModal />
      <NicknameSetup />
    </>
  );
}
