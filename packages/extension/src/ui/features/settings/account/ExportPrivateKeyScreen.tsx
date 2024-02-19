import {
  BarBackButton,
  CellStack,
  HeaderCell,
  L2,
  NavigationContainer,
  P3,
  icons,
} from "@argent/ui"
import { FC, ReactEventHandler, useEffect, useState } from "react"
import { Button, Center, Flex } from "@chakra-ui/react"
import copy from "copy-to-clipboard"

import { useRouteAccountAddress } from "../../../routes"
import { usePrivateKey } from "../../accountTokens/usePrivateKey"
import { PasswordForm, PasswordFormProps } from "../../lock/PasswordForm"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { WarningRecoveryBanner } from "../ui/WarningRecoveryBanner"
import { QrCode } from "../../../components/QrCode"

const { AlertFillIcon } = icons

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
        <UnlockExportPrivateKey verifyPassword={verifyPassword} />
      )}
    </NavigationContainer>
  )
}

function ExportPrivateKey({
  privateKey: privateKeyProp,
}: {
  privateKey?: string
}) {
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
      <Center overflow={"hidden"} flexDirection={"column"} gap={6} px={6}>
        <QrCode size={208} data={privateKey} data-key={privateKey} />
        <P3
          aria-label="Private key"
          textAlign={"center"}
          fontWeight={"semibold"}
          w={"full"}
        >
          {privateKey}
        </P3>
        <Button
          colorScheme={privateKeyCopied ? "inverted" : undefined}
          size={"sm"}
          leftIcon={<AlertFillIcon color="warn.500" />}
          mx={"auto"}
          onClick={onCopy}
        >
          {privateKeyCopied ? "Copied" : "Copy"}
        </Button>
      </Center>
    </CellStack>
  )
}

function UnlockExportPrivateKey({
  verifyPassword,
}: Pick<PasswordFormProps, "verifyPassword">) {
  return (
    <CellStack flex={1}>
      <WarningRecoveryBanner
        title="Never share your private key!"
        reasons={[
          "It’s the only way to recover your wallet",
          "If someone else has access to your private key they can control your wallet",
        ]}
        mb={4}
      />
      <HeaderCell color={"text.primary"}>Enter your password</HeaderCell>
      <PasswordForm flex={1} verifyPassword={verifyPassword}>
        {(isDirty) => (
          <>
            <Flex flex={1}></Flex>
            <Button
              type="submit"
              disabled={!isDirty}
              colorScheme="primary"
              width="full"
            >
              Unlock
            </Button>
          </>
        )}
      </PasswordForm>
    </CellStack>
  )
}
