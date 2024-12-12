import { addressSchema, type Address } from "@argent/x-shared"
import {
  B2,
  BarBackButton,
  Button,
  CellStack,
  H3,
  HeaderCell,
  icons,
  ModalBottomDialog,
  NavigationContainer,
  P2,
  useToast,
} from "@argent/x-ui"
import { Box, Center, Flex, FormControl, useDisclosure } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC, ReactNode } from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { ampli } from "../../../shared/analytics"
import type { RequestToken } from "../../../shared/token/__new/types/token.model"
import { RequestTokenSchema } from "../../../shared/token/__new/types/token.model"
import { ControlledInput } from "../../components/ControlledInput"

const { WarningCircleSecondaryIcon } = icons

interface ScamWarningModalProps {
  onClose: () => void
  onContinue: () => void
  isOpen: boolean
}

export const ScamWarningDialog: FC<ScamWarningModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  return (
    <ModalBottomDialog isOpen={isOpen} onClose={onClose}>
      <Center flexDirection="column" textAlign="center">
        <Box mb="4">
          <WarningCircleSecondaryIcon
            h="40.5px"
            w="40.5px"
            color="primary.red.400"
          />
        </Box>
        <H3 mb="2">Spam token identified</H3>
        <Box pb="6" textAlign="center">
          <P2 color="deprecated.neutrals.300">
            The token you are adding has been identified by Argent as a spam
            token
          </P2>
        </Box>

        <Button w="full" bg="deprecated.neutrals.700" onClick={onContinue}>
          <B2>Add this token</B2>
        </Button>
      </Center>
    </ModalBottomDialog>
  )
}

export const AddTokenScreenSchema = RequestTokenSchema.omit({
  networkId: true,
}).required()

export type AddTokenScreenSchemaType = z.infer<typeof AddTokenScreenSchema>

interface AddTokenScreenProps {
  error?: string
  tokenDetails?: RequestToken
  hideBackButton?: boolean
  onContinue: (token: AddTokenScreenSchemaType) => Promise<void>
  onReject?: () => void
  onTokenAddressChange: (address: Address) => void
  isLoading: boolean
  isExistingToken: boolean
  isHiddenToken?: boolean
  isSpamToken?: boolean
  footer?: ReactNode
}

export const AddTokenScreen: FC<AddTokenScreenProps> = ({
  error,
  hideBackButton,
  onContinue,
  onReject,
  tokenDetails,
  onTokenAddressChange,
  isLoading,
  isExistingToken,
  isHiddenToken,
  isSpamToken,
  footer,
}) => {
  const {
    formState: { errors, isSubmitting },
    control,
    watch,
    handleSubmit,
    setError,
    reset,
  } = useForm<AddTokenScreenSchemaType>({
    defaultValues: tokenDetails,
    resolver: zodResolver(AddTokenScreenSchema),
  })

  const toast = useToast()

  const {
    isOpen: isScamWarningModalOpen,
    onClose: onScamWarningModalClose,
    onOpen: onScamWarningModalOpen,
  } = useDisclosure()

  useEffect(() => {
    reset(tokenDetails)
  }, [reset, tokenDetails])

  useEffect(() => {
    setError("root", { message: error })
  }, [error, setError])

  useEffect(() => {
    if (isExistingToken) {
      let warningText = "You are adding a token that you already own"
      if (isHiddenToken) {
        warningText =
          "You are adding a token that you already own and is hidden"
      }
      toast({
        title: warningText,
        status: "info",
        duration: 5000,
      })
    } else if (isSpamToken) {
      onScamWarningModalOpen()
    }
    if (errors?.root?.message) {
      toast({
        title: errors.root.message,
        status: "info",
        duration: 5000,
      })
    }
  }, [
    errors?.root?.message,
    isExistingToken,
    isHiddenToken,
    isSpamToken,
    onScamWarningModalOpen,
    toast,
  ])

  useEffect(() => {
    const { unsubscribe } = watch((value, { name, type }) => {
      const trimmedAddress = value.address?.trim()
      if (addressSchema.safeParse(trimmedAddress).success) {
        if (type === "change" && name === "address" && trimmedAddress) {
          onTokenAddressChange(trimmedAddress as Address)
        }
      }
    })
    return () => unsubscribe()
  }, [onTokenAddressChange, watch])

  const handleForm = handleSubmit(async (values: AddTokenScreenSchemaType) => {
    try {
      await onContinue(values)
      void ampli.customTokenAdded({
        "wallet platform": "browser extension",
      })
    } catch (error) {
      setError("root", { message: `${error}` })
    }
  })

  const handleFormOnClose = () => {
    void handleForm()
    onScamWarningModalClose()
  }

  return (
    <NavigationContainer
      title={"Add tokens"}
      leftButton={hideBackButton ? null : <BarBackButton />}
    >
      <FormControl
        as="form"
        display={"flex"}
        flexDirection={"column"}
        flex={1}
        onSubmit={(e) => void handleForm(e)}
        isDisabled={isSubmitting}
      >
        <CellStack pt={0} flex={1}>
          <HeaderCell>Contract address</HeaderCell>
          <ControlledInput
            name="address"
            control={control}
            autoFocus
            placeholder="0x123"
          />
          <HeaderCell>Name</HeaderCell>
          <ControlledInput
            name="name"
            control={control}
            placeholder="Token"
            type="text"
          />
          <HeaderCell>Symbol</HeaderCell>
          <ControlledInput
            name="symbol"
            control={control}
            placeholder="TOK"
            type="text"
          />
          <HeaderCell>Decimals</HeaderCell>
          <ControlledInput
            name="decimals"
            control={control}
            placeholder="18"
            type="number"
          />
          <Flex flex={1} />
          {footer}
          <Flex gap={1} flex={1}>
            {onReject && (
              <Button onClick={onReject} type="button" w="full">
                Reject
              </Button>
            )}
            <Button
              type="submit"
              isDisabled={isSubmitting || isLoading || isExistingToken}
              isLoading={isSubmitting || isLoading}
              loadingText={"Validating"}
              colorScheme={"primary"}
              w="full"
            >
              Add token
            </Button>
          </Flex>
        </CellStack>
      </FormControl>
      <ScamWarningDialog
        isOpen={isScamWarningModalOpen}
        onClose={onScamWarningModalClose}
        onContinue={handleFormOnClose}
      />
    </NavigationContainer>
  )
}
