import { Address } from "@argent/shared"
import {
  Alert,
  BarBackButton,
  Button,
  CellStack,
  HeaderCell,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex, FormControl } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC, ReactNode, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { ControlledInput } from "../../components/ControlledInput"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import {
  RequestToken,
  RequestTokenSchema,
} from "../../../shared/token/__new/types/token.model"

const { AlertIcon } = icons

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

  useEffect(() => {
    reset(tokenDetails)
  }, [reset, tokenDetails])

  useEffect(() => {
    setError("root", { message: error })
  }, [error, setError])

  useEffect(() => {
    const { unsubscribe } = watch((value, { name, type }) => {
      if (type === "change" && name === "address" && value.address) {
        onTokenAddressChange(value.address)
      }
    })
    return () => unsubscribe()
  }, [onTokenAddressChange, watch])

  const handleForm = handleSubmit(async (values: AddTokenScreenSchemaType) => {
    try {
      await onContinue(values)
    } catch (error) {
      setError("root", { message: `${error}` })
    }
  })

  const warningText = useMemo(() => {
    if (isExistingToken) {
      return "This action will edit tokens that are already listed in your wallet, which can be used to phish you. Only approve if you are certain that you mean to change what these tokens represent."
    }
    if (errors?.root?.message) {
      return errors.root.message
    }
  }, [errors?.root?.message, isExistingToken])

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
          {warningText && (
            <Alert
              size={"lg"}
              icon={<AlertIcon />}
              colorScheme={"warning"}
              description={warningText}
            />
          )}
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
              isDisabled={isSubmitting || isLoading}
              isLoading={isSubmitting || isLoading}
              loadingText={"Validating"}
              colorScheme={"primary"}
              w="full"
            >
              Continue
            </Button>
          </Flex>
        </CellStack>
      </FormControl>
    </NavigationContainer>
  )
}
