import { H5 } from "@argent/x-ui"
import { Center, chakra } from "@chakra-ui/react"
import type { FC, MouseEventHandler } from "react"
import { useCallback } from "react"
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
      length={3}
      currentIndex={1}
      title={"Select backup"}
    >
      <Center
        flexDirection={"column"}
        gap={2}
        p={8}
        bg={"black"}
        border={"2px dashed"}
        borderColor={"white.50"}
        rounded={"lg"}
        w={"full"}
        h={"256px"}
        cursor={"pointer"}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {disableSubmit ? (
          <H5>Drag &amp; drop your backup file here, or click to select it</H5>
        ) : (
          <>
            <H5>Backup selected:</H5>
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
