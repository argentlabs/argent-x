import { seedphraseSchema } from "@argent/x-shared"
import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"
import { Alert, B3, FieldError, SeedInput } from "@argent/x-ui"
import { Flex, chakra } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC, MouseEventHandler } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { IS_DEV } from "../../../shared/utils/dev"

interface OnboardingRestoreSeedScreenProps {
  onBack?: MouseEventHandler
  onRestore: (seedPhrase: string) => Promise<void>
  onUseBackup?: MouseEventHandler
  presetSeed?: string
}

const seedFormSchema = z.object({
  seedPhrase: seedphraseSchema,
})

export const OnboardingRestoreSeedScreen: FC<
  OnboardingRestoreSeedScreenProps
> = ({ onBack, onRestore, onUseBackup, presetSeed }) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    resolver: zodResolver(seedFormSchema),
    defaultValues: {
      seedPhrase: presetSeed || "",
    },
  })

  const handleForm = handleSubmit(async ({ seedPhrase }) => {
    try {
      await onRestore(seedPhrase)
    } catch {
      setError("root", { message: "Something went wrong" })
    }
  })

  return (
    <OnboardingScreen
      onBack={onBack}
      length={5} // there are 5 steps in the onboarding process
      currentIndex={2} // this is the 3rd step
      title={"Restore accounts"}
      subtitle="Enter each of the 12 words from your recovery phrase separated by a
      space"
    >
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <chakra.form onSubmit={handleForm}>
        <Controller
          name="seedPhrase"
          control={control}
          render={({ field: { onChange, value } }) => (
            <SeedInput onChange={onChange} value={value} />
          )}
        />
        {errors.seedPhrase?.message && (
          <FieldError>{errors.seedPhrase?.message}</FieldError>
        )}

        <Alert
          mt={8}
          size={"lg"}
          icon={<WarningCircleSecondaryIcon />}
          colorScheme={"warning"}
          title="Typing is safer"
          description="You can paste your recovery phrase at once, but typing the words individually is safer"
        />

        <Flex mt={15}>
          <OnboardingButton type="submit" isDisabled={isSubmitting}>
            Continue
          </OnboardingButton>
          {/** Keep Restore with Backup only for Dev builds for user-support purposes */}
          {IS_DEV && (
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
          )}
        </Flex>

        {errors.root?.message && (
          <FieldError>{errors.root?.message}</FieldError>
        )}
      </chakra.form>
    </OnboardingScreen>
  )
}
