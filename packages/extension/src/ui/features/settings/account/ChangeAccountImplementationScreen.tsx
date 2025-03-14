import { CheckmarkSecondaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  ButtonCell,
  CellStack,
  H5,
  NavigationContainer,
  P3,
} from "@argent/x-ui"
import { filter, partition } from "lodash-es"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { routes } from "../../../../shared/ui/routes"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useRouteWalletAccount } from "../../smartAccount/useRouteWalletAccount"
import type { Implementation, ImplementationItemProps } from "./Implementation"
import { CurrentImplementation, implementations } from "./Implementation"
import { clientAccountService } from "../../../services/account"

const ImplementationItem: FC<ImplementationItemProps> = ({
  title,
  description,
  icon,
  active,
  onClick,
}) => {
  return (
    <ButtonCell
      leftIcon={icon}
      rightIcon={
        active ? (
          <CheckmarkSecondaryIcon color="primary.500" />
        ) : (
          <P3 color="primary.500">Enable</P3>
        )
      }
      extendedDescription={description}
      onClick={onClick}
    >
      {title}
    </ButtonCell>
  )
}

export const ChangeAccountImplementationScreen: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const account = useRouteWalletAccount()
  const navigate = useNavigate()

  if (!account || !selectedAccount) {
    return <></>
  }

  const isSelectedAccount = accountsEqual(selectedAccount, account)

  const handleImplementationClick = (i: Implementation) => async () => {
    if (!isSelectedAccount) {
      await clientAccountService.select(account.id)
    }
    await clientAccountService.upgrade(account, i.id)
    navigate(routes.accountTokens(), { replace: true })
  }

  const [[activeImplementation], otherImplementations] = partition(
    filter(implementations, (i) =>
      Boolean(account.network.accountClassHash?.[i.id]),
    ),
    (i) => i.id === account.type,
  )

  return (
    <NavigationContainer
      title="Change account implementation"
      leftButton={<BarBackButton />}
    >
      <CellStack>
        {activeImplementation && (
          <CurrentImplementation
            implementationItem={
              <ImplementationItem {...activeImplementation} active={true} />
            }
          />
        )}
        {otherImplementations && (
          <>
            <H5 mt="2" pl="2" color="neutrals.300">
              Other implementations
            </H5>
            <CellStack p={0}>
              {otherImplementations.map((i) => (
                <ImplementationItem
                  {...i}
                  key={i.id}
                  active={false}
                  /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
                  onClick={handleImplementationClick(i)}
                />
              ))}
            </CellStack>
          </>
        )}
      </CellStack>
    </NavigationContainer>
  )
}
