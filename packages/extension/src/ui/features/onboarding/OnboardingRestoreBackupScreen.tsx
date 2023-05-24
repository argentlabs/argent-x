import { H6 } from "@argent/ui"
import { Center, chakra } from "@chakra-ui/react"
import { FC, MouseEventHandler, useCallback } from "react"
import { useDropzone } from "react-dropzone"

import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

export interface OnboardingRestoreBackupScreenProps {
  onRestore: (acceptedFile: File) => void
  onBack?: MouseEventHandler
}

export const OnboardingRestoreBackupScreen: FC<
  OnboardingRestoreBackupScreenProps
> = ({ onRestore, onBack }) => {
  const {
    acceptedFiles: [acceptedFile],
    getRootProps,
    getInputProps,
  } = useDropzone({
    maxFiles: 1,
    accept: {
      "application/json": [".json"],
    },
  })

  const disableSubmit = Boolean(!acceptedFile)

  const onSubmit = useCallback(
    () => onRestore(acceptedFile),
    [acceptedFile, onRestore],
  )

  return (
    <OnboardingScreen
      onBack={onBack}
      length={4}
      currentIndex={2}
      title={"Select backup"}
    >
      <Center
        flexDirection={"column"}
        gap={2}
        p={8}
        bg={"black"}
        border={"2px dashed"}
        borderColor={"white50"}
        rounded={"lg"}
        w={"full"}
        h={"256px"}
        cursor={"pointer"}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {disableSubmit ? (
          <H6>Drag &amp; drop your backup file here, or click to select it</H6>
        ) : (
          <>
            <H6>Backup selected:</H6>
            <chakra.code fontSize={"sm"}>{acceptedFile.name}</chakra.code>
          </>
        )}
      </Center>
      <OnboardingButton mt={8} onClick={onSubmit} isDisabled={disableSubmit}>
        Restore backup
      </OnboardingButton>
    </OnboardingScreen>
  )
}
