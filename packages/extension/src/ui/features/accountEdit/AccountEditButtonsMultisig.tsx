import { ButtonCell, icons } from "@argent/ui"
import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  getMultisigAccountFromBaseWallet,
  getMultisigAccounts,
} from "../../../shared/multisig/store"
import { routes } from "../../routes"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { Account } from "../accounts/Account"
import { useAccount } from "../accounts/accounts.state"
import { useMultisigInfo } from "../multisig/hooks/useMultisigInfo"
import { useCurrentNetwork } from "../networks/useNetworks"

const { ExpandIcon, HideIcon } = icons

export const AccountEditButtonsMultisig = ({
  account,
}: {
  account: Account
}) => {
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()
  const blockExplorerTitle = useBlockExplorerTitle()
  const { multisig } = useMultisigInfo(account)
  const handleHideAccount = async (account: Account) => {
    navigate(routes.accountHideConfirm(account.address))
  }

  return (
    <>
      <ButtonCell onClick={() => navigate(routes.exportPrivateKey())}>
        Connected dapps
      </ButtonCell>
      <ButtonCell onClick={() => navigate(routes.exportPrivateKey())}>
        View owners
      </ButtonCell>
      <ButtonCell onClick={() => navigate(routes.exportPrivateKey())}>
        View confirmations {multisig?.threshold}/{multisig?.signers}
      </ButtonCell>
      {account && !account.needsDeploy && (
        <ButtonCell
          onClick={() =>
            account && openBlockExplorerAddress(currentNetwork, account.address)
          }
          rightIcon={<ExpandIcon />}
        >
          View on {blockExplorerTitle}
        </ButtonCell>
      )}
      <ButtonCell
        onClick={() => account && handleHideAccount(account)}
        rightIcon={<HideIcon />}
      >
        Hide account
      </ButtonCell>
    </>
  )
}
