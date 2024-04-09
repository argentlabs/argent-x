import { H4 } from "@argent/x-ui"
import { Code, Flex } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const InfoRow: FC<{
  title: string
  content?: ReactNode
  copyContent?: string
}> = ({ title, content, copyContent }) => {
  return (
    <Flex alignItems="center" gap="2">
      <H4>{title}</H4>
      {!copyContent && (
        <H4>
          <Code
            backgroundColor="#0097fc4f"
            borderRadius="8px"
            color="white"
            p="0 0.5rem"
          >
            {content}
          </Code>
        </H4>
      )}
      {copyContent && content && (
        <a
          target="_blank"
          rel="noreferrer"
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => {
            navigator.clipboard.writeText(copyContent)
          }}
        >
          <H4>
            <Code backgroundColor="#0097fc4f" borderRadius="8px" color="white">
              {content}
            </Code>
          </H4>
        </a>
      )}
    </Flex>
  )
}

export { InfoRow }
