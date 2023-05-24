import { ButtonCell, P4, SpacerCell, Switch, icons } from "@argent/ui"
import { Spinner } from "@chakra-ui/react"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { isDeprecated } from "../../../shared/wallet.service"
import { routes } from "../../routes"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { Account } from "../accounts/Account"
import { useAccount } from "../accounts/accounts.state"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
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

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const canDeployAccount = useMemo(
    () => account?.needsDeploy && feeTokenBalance?.gt(0),
    [account?.needsDeploy, feeTokenBalance],
  )

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

  const handleDeploy = async () => {
    if (account) {
      await accountService.deploy(account)
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
      {canDeployAccount && (
        <ButtonCell onClick={handleDeploy}>Deploy account</ButtonCell>
      )}
      <ButtonCell
        color={"error.500"}
        onClick={() => navigate(routes.exportPrivateKey(accountAddress))}
      >
        Export private key
      </ButtonCell>
    </>
  )
}
