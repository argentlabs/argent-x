import { Alert, B3, FieldError, SeedInput, icons } from "@argent/ui"
import { Flex, chakra } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC, MouseEventHandler } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { seedphraseSchema } from "../../../shared/schemas/seedphrase"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const { AlertIcon } = icons

interface OnboardingRestoreSeedScreenProps {
  onBack?: MouseEventHandler
  onRestore: (seedPhrase: string) => Promise<void>
  onUseBackup?: MouseEventHandler
}

const seedFormSchema = z.object({
  seedPhrase: seedphraseSchema,
})

export const OnboardingRestoreSeedScreen: FC<
  OnboardingRestoreSeedScreenProps
> = ({ onBack, onRestore, onUseBackup }) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    resolver: zodResolver(seedFormSchema),
    defaultValues: {
      seedPhrase: "",
    },
  })

  const handleForm = handleSubmit(async ({ seedPhrase }) => {
    try {
      await onRestore(seedPhrase)
    } catch (error) {
      setError("root", { message: "Something went wrong" })
    }
  })

  return (
    <OnboardingScreen
      onBack={onBack}
      length={4}
      currentIndex={1}
      title={"Restore accounts"}
      subtitle="Enter each of the 12 words from your recovery phrase separated by a
      space"
    >
      <chakra.form onSubmit={handleForm}>
        <Controller
          name="seedPhrase"
          control={control}
          render={({ field: { onChange } }) => (
            <SeedInput onChange={onChange} />
          )}
        />
        {errors.seedPhrase?.message && (
          <FieldError>{errors.seedPhrase?.message}</FieldError>
        )}

        <Alert
          mt={8}
          size={"lg"}
          icon={<AlertIcon />}
          colorScheme={"warning"}
          title="Typing is safer"
          description="You can paste your recovery phrase at once, but typing the words individually is safer"
        />

        <Flex mt={8}>
          <OnboardingButton type="submit" isDisabled={isSubmitting}>
            Continue
          </OnboardingButton>
          <B3
            color={"neutrals.500"}
            textDecoration={"underline"}
            display={"flex"}
            marginLeft={"auto"}
            textAlign={"right"}
            onClick={onUseBackup}
            cursor={"pointer"}
            mt={2}
          >
            Recover using a backup file
          </B3>
        </Flex>

        {errors.root?.message && (
          <FieldError>{errors.root?.message}</FieldError>
        )}
      </chakra.form>
    </OnboardingScreen>
  )
}
