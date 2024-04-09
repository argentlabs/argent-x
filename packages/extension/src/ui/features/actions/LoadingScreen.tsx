import { Center, CircularProgress } from "@chakra-ui/react"
import { FC } from "react"

import { Greetings } from "../lock/Greetings"

const defaultLoadingTexts = [
  "Loading…",
  "Please wait…",
  "Patience is a virtue…",
  "Almost there…",
]

interface LoadingScreenProps {
  progress?: number
  loadingTexts?: string[]
}

export const LoadingScreen: FC<LoadingScreenProps> = ({
  progress,
  loadingTexts = defaultLoadingTexts,
}) => {
  return (
    <Center
      textAlign={"center"}
      flex={1}
      px={2}
      py={12}
      flexDirection={"column"}
      height={"100vh"}
    >
      <CircularProgress
        size={"60px"}
        thickness={"2px"}
        isIndeterminate={progress === undefined}
        max={1}
        value={progress}
        trackColor={"transparent"}
        color={"text-primary"}
        capIsRound
      />
      <Greetings greetings={loadingTexts} />
    </Center>
  )
}
