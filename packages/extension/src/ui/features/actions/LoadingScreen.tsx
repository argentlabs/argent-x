import { Center, CircularProgress } from "@chakra-ui/react"
import { FC } from "react"

import { Greetings } from "../lock/Greetings"

const loadingTexts = [
  "Loading…",
  "Please wait…",
  "Patience is a virtue…",
  "Almost there…",
]

interface LoadingScreenProps {
  progress?: number
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ progress }) => {
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
        size={"100px"}
        thickness={"8px"}
        isIndeterminate={progress === undefined}
        max={1}
        value={progress}
        trackColor={"transparent"}
        color={"text"}
        capIsRound
      />
      <Greetings greetings={loadingTexts} />
    </Center>
  )
}
