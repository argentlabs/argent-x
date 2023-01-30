import { BarCloseButton, H6, NavigationContainer, P4, icons } from "@argent/ui"
import { Center, Flex } from "@chakra-ui/react"
import { ComponentProps, FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { booleanifyEnv } from "../../../shared/utils/booleanifyEnv"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { routes, useReturnTo } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { recover } from "../recovery/recovery.service"
import { useAddAccount } from "./useAddAccount"

const { WalletIcon, MultisigIcon } = icons

enum AccountTypeId {
  STANDARD,
  MULTISIG,
  // LEDGER,
}

interface AccountType {
  id: AccountTypeId
  title: string
  subtitle?: string
  icon: React.ReactNode
  enabled?: boolean
  route?: string
  onClick?: () => void
}

const accountTypes: AccountType[] = [
  {
    id: AccountTypeId.STANDARD,
    title: "Standard Account",
    subtitle: "Create a new Argent X account",
    icon: <WalletIcon />,
    enabled: true, // always enabled
  },
  {
    id: AccountTypeId.MULTISIG,
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigIcon />,
    enabled: booleanifyEnv("FEATURE_MULTISIG", false),
  },

  //   {
  //     title: "Connect Ledger",
  //     subtitle: "Use a Ledger hardware wallet",
  //     icon: <Ledger />,
  //     enabled: booleanifyEnv("FEATURE_LEDGER", false),
  //   },
]

export const AccountTypeListScreen: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { addAccount, isDeploying } = useAddAccount()

  const onClose = useCallback(async () => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(await recover())
    }
  }, [navigate, returnTo])

  const onAccountTypeClick = useCallback(
    async (accountTypeId: AccountTypeId) => {
      switch (accountTypeId) {
        case AccountTypeId.STANDARD:
          return await addAccount()

        case AccountTypeId.MULTISIG:
          return navigate(routes.multisigSetup())

        // case AccountTypeId.LEDGER:
        // navigate(routes.ledgerEntry())
        // break

        default:
          assertNever(accountTypeId) // Should always be handled
      }
    },
    [addAccount, navigate],
  )

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={onClose} />}
      title="Add a new account"
    >
      <Flex p={4} gap={2} direction="column">
        {accountTypes.map((accountType, index) => (
          <CustomButtonCell
            key={index}
            p={4}
            alignItems="center"
            justifyContent="flex-start"
            gap={3}
            onClick={() => onAccountTypeClick(accountType.id)}
            _hover={{
              backgroundColor: "neutrals.700",
              "& > .account-type-avatar": {
                backgroundColor: "neutrals.600",
              },
            }}
          >
            <AccountTypeAvatar>{accountType.icon}</AccountTypeAvatar>
            <Flex direction="column" flex={0.5}>
              <H6>{accountType.title}</H6>
              <P4 fontWeight="bold" color="neutral.500">
                {accountType.subtitle}
              </P4>
            </Flex>
          </CustomButtonCell>
        ))}
      </Flex>
    </NavigationContainer>
  )
}

export const AccountTypeAvatar: FC<ComponentProps<"img">> = ({ children }) => {
  return (
    <Center
      borderRadius="full"
      width={12}
      height={12}
      backgroundColor="neutrals.700"
      className="account-type-avatar"
    >
      {children}
    </Center>
  )
}
