import { WarningCirclePrimaryIcon, HideSecondaryIcon } from "@argent/x-ui/icons"
import {
  B3,
  BarBackButton,
  CellStack,
  L2Bold,
  NavigationContainer,
  P2,
} from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"
import { useState } from "react"
import { Button, Center, Flex } from "@chakra-ui/react"
import copy from "copy-to-clipboard"

import { useRouteAccountId } from "../../../hooks/useRoute"
import { usePrivateKey } from "../../accountTokens/usePrivateKey"
import type { PasswordFormProps } from "../../lock/PasswordForm"
import { QrCode } from "../../../components/QrCode"
import { PasswordWarningForm } from "../ui/PasswordWarningForm"
import { upperFirst } from "lodash-es"

export interface ExportPrivateKeyScreenProps
  extends Pick<PasswordFormProps, "verifyPassword"> {
  onBack: ReactEventHandler
  passwordIsValid: boolean
  privateKey?: string
  type?: "export" | "reveal"
}

export const ExportPrivateKeyScreen: FC<ExportPrivateKeyScreenProps> = ({
  onBack,
  passwordIsValid,
  verifyPassword,
  privateKey,
  type,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={`${upperFirst(type)} private key`}
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
  const accountId = useRouteAccountId()
  const privateKey = usePrivateKey(accountId) || privateKeyProp
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
        <L2Bold>
          WARNING! Never disclose this key. Anyone with your private key can
          steal any assets held in your account
        </L2Bold>
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
        <P2
          aria-label="Private key"
          textAlign={"center"}
          fontWeight={"semibold"}
          w={"full"}
        >
          {privateKey}
        </P2>
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
          <HideSecondaryIcon fontSize="2xl" mb={2} />
          <B3 fontWeight="bold">Click to reveal private key</B3>
        </Center>
      )}
      <Button
        mt={3}
        colorScheme={privateKeyCopied ? "inverted" : undefined}
        size={"sm"}
        leftIcon={<WarningCirclePrimaryIcon color="warn.500" />}
        mx={"auto"}
        onClick={onCopy}
      >
        {privateKeyCopied ? "Copied" : "Copy"}
      </Button>
    </CellStack>
  )
}
