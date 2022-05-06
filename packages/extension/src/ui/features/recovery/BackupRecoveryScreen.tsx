import { FC, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { routes } from "../../routes"
import { ConfirmScreen } from "../../screens/ConfirmScreen"
import { useAppState } from "../../states/app"
import { fileToString } from "../../utils/files"
import { recoverBackup } from "../../utils/messaging"

const DropZone = styled.div`
  width: 100%;
  height: 256px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  font-size: 18px;
  font-weight: bold;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.5);

  code {
    font-size: 14px;
    font-weight: normal;
    line-height: 18px;
  }
`

export const BackupRecoveryScreen: FC = () => {
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
      navigate(routes.lockScreen())
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
    <>
      <IconBar back />
      <ConfirmScreen
        title="Select backup"
        confirmButtonText="Restore backup"
        confirmButtonDisabled={disableSubmit}
        singleButton
        onSubmit={handleRestoreClick}
        smallTopPadding
      >
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
      </ConfirmScreen>
    </>
  )
}
