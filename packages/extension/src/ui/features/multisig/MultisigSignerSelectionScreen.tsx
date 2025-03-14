import { PasscodePrimaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  BarCloseButton,
  H5,
  NavigationContainer,
  P3,
} from "@argent/x-ui"
import type { FC } from "react"
import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { Circle, Flex } from "@chakra-ui/react"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { useOnLedgerStart } from "../ledger/hooks/useOnLedgerStart"
import { useOnArgentSignerSelection } from "./hooks/useOnArgentSignerSelection"
import { useIsFirefox } from "../../hooks/useUserAgent"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"
import { LedgerLogo } from "@argent/x-ui/logos-deprecated"

type SignerSelectionOptionType = "argent" | "ledger"

interface SignerSelectionOption {
  title: string
  subtitle?: string
  type: SignerSelectionOptionType
}

const createSignerSelectionOptions: SignerSelectionOption[] = [
  {
    title: "Create with Argent",
    subtitle: "Use your current seed phrase",
    type: "argent",
  },
  {
    title: "Create with Ledger",
    subtitle: "Approve transactions with your Ledger",
    type: "ledger",
  },
]

const joinSignerSelectionOptions: SignerSelectionOption[] = [
  {
    title: "Join with Argent",
    subtitle: "Use a signer pubkey from your current Argent X seed phrase",
    type: "argent",
  },
  {
    title: "Join with Ledger",
    subtitle: "Use a signer pubkey from your Ledger",
    type: "ledger",
  },
]

const replaceSignerSelectionOptions: SignerSelectionOption[] = [
  {
    title: "Replace with Argent",
    subtitle: "Use a signer pubkey",
    type: "argent",
  },
  {
    title: "Replace with Ledger",
    subtitle: "Approve transactions with your Ledger",
    type: "ledger",
  },
]

export const MultisigSignerSelectionScreen: FC = () => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)

  const { ctx, signerToReplace } = useParams<{
    ctx: "create" | "join" | "replace"
    signerToReplace: string
  }>()

  const onLedgerStart = useOnLedgerStart("multisig")
  const onArgentSignerSelection = useOnArgentSignerSelection()
  const isFirefox = useIsFirefox()

  const options = useMemo(() => {
    if (ctx === "create") {
      return createSignerSelectionOptions
    }
    if (ctx === "join") {
      return joinSignerSelectionOptions
    }
    return replaceSignerSelectionOptions
  }, [ctx])

  if (!ctx) {
    return <></>
  }

  const onClick = (type: SignerSelectionOptionType) => {
    if (type === "argent") {
      return onArgentSignerSelection(ctx, selectedNetworkId, signerToReplace)
    }
    return onLedgerStart(ctx, selectedNetworkId, signerToReplace)
  }

  const isDisabledOnFirefox = (type: SignerSelectionOptionType) => {
    return type === "ledger" && isFirefox
  }

  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accounts())} />
      }
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title="Multisig account"
    >
      <Flex p={4} gap={2} direction="column">
        {options.map((option, index) => (
          <CustomButtonCell
            key={index}
            aria-label={option.title}
            aria-describedby={option.subtitle}
            p={4}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            onClick={() => void onClick(option.type)}
            isDisabled={isDisabledOnFirefox(option.type)}
            _hover={{
              backgroundColor: "neutrals.700",
              "& > .icon-wrapper": {
                backgroundColor: "neutrals.600",
              },
            }}
          >
            <Flex gap={3} alignItems="center" justify="start">
              <Circle
                borderRadius="full"
                size={12}
                backgroundColor="neutrals.700"
                className="icon-wrapper"
              >
                {option.type === "argent" && (
                  <PasscodePrimaryIcon h={6} w={6} />
                )}
                {option.type === "ledger" && <LedgerLogo h={6} w={6} />}
              </Circle>
              <Flex direction="column" minW={0} whiteSpace="wrap" gap="1">
                <H5>{option.title}</H5>
                {option.subtitle && (
                  <P3 fontWeight="bold" color="neutrals.300" w="full">
                    {isDisabledOnFirefox(option.type)
                      ? "Not supported on Firefox"
                      : option.subtitle}
                  </P3>
                )}
              </Flex>
            </Flex>
          </CustomButtonCell>
        ))}
      </Flex>
    </NavigationContainer>
  )
}
