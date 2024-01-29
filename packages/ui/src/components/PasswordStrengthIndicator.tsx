import { Flex } from "@chakra-ui/react"
import { zxcvbnOptions } from "@zxcvbn-ts/core"
import { FC } from "react"

import { usePasswordStrength } from "../hooks/usePasswordStrength"
import { PasswordStrengthIndicatorBar } from "./PasswordStrengthIndicatorBar"

interface PasswordStrengthIndicatorProps {
  password: string
  error?: string
}

const PasswordStrengthIndicator: FC<PasswordStrengthIndicatorProps> = ({
  password,
  error,
}) => {
  const indicator = usePasswordStrength(password, async () => {
    // import zxcvbnEnPackage from "@zxcvbn-ts/language-en"
    const zxcvbnEnPackage = await import("@zxcvbn-ts/language-en").then(
      ({ default: x }) => x,
    )
    // import zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
    const zxcvbnCommonPackage = await import("@zxcvbn-ts/language-common").then(
      ({ default: x }) => x,
    )

    const options = {
      dictionary: {
        ...zxcvbnCommonPackage?.dictionary,
        ...zxcvbnEnPackage?.dictionary,
      },
      useLevenshteinDistance: true, // recommended
      graphs: zxcvbnCommonPackage?.adjacencyGraphs,
      translations: zxcvbnEnPackage?.translations,
    }

    zxcvbnOptions.setOptions(options)
  })

  if (!password) {
    return <></>
  }

  return (
    <Flex justifyItems="flex-start" alignItems="center" gap="1" w="100%" mb={3}>
      {typeof indicator?.score === "number" ? (
        <PasswordStrengthIndicatorBar
          progress={indicator?.score}
          error={error}
        />
      ) : (
        <PasswordStrengthIndicatorBar progress={0} />
      )}
    </Flex>
  )
}

export { PasswordStrengthIndicator }
