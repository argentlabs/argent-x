import { addressSchema, hexSchema, voidify } from "@argent/x-shared"
import {
  BarCloseButton,
  FieldError,
  H5,
  L2Bold,
  NavigationContainer,
} from "@argent/x-ui"
import {
  Box,
  Button,
  Flex,
  InputGroup,
  Link,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { clientImportAccountService } from "../../services/importAccount"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { LoadingScreenContainer } from "../actions/LoadingScreenContainer"
import { ImportErrorBottomModal } from "./ImportErrorBottomModal"
import type { AccountImportError } from "../../../shared/accountImport/types"
import { isEmpty, upperFirst } from "lodash-es"
import { useNavigateReturnToOr } from "../../hooks/useNavigateReturnTo"
import { useView } from "../../views/implementation/react"
import { selectedNetworkView } from "../../views/network"
import { clientAccountService } from "../../services/account"

import { typographyStyles } from "@argent/x-ui/theme"

const importPrivateKeySchema = z.object({
  address: addressSchema,
  pk: hexSchema,
})

type ImportPrivateKeyType = z.infer<typeof importPrivateKeySchema>

export const ImportPrivateKeyScreen: FC = () => {
  const [loading, setLoading] = useState(false)
  const [importErrors, setImportErrors] = useState<AccountImportError[]>([])
  const navigate = useNavigate()
  const onBack = useNavigateReturnToOr(routes.accountTokens())

  const network = useView(selectedNetworkView)

  const { isOpen, onClose, onOpen } = useDisclosure()

  const methods = useForm<ImportPrivateKeyType>({
    resolver: zodResolver(importPrivateKeySchema),
  })

  const { register, formState, handleSubmit, watch, setValue, reset } = methods

  const onSubmit = async ({ address, pk }: ImportPrivateKeyType) => {
    setLoading(true)
    const res = await clientImportAccountService.validateImport(
      address,
      pk,
      network.id,
    )

    if (res.success) {
      const account = await clientImportAccountService.importAccount(res.result)
      await clientAccountService.select(account.id)

      setLoading(false)
      return navigate(routes.accountTokens(), { replace: true })
    }

    setLoading(false)
    setImportErrors([res.errorType])
    onOpen()
  }

  const onImportErrorClose = () => {
    onClose()
    reset()
    setImportErrors([])
  }

  const isButtonDisabled = isEmpty(watch("address")) || isEmpty(watch("pk"))

  const handlePaste = (
    field: "address" | "pk",
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ) => {
    event.preventDefault()
    const text = event.clipboardData.getData("text").trim()
    const parsed =
      field === "address" ? addressSchema.parse(text) : hexSchema.parse(text)
    setValue(field, parsed)
  }

  if (loading) {
    return <LoadingScreenContainer loadingTexts={["Importing account..."]} />
  }

  return (
    <NavigationContainer
      title="Import private key"
      rightButton={<BarCloseButton onClick={onBack} />}
    >
      <Flex
        flexDirection="column"
        height="100%"
        justifyContent="space-between"
        pt={2}
        px={4}
        pb={6}
        as="form"
        onSubmit={voidify(handleSubmit(onSubmit))}
        autoComplete="off"
      >
        <Box>
          <Box
            bg="primary.yellow.1000"
            px={3}
            py={2.5}
            borderRadius="xl"
            boxShadow="menu"
            textAlign="center"
            mb={6}
          >
            <L2Bold color="deprecated.accent.yellow">
              Please note that imported accounts won’t be accessible after
              performing a recovery
            </L2Bold>
          </Box>

          <Flex
            px={5}
            py={4.5}
            justifyContent="space-between"
            bg="surface-elevated"
            borderRadius="lg"
            mb={4}
          >
            <H5>Network</H5>
            <H5 color="neutrals.300">{upperFirst(network.name)}</H5>
          </Flex>

          <InputGroup mb={2} display="flex" flexDirection="column" gap="1">
            <Textarea
              {...register("address")}
              placeholder="Account address (0x...)"
              px={5}
              py={4.5}
              h={19}
              bg="transparent"
              border="1px solid"
              borderColor="neutrals.800"
              isInvalid={!!formState.errors.address}
              onPaste={(e) => handlePaste("address", e)}
              fontSize="md"
              resize="none"
              autoFocus
            />
            {formState.errors.address && (
              <FieldError>Invalid address</FieldError>
            )}
          </InputGroup>

          <InputGroup mb={2} display="flex" flexDirection="column" gap="1">
            <Textarea
              {...register("pk")}
              placeholder="Private key"
              px={5}
              py={4.5}
              h={19}
              bg="transparent"
              borderColor="neutrals.800"
              isInvalid={!!formState.errors.pk}
              onPaste={(e) => handlePaste("pk", e)}
              fontSize="md"
              resize="none"
            />
          </InputGroup>
          {formState.errors.pk && (
            <FieldError>
              Invalid Private Key format. Must be a hex string
            </FieldError>
          )}

          <Flex mb={2} px={2} w="full" justifyContent="end">
            <Link
              {...typographyStyles.L2Bold}
              color="text-secondary"
              href="https://support.argent.xyz/hc/en-us/articles/21550932425501-Where-can-I-find-my-private-key"
              isExternal
            >
              Where can I find my private key?
            </Link>
          </Flex>
        </Box>

        <Button
          colorScheme="primary"
          type="submit"
          isDisabled={isButtonDisabled}
        >
          Import
        </Button>
      </Flex>
      <ImportErrorBottomModal
        isOpen={isOpen}
        onClose={onImportErrorClose}
        errors={importErrors}
      />
    </NavigationContainer>
  )
}
