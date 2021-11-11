import { CircularProgress } from "@mui/material"
import { FC } from "react"

import { useProgress } from "../states/progress"

interface SpinnerProps {
  size: number
  progress?: number
}

const styles = { color: "white", margin: "0 auto" }

export const Spinner: FC<SpinnerProps> = ({ ...props }) => {
  const progress = useProgress((x) => x.progress)
  if (progress) {
    const progressInt = Math.round(progress * 100)
    return (
      <CircularProgress
        style={styles}
        variant="determinate"
        value={progressInt}
        {...props}
      />
    )
  }

  return <CircularProgress style={styles} {...props} />
}
