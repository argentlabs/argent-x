import { MessageSecondaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  FieldError,
  FlowHeader,
  NavigationContainer,
  useToast,
} from "@argent/x-ui"
import type { FC } from "react"
import { useForm } from "react-hook-form"

import { Box, Link, Text, Input } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { voidify } from "@argent/x-shared"

import { ARGENT_X_LEGAL_PRIVACY_POLICY_URL } from "../../../shared/api/constants"
import { resetDevice } from "../../../shared/smartAccount/jwt"
import { coerceErrorToString } from "../../../shared/utils/error"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { clientArgentAccountService } from "../../services/argentAccount"
import type { ArgentAccountBaseEmailScreenProps } from "./argentAccountBaseEmailScreen.model"
import { emailSchema } from "./argentAccountBaseEmailScreen.model"

const screenContent = {
  toggleSmartAccount: {
    title: undefined,
    subtitle:
      "Enter email to sign in to Argent, and activate smart account features",
  },
  createSmartAccount: {
    title: undefined,
    subtitle:
      "Smart Account uses email to enable additional security features on your account",
  },
  argentAccount: {
    title: undefined,
    subtitle: "By signing in to Argent you can use:",
  },
}

export const ArgentAccountBaseEmailScreen: FC<
  ArgentAccountBaseEmailScreenProps
> = ({ onBack, onCancel, onEmailRequested, flow }) => {
  const toast = useToast()
  const { handleSubmit, register, formState } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(emailSchema),
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      /** reset to ensure if new email validates it is always associated with fresh device */
      await resetDevice()
      await clientArgentAccountService.requestEmail(email)
      onEmailRequested(email)
    } catch (error) {
      console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to verify email",
        status: "error",
        duration: 3000,
      })
    }
  })

  const { ref, ...rest } = register("email")
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  return (
    <NavigationContainer
      leftButton={
        onBack ? (
          <BarBackButton onClick={onBack} />
        ) : onCancel ? (
          <BarCloseButton onClick={onCancel} />
        ) : null
      }
      title={screenContent[flow].title}
    >
      <CellStack
        as={"form"}
        display={"flex"}
        flex={1}
        onSubmit={voidify(onSubmit)}
        justifyContent={"space-between"}
        pt={0}
      >
        <Box>
          <FlowHeader
            icon={MessageSecondaryIcon}
            title="Enter email"
            subtitle={screenContent[flow].subtitle}
            variant="primary"
            size="md"
            pb={1}
            pt={0}
          />
          <Input
            {...rest}
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            mt={4}
            isInvalid={Boolean(formState.errors.email)}
            placeholder="Email"
            disabled={formState.isSubmitting}
            data-testid="email-input"
          />
          <FieldError>{formState.errors.email?.message}</FieldError>
          <Text mt={3} fontSize={13} color="neutrals.300" lineHeight={4}>
            We use email for security alerts. For unsubscribing and other
            details see our{" "}
            <Link
              href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
              target="_blank"
              color="text-brand"
            >
              Privacy Policy
            </Link>
          </Text>
        </Box>

        <Button
          colorScheme={"primary"}
          type="submit"
          isDisabled={!formState.isDirty || Boolean(formState.errors.email)}
          isLoading={formState.isSubmitting}
          loadingText={"Verifying email"}
        >
          Next
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
