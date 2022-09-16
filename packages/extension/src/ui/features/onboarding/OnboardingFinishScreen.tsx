import { Button } from "@mui/material"
import { FC, useCallback } from "react"

import { H1 } from "../../theme/Typography"

export const OnboardingFinishScreen: FC = () => {
  const onFinishClick = useCallback(() => {
    window.close()
  }, [])
  return (
    <>
      <H1>DONE</H1>
      <Button onClick={onFinishClick}>Finish</Button>
    </>
  )
}
