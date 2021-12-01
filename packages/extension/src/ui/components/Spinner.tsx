import { CircularProgress, CircularProgressProps } from "@mui/material"
import { FC } from "react"

import { useProgress } from "../states/progress"

interface SpinnerProps extends CircularProgressProps {
  size: number
  progress?: number
}

const defaultStyle = { color: "white", margin: "0 auto" }

export const Spinner: FC<SpinnerProps> = ({ style, ...props }) => {
  style = { ...defaultStyle, ...style }
  const progress = useProgress((x) => x.progress)
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

  return <CircularProgress style={style} {...props} />
}
