import {
  PlusSecondaryIcon,
  AddContactSecondaryIcon,
  MultisigImageIcon,
} from "@argent/x-ui/icons"
import {
  B2,
  BarBackButton,
  BarCloseButton,
  H5,
  NavigationContainer,
  P3,
  StickyGroup,
} from "@argent/x-ui"
import { Button, Center, Flex, Text } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { CustomButtonCell } from "../../components/CustomButtonCell"
import { routes } from "../../../shared/ui/routes"
import { useOnLedgerStart } from "../ledger/hooks/useOnLedgerStart"
import { useIsFirefox } from "../../hooks/useUserAgent"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"

import { LedgerLogo } from "@argent/x-ui/logos-deprecated"

type MultisigOptionType = "create" | "join"

interface MultisigOption {
  title: string
  subtitle?: string
  type: MultisigOptionType
  icon: React.ReactNode
}

const multisigOptions: MultisigOption[] = [
  {
    title: "Create new multisig",
    type: "create",
    icon: <PlusSecondaryIcon />,
  },
  {
    title: "Join existing multisig",
    type: "join",
    icon: <AddContactSecondaryIcon />,
  },
]

export const NewMultisigScreen: FC = () => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const isFirefox = useIsFirefox()

  const onClick = (type: MultisigOptionType) =>
    navigate(routes.multisigSignerSelection(type))

  const onLedgerStart = useOnLedgerStart("multisig")

  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accounts())} />
      }
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title="Multisig account"
    >
      <Flex p={4} gap={2} direction="column">
        <Flex
          borderRadius="xl"
          p={3}
          gap={4}
          alignItems="center"
          border="1px solid"
          borderColor="white.30"
          mb={1}
        >
          <Text fontSize="58px">
            <MultisigImageIcon />
          </Text>
          <P3 color="neutrals.100" flex={1} textAlign="left">
            A multisig allows multiple owners to manage an account by requiring
            multiple confirmations for a transaction
          </P3>
        </Flex>
        {multisigOptions.map((option, index) => (
          <CustomButtonCell
            key={index}
            aria-label={option.title}
            aria-describedby={option.subtitle}
            p={4}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            onClick={() => onClick(option.type)}
            _hover={{
              backgroundColor: "neutrals.700",
              "& > .icon-wrapper": {
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
                className="icon-wrapper"
              >
                {option.icon}
              </Center>
              <Flex direction="column" flex={0.5}>
                <H5>{option.title}</H5>
                {option.subtitle && (
                  <P3 fontWeight="bold" color="neutrals.300">
                    {option.subtitle}
                  </P3>
                )}
              </Flex>
            </Flex>
          </CustomButtonCell>
        ))}
      </Flex>
      {!isFirefox && (
        <StickyGroup>
          <Button
            variant="ghost"
            p="6"
            borderTop="1px solid"
            borderRadius="0"
            color="neutrals.800"
            boxShadow="menu"
            onClick={() => onLedgerStart("restore", selectedNetworkId)}
          >
            <Center>
              <Flex gap="2" align="center" justify="center">
                <LedgerLogo h={4} w={4} color="white.50" />
                <B2 color="white.50">Restore multisig with Ledger</B2>
              </Flex>
            </Center>
          </Button>
        </StickyGroup>
      )}
    </NavigationContainer>
  )
}
