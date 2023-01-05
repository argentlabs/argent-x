import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  FieldError,
  Input,
  NavigationContainer,
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
import { ShieldHeader } from "./ShieldHeader"

const schema = yup.object().required().shape({
  email: yup.string().email().required(),
})

export interface ShieldBaseEmailScreenProps {
  onBack?: () => void
  onCancel?: () => void
  onEmailRequested: (email: string) => void
}

export const ShieldBaseEmailScreen: FC<ShieldBaseEmailScreenProps> = ({
  onBack,
  onCancel,
  onEmailRequested,
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
            console.log("Registering email", email)
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
          title={"1 - Enter email"}
          subtitle={"Enter email that should be used for 2FA"}
        />
        <Input
          isInvalid={Boolean(formState.errors.email)}
          placeholder="Enter email"
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
