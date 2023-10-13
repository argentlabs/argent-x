import { CopyTooltip, P3, P4, icons } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC } from "react"

const { CopyIcon } = icons

interface FileNameWithClassHashProps {
  fileName?: string
  classHash?: string | null
}

export const FileNameWithClassHash: FC<FileNameWithClassHashProps> = ({
  fileName,
  classHash,
}) => {
  return (
    <Box overflow={"hidden"}>
      <P3 overflow="hidden" textOverflow="ellipsis">
        {fileName}
      </P3>
      {classHash && (
        <Box
          onClick={(e) => {
            e.stopPropagation() /** prevent click on containing button */
          }}
        >
          <CopyTooltip
            prompt="Click to copy class hash"
            message="Class hash copied"
            copyValue={classHash}
          >
            <Flex gap={1}>
              <P4
                overflow="hidden"
                textOverflow="ellipsis"
                color={"neutrals.300"}
              >
                {classHash}
              </P4>
              <P4 color={"neutrals.300"}>
                <CopyIcon />
              </P4>
            </Flex>
          </CopyTooltip>
        </Box>
      )}
    </Box>
  )
}
