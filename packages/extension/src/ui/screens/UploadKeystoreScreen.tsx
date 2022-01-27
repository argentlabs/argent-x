/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { H2 } from "../components/Typography"
import { routes } from "../routes"
import { useAppState } from "../states/app"
import { fileToString } from "../utils/files"
import { recoverKeystore } from "../utils/messaging"

const UploadKeystoreScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
`

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
  margin: 32px 0 48px;
  cursor: pointer;
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.5);

  code {
    font-size: 14px;
    font-weight: normal;
    line-height: 18px;
  }
`

export const UploadKeystoreScreen: FC = () => {
  const navigate = useNavigate()
  const {
    acceptedFiles: [acceptedFile],
    getRootProps,
    getInputProps,
  } = useDropzone({
    maxFiles: 1,
    accept: "application/json",
  })

  const disableSubmit = useMemo(() => !acceptedFile, [acceptedFile])
  const handleRestoreClick = async () => {
    try {
      const data = await fileToString(acceptedFile)
      await recoverKeystore(data)
      navigate(routes.password)
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error)
    }
  }

  return (
    <UploadKeystoreScreenWrapper>
      <BackButton />
      <H2>Select backup</H2>
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

      <Button onClick={handleRestoreClick} disabled={disableSubmit}>
        Restore from backup
      </Button>
    </UploadKeystoreScreenWrapper>
  )
}
