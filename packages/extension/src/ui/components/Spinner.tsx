import { CircularProgress, CircularProgressProps } from "@mui/material"
import { FC } from "react"

interface SpinnerProps extends CircularProgressProps {
  size: number
  progress?: number
}

const defaultStyle = { color: "white", margin: "0 auto" }

export const Spinner: FC<SpinnerProps> = ({ style, progress, ...props }) => {
  if (progress) {
    const progressInt = Math.round(progress * 100)
    return (
      <CircularProgress
        style={style}
        variant="determinate"
        value={progressInt}
        {...props}
      />
    )
  }

  return <CircularProgress style={{ ...defaultStyle, ...style }} {...props} />
}
