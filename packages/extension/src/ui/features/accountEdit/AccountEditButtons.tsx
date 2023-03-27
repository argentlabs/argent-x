import { ButtonCell, P4, SpacerCell, Switch, icons } from "@argent/ui"
import { Spinner } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { parseAmount } from "../../../shared/token/amount"
import { getFeeToken } from "../../../shared/token/utils"
import { isDeprecated } from "../../../shared/wallet.service"
import { routes } from "../../routes"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { Account } from "../accounts/Account"
import { useAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useArgentShieldEnabled } from "../shield/useArgentShieldEnabled"
import {
  ChangeGuardian,
  useLiveAccountGuardianState,
} from "../shield/usePendingChangingGuardian"

const { ExpandIcon, ArgentShieldIcon } = icons

export const AccountEditButtons = () => {
  const currentNetwork = useCurrentNetwork()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })
  const blockExplorerTitle = useBlockExplorerTitle()
  const liveAccountGuardianState = useLiveAccountGuardianState(account)

  const argentShieldEnabled = useArgentShieldEnabled()

  const experimentalAllowChooseAccount = useKeyValueStorage(
    settingsStore,
    "experimentalAllowChooseAccount",
  )

  const showDelete =
    account && (isDeprecated(account) || account.networkId === "localhost")

  const handleHideOrDeleteAccount = async (account: Account) => {
    if (showDelete) {
      navigate(routes.accountDeleteConfirm(account.address))
    } else {
      navigate(routes.accountHideConfirm(account.address))
    }
  }

  const { status, type, hasGuardian } = liveAccountGuardianState
  const isAdding = type === ChangeGuardian.ADDING

  const accountSubtitle = useMemo(() => {
    if (status === "ERROR") {
      return isAdding
        ? "Adding Argent Shield Failed"
        : "Removing Argent Shield Failed"
    }
    if (status === "PENDING") {
      return isAdding ? "Adding Argent Shield…" : "Removing Argent Shield…"
    }
    return "Two-factor account protection"
  }, [isAdding, status])

  const shieldIsLoading = liveAccountGuardianState.status === "PENDING"

  const handleDeploy = () => {
    const feeToken = getFeeToken(currentNetwork.id)?.address
    if (account && feeToken) {
      const ONE_GWEI = getUint256CalldataFromBN(parseAmount("1", 0))
      const self = account.address
      sendTransaction({
        to: feeToken,
        method: "transfer",
        calldata: {
          recipient: self,
          amount: ONE_GWEI,
        },
      })
    }
  }
  return (
    <>
      {argentShieldEnabled && (
        <>
          <ButtonCell
            as={Link}
            to={routes.shieldAccountStart(accountAddress)}
            leftIcon={
              <ArgentShieldIcon
                fontSize={"xl"}
                opacity={!shieldIsLoading ? 1 : 0.6}
              />
            }
            rightIcon={
              shieldIsLoading ? (
                <Spinner size={"sm"} />
              ) : (
                <Switch
                  size={"lg"}
                  isChecked={Boolean(shieldIsLoading ? isAdding : hasGuardian)}
                  onChange={() =>
                    navigate(routes.shieldAccountStart(accountAddress))
                  }
                />
              )
            }
          >
            <>Argent Shield</>
            <P4 color="neutrals.300" fontWeight={"normal"}>
              {accountSubtitle}
            </P4>
          </ButtonCell>
          <SpacerCell />
        </>
      )}
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
      <ButtonCell onClick={() => account && handleHideOrDeleteAccount(account)}>
        {showDelete ? "Delete account" : "Hide account"}
      </ButtonCell>
      {experimentalAllowChooseAccount && account && (
        <ButtonCell
          onClick={() => {
            navigate(routes.accountImplementations(account.address))
          }}
        >
          Change account implementation
        </ButtonCell>
      )}
      {account?.needsDeploy && (
        <ButtonCell onClick={handleDeploy}>Deploy account</ButtonCell>
      )}
      <ButtonCell
        color={"error.500"}
        onClick={() => navigate(routes.exportPrivateKey())}
      >
        Export private key
      </ButtonCell>
    </>
  )
}
