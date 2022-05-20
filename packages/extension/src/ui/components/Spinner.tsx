import { CircularProgress, CircularProgressProps } from "@mui/material"
import React, { FC } from "react"

interface SpinnerProps extends CircularProgressProps {
  size?: number
  progress?: number
}

const defaultStyle = { color: "white", margin: "0 auto" }

export const Spinner: FC<SpinnerProps> = ({ style, progress, ...props }) => {
  if (progress !== undefined) { // in case progress = 0
    const progressInt = 4 * Math.round(progress * 25)
    return (
      <CircularProgress
        style={{ ...defaultStyle, ...style }}
        variant="determinate"
        value={progressInt}
        {...props}
      />
    )
  }

  return <CircularProgress style={{ ...defaultStyle, ...style }} {...props} />
}
