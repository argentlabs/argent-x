import { BarCloseButton, H6, NavigationContainer, P4, icons } from "@argent/ui"
import { Center, Flex, Text } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { urlWithQuery } from "../../../shared/utils/url"
import { useAppState } from "../../app.state"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { routes } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { useCreatePendingMultisig } from "./hooks/useCreatePendingMultisig"
import { usePendingMultisigs } from "./multisig.state"
import { uiService } from "../../../shared/__new/services/ui"

const { AddIcon, MultisigJoinIcon, MultisigImageIcon: MultisigDiagram } = icons

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
    icon: <AddIcon />,
  },
  {
    title: "Join existing multisig",
    subtitle: "Create a new signer pubkey",
    type: "join",
    icon: <MultisigJoinIcon />,
  },
]

export const NewMultisigScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { createPendingMultisig } = useCreatePendingMultisig()

  // HACK - this is a workaround to force the pending multisigs to be updated
  const pendingMultisigs = usePendingMultisigs({ showHidden: true })

  const onClick = useCallback(
    async (type: MultisigOptionType) => {
      switch (type) {
        case "create": {
          const url = urlWithQuery("index.html", {
            goto: "multisig",
            networkId: switcherNetworkId,
          })
          chrome.tabs.create({
            url,
          })
          navigate(routes.accounts())
          void uiService.closePopup()
          break
        }

        case "join": {
          // Initialize the multisig account with a zero multisig
          const pendingMultisig = await createPendingMultisig(switcherNetworkId)
          if (pendingMultisig) {
            navigate(routes.multisigJoin(pendingMultisig.publicKey))
          }
          break
        }

        default:
          assertNever(type)
      }
    },
    [switcherNetworkId, createPendingMultisig, navigate],
  )

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={() => navigate(-1)} />}
      title="Multisig account"
    >
      <Flex p={4} gap={2} direction="column">
        <Flex
          borderRadius="xl"
          p={3}
          gap={4}
          alignItems="center"
          border="1px solid"
          borderColor="white30"
          mb={1}
        >
          <Text fontSize="58px">
            <MultisigDiagram />
          </Text>
          <P4 color="neutrals.100" flex={1} textAlign="left">
            A multisig allows multiple owners to manage an account by requiring
            multiple confirmations for a transaction
          </P4>
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
                <H6>{option.title}</H6>
                {option.subtitle && (
                  <P4 fontWeight="bold" color="neutrals.300">
                    {option.subtitle}
                  </P4>
                )}
              </Flex>
            </Flex>
          </CustomButtonCell>
        ))}
      </Flex>
    </NavigationContainer>
  )
}
