import { BarCloseButton, H6, NavigationContainer, P4, icons } from "@argent/ui"
import { Center, Flex, Spinner } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { booleanifyEnv } from "../../../shared/utils/booleanifyEnv"
import { CreateAccountType } from "../../../shared/wallet.model"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { routes } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useAddAccount } from "./useAddAccount"

const { WalletIcon, MultisigIcon } = icons

export enum AccountTypeId {
  STANDARD,
  MULTISIG,
  // LEDGER,
}

interface AccountType {
  id: AccountTypeId
  type: CreateAccountType
  title: string
  subtitle?: string
  icon: React.ReactNode
  enabled?: boolean
}

const accountTypes: AccountType[] = [
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
    subtitle: "Create a new Argent X account",
    icon: <WalletIcon />,
    enabled: true, // always enabled
  },
  {
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigIcon />,
    enabled: booleanifyEnv(process.env.FEATURE_MULTISIG, false),
  },

  //   {
  //     title: "Connect Ledger",
  //     subtitle: "Use a Ledger hardware wallet",
  //     icon: <Ledger />,
  //     enabled: booleanifyEnv("FEATURE_LEDGER", false),
  //   },
]

export const AddNewAccountScreen: FC = () => {
  const navigate = useNavigate()
  const { addAccount, isAdding } = useAddAccount()
  const { accountClassHash } = useCurrentNetwork()

  const onAccountTypeClick = useCallback(
    async (accountTypeId: AccountTypeId) => {
      switch (accountTypeId) {
        case AccountTypeId.STANDARD:
          return await addAccount({ type: "standard" }) // default

        case AccountTypeId.MULTISIG:
          return navigate(routes.multisigNew())

        // case AccountTypeId.LEDGER:
        // navigate(routes.ledgerEntry())
        // break

        default:
          assertNever(accountTypeId) // Should always be handled
      }
    },
    [addAccount, navigate],
  )

  const isButtonLoading = useCallback(
    (id: AccountType["id"]) => {
      if (id === AccountTypeId.STANDARD && isAdding) {
        return true
      }

      // More cases here

      return false
    },
    [isAdding],
  )

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={() => navigate(-1)} />}
      title="Add a new account"
    >
      <Flex p={4} gap={2} direction="column">
        {accountTypes.map(
          ({ type, icon, id, enabled, title, subtitle }) =>
            enabled &&
            accountClassHash?.[type] && (
              <CustomButtonCell
                key={`account-type-${id}`}
                aria-label={title}
                aria-describedby={subtitle}
                p={4}
                alignItems="center"
                justifyContent="space-between"
                gap={3}
                onClick={() => onAccountTypeClick(id)}
                _hover={{
                  backgroundColor: "neutrals.700",
                  "& > .account-type-avatar": {
                    backgroundColor: "neutrals.600",
                  },
                }}
              >
                <Flex gap={3} alignItems="center" justify="start">
                  <Center
                    borderRadius="full"
                    width={12}
                    height={12}
                    backgroundColor="neutrals.700"
                    className="account-type-avatar"
                  >
                    {icon}
                  </Center>
                  <Flex direction="column" flex={0.5}>
                    <H6>{title}</H6>
                    <P4 fontWeight="bold" color="neutrals.300">
                      {subtitle}
                    </P4>
                  </Flex>
                </Flex>
                {isButtonLoading(id) && <Spinner w={4} h={4} />}
              </CustomButtonCell>
            ),
        )}
      </Flex>
    </NavigationContainer>
  )
}
