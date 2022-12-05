import { Button, FieldError, H4, H6, Input, L2 } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC } from "react"
import { useForm } from "react-hook-form"

import { Layout } from "../components/Layout"
import { setPasswordFormSchema } from "../schemas/forms/password"
import { isSubmitDisabled } from "../schemas/utils"

interface SetPasswordFormProps {
  email: string
  onSubmit: (values: { password: string }) => unknown
}

export const SetPasswordForm: FC<SetPasswordFormProps> = ({
  email,
  onSubmit,
}) => {
  const { formState, handleSubmit, register } = useForm({
    defaultValues: {
      password: "",
      repeatPassword: "",
    },
    resolver: zodResolver(setPasswordFormSchema),
  })

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={8}
      >
        <H4 textAlign="center">Set a password for your Argent WebWallet</H4>
        <H6 textAlign="center">{email}</H6>
      </Box>
      <Input
        // TODO: [UI] Add good password strength indicator
        placeholder="New password"
        mb={2}
        autoFocus
        {...register("password")}
        isInvalid={!!formState.errors.password}
      />
      <FieldError minH="1em" alignSelf="start">
        {formState.errors.password?.message}
      </FieldError>
      <Input
        placeholder="Repeat password"
        mb={2}
        {...register("repeatPassword")}
        isInvalid={!!formState.errors.repeatPassword}
      />
      <FieldError minH="1em" alignSelf="start">
        {formState.errors.repeatPassword?.message}
      </FieldError>
      <L2 as="a" href="#" mt={4} color={"accent.500"}>
        How does this work?
      </L2>
      <Button
        colorScheme={"primary"}
        mt={8}
        type="submit"
        isLoading={formState.isSubmitting}
        disabled={isSubmitDisabled(formState)}
      >
        Continue
      </Button>
    </Box>
  )
}
