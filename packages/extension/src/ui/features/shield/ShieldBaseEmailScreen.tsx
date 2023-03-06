import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  FieldError,
  Input,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"

import { requestEmail } from "../../../shared/shield/register"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { ShieldHeader } from "./ui/ShieldHeader"

const { LockIcon } = icons

const schema = yup.object().required().shape({
  email: yup.string().email().required(),
})

export interface ShieldBaseEmailScreenProps {
  onBack?: () => void
  onCancel?: () => void
  onEmailRequested: (email: string) => void
  hasGuardian?: boolean
}

export const ShieldBaseEmailScreen: FC<ShieldBaseEmailScreenProps> = ({
  onBack,
  onCancel,
  onEmailRequested,
  hasGuardian,
}) => {
  const resolver = useYupValidationResolver(schema)
  const toast = useToast()

  const { handleSubmit, register, formState } = useForm({
    defaultValues: {
      email: "",
    },
    resolver,
  })
  return (
    <NavigationContainer
      leftButton={
        onBack ? (
          <BarBackButton onClick={onBack} />
        ) : onCancel ? (
          <BarCloseButton onClick={onCancel} />
        ) : null
      }
      title={"Argent Shield"}
    >
      <CellStack
        as={"form"}
        display={"flex"}
        flex={1}
        onSubmit={handleSubmit(async ({ email }) => {
          try {
            await requestEmail(email)
            onEmailRequested(email)
          } catch (error) {
            IS_DEV && console.warn(coerceErrorToString(error))
            toast({
              title: "Unable to verify email",
              status: "error",
              duration: 3000,
            })
          }
        })}
      >
        <ShieldHeader
          icon={LockIcon}
          title={hasGuardian ? "Verify Argent Shield" : "Enter email"}
          subtitle={
            hasGuardian
              ? "Enter email that is used for two-factor authentication"
              : "Enter email that should be used for two-factor authentication"
          }
        />
        <Input
          isInvalid={Boolean(formState.errors.email)}
          placeholder="Email"
          autoFocus
          disabled={formState.isSubmitting}
          {...register("email")}
        />
        <FieldError>{formState.errors.email?.message}</FieldError>
        <Flex flex={1} />
        <Button
          colorScheme={"primary"}
          type="submit"
          disabled={!formState.isDirty}
          isLoading={formState.isSubmitting}
          loadingText={"Verifying email"}
        >
          Next
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
