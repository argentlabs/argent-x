import { FC, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { recoverBackup } from "../../services/backgroundRecovery"
import { fileToString } from "../../services/files"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const DropZone = styled.div`
  width: 100%;
  height: 256px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  margin-bottom: 32px;
  font-size: 18px;
  font-weight: bold;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  background-color: ${({ theme }) => theme.black};

  code {
    font-size: 14px;
    font-weight: normal;
    line-height: 18px;
  }
`

export const OnboardingRestoreBackup: FC = () => {
  usePageTracking("restoreWalletWithFile")
  const navigate = useNavigate()
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

  const disableSubmit = useMemo(() => !acceptedFile, [acceptedFile])
  const handleRestoreClick = async () => {
    try {
      const data = await fileToString(acceptedFile)
      await recoverBackup(data)
      navigate(routes.onboardingFinish.path, { replace: true })
    } catch (err: any) {
      const error = `${err}`
      const legacyError = "legacy backup file cannot be imported"
      if (error.toLowerCase().includes(legacyError)) {
        navigate(routes.legacy())
      } else {
        useAppState.setState({ error })
        navigate(routes.error())
      }
    }
  }

  return (
    <OnboardingScreen back length={4} currentIndex={2} title={"Select backup"}>
      <DropZone {...getRootProps()}>
        <input {...getInputProps()} />
        {disableSubmit ? (
          <p>Drag &amp; drop your backup file here, or click to select it</p>
        ) : (
          <div>
            <p>Backup selected:</p>
            <code>{acceptedFile.name}</code>
          </div>
        )}
      </DropZone>
      <OnboardingButton onClick={handleRestoreClick} disabled={disableSubmit}>
        Restore backup
      </OnboardingButton>
    </OnboardingScreen>
  )
}
