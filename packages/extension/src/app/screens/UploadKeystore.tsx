/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { H2 } from "../components/Typography"

const UploadKeystoreScreen = styled.div`
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

interface UploadKeystoreProps {
  onSubmit?: (uploadKeystore: File) => void
  onBack?: () => void
}

export const UploadKeystore: FC<UploadKeystoreProps> = ({
  onSubmit,
  onBack,
}) => {
  const {
    acceptedFiles: [acceptedFile],
    getRootProps,
    getInputProps,
  } = useDropzone({
    maxFiles: 1,
    accept: "application/json",
  })

  const disableSubmit = useMemo(() => !acceptedFile, [acceptedFile])

  return (
    <UploadKeystoreScreen>
      <BackButton onClick={onBack} />
      <H2>Upload Keystore</H2>
      <DropZone {...getRootProps()}>
        <input {...getInputProps()} />
        {disableSubmit ? (
          <p>Drag & drop your backup file here, or click to select it</p>
        ) : (
          <div>
            <p>Backup selected:</p>
            <code>{acceptedFile.name}</code>
          </div>
        )}
      </DropZone>

      <Button
        onClick={() => onSubmit?.(acceptedFile!)}
        disabled={disableSubmit}
      >
        Restore from backup
      </Button>
    </UploadKeystoreScreen>
  )
}
