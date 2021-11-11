/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useMemo, useState } from "react"
import styled from "styled-components"

import { Button } from "../components/Button"
import { H2 } from "../components/Typography"

const UploadKeystoreScreen = styled.div`
  display: flex;
  flex-direction: column;
`

interface UploadKeystoreProps {
  onSubmit?: (uploadKeystore: File) => void
}

export const UploadKeystore: FC<UploadKeystoreProps> = ({ onSubmit }) => {
  const [uploadKeystore, setUploadKeystore] = useState<File>()

  const disableSubmit = useMemo(() => !uploadKeystore, [uploadKeystore])

  return (
    <UploadKeystoreScreen>
      <H2>Upload Keystore</H2>
      <input
        type="file"
        onChange={(e) => setUploadKeystore(e.target.files?.[0])}
      />
      <Button
        onClick={() => onSubmit?.(uploadKeystore!)}
        disabled={disableSubmit}
      >
        Upload
      </Button>
    </UploadKeystoreScreen>
  )
}
