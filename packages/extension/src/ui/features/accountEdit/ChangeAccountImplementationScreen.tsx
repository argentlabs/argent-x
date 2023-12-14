import {
  BarBackButton,
  ButtonCell,
  H6,
  NavigationContainer,
  P4,
  icons,
} from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { filter, partition } from "lodash-es"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { AutoColumn } from "../../components/Column"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useRouteAccount } from "../shield/useRouteAccount"
import {
  CurrentImplementation,
  Implementation,
  ImplementationItemProps,
  implementations,
} from "./Implementation"
import { clientAccountService } from "../../services/account"

const { TickIcon } = icons

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
          <TickIcon color="primary.500" />
        ) : (
          <P4 color="primary.500">Enable</P4>
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
  const account = useRouteAccount()
  const navigate = useNavigate()

  if (!account || !selectedAccount) {
    return <></>
  }

  const isSelectedAccount = accountsEqual(selectedAccount, account)

  const handleImplementationClick = (i: Implementation) => async () => {
    if (!isSelectedAccount) {
      await clientAccountService.select(account)
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
      <Box p="5" display={"flex"} flexDirection="column" gap="4">
        {activeImplementation && (
          <CurrentImplementation
            implementationItem={
              <ImplementationItem {...activeImplementation} active={true} />
            }
          />
        )}
        {otherImplementations && (
          <>
            <H6 mt="2" pl="2" color="neutrals.300">
              Other implementations
            </H6>
            <AutoColumn gap="md">
              {otherImplementations.map((i) => (
                <ImplementationItem
                  {...i}
                  key={i.id}
                  active={false}
                  onClick={handleImplementationClick(i)}
                />
              ))}
            </AutoColumn>
          </>
        )}
      </Box>
    </NavigationContainer>
  )
}
