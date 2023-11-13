import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  FieldError,
  FlowHeader,
  Input,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { FC } from "react"
import { useForm } from "react-hook-form"

import { resetDevice } from "../../../shared/shield/jwt"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArgentAccountFeaturesList } from "./ArgentAccountFeaturesList"
import { argentAccountService } from "../../services/argentAccount"
import { Box } from "@chakra-ui/react"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import {
  ArgentAccountBaseEmailScreenProps,
  emailSchema,
} from "./argentAccountBaseEmailScreen.model"

const { EmailIcon } = icons

const screenContent = {
  shield: {
    title: "Argent Shield",
    subtitle:
      "Enter email to sign in to Argent, and activate two-factor authentication",
  },
  argentAccount: {
    title: undefined,
    subtitle: "By signing in to Argent you can use:",
  },
  emailPreferences: {
    title: "Email notifications",
    subtitle:
      "Enter email to sign in to Argent, and activate email notifications",
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
      await argentAccountService.requestEmail(email)
      onEmailRequested(email)
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
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
        onSubmit={onSubmit}
        justifyContent={"space-between"}
        pt={0}
      >
        <Box>
          <FlowHeader
            icon={EmailIcon}
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
          />
          <FieldError>{formState.errors.email?.message}</FieldError>
        </Box>
        {flow === "argentAccount" && (
          <ArgentAccountFeaturesList isLoggedIn={false} />
        )}
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
