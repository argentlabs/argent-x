import {
  BarBackButton,
  CellStack,
  L2,
  NavigationContainer,
  P3,
  iconsDeprecated,
  B3,
} from "@argent/x-ui"
import { FC, ReactEventHandler, useState } from "react"
import { Button, Center, Flex } from "@chakra-ui/react"
import copy from "copy-to-clipboard"

import { useRouteAccountAddress } from "../../../hooks/useRoute"
import { usePrivateKey } from "../../accountTokens/usePrivateKey"
import { PasswordFormProps } from "../../lock/PasswordForm"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { QrCode } from "../../../components/QrCode"
import { PasswordWarningForm } from "../ui/PasswordWarningForm"

const { AlertFillIcon, HideIcon } = iconsDeprecated

export interface ExportPrivateKeyScreenProps
  extends Pick<PasswordFormProps, "verifyPassword"> {
  onBack: ReactEventHandler
  passwordIsValid: boolean
  privateKey?: string
}

export const ExportPrivateKeyScreen: FC<ExportPrivateKeyScreenProps> = ({
  onBack,
  passwordIsValid,
  verifyPassword,
  privateKey,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Export private key"}
    >
      {passwordIsValid ? (
        <ExportPrivateKey privateKey={privateKey} />
      ) : (
        <PasswordWarningForm
          verifyPassword={verifyPassword}
          title="Never share your private key!"
          reasons={[
            "It’s the only way to recover your wallet",
            "If someone else has access to your private key they can control your wallet",
          ]}
        />
      )}
    </NavigationContainer>
  )
}

function ExportPrivateKey({
  privateKey: privateKeyProp,
}: {
  privateKey?: string
}) {
  const [isBlurred, setIsBlurred] = useState(true)

  const handleClick = () => {
    setIsBlurred(!isBlurred)
  }
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false)
  const accountAddress = useRouteAccountAddress()
  const network = useCurrentNetwork()
  const privateKey = usePrivateKey(accountAddress, network.id) || privateKeyProp
  if (!privateKey) {
    return null
  }
  const onCopy = () => {
    copy(privateKey)
    setPrivateKeyCopied(true)
    setTimeout(() => {
      setPrivateKeyCopied(false)
    }, 3000)
  }
  return (
    <CellStack>
      <Flex
        rounded={"xl"}
        textAlign={"center"}
        color="warn.500"
        px={3}
        py={2.5}
        bg={"warn.900"}
        mb={4}
      >
        <L2>
          WARNING! Never disclose this key. Anyone with your private key can
          steal any assets held in your account
        </L2>
      </Flex>
      <Center
        onClick={handleClick}
        filter={isBlurred ? "blur(5px)  brightness(30%)" : "none"}
        overflow={"hidden"}
        flexDirection={"column"}
        gap={6}
        px={6}
      >
        <QrCode size={208} data={privateKey} data-key={privateKey} />
        <P3
          aria-label="Private key"
          textAlign={"center"}
          fontWeight={"semibold"}
          w={"full"}
        >
          {privateKey}
        </P3>
      </Center>
      {isBlurred && (
        <Center
          position="absolute"
          top="0"
          right="0"
          left="0"
          bottom="0"
          alignItems="center"
          justifyContent="center"
          filter="none"
          onClick={handleClick}
          cursor="pointer"
          flexDirection="column"
        >
          <HideIcon fontSize="2xl" mb={2} />
          <B3 fontWeight="bold">Click to reveal private key</B3>
        </Center>
      )}
      <Button
        mt={3}
        colorScheme={privateKeyCopied ? "inverted" : undefined}
        size={"sm"}
        leftIcon={<AlertFillIcon color="warn.500" />}
        mx={"auto"}
        onClick={onCopy}
      >
        {privateKeyCopied ? "Copied" : "Copy"}
      </Button>
    </CellStack>
  )
}
