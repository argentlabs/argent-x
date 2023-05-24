import { Box } from "@chakra-ui/react"

export const SplitProgress = ({
  value,
  max,
}: {
  value: number
  max: number
}) => {
  const blockCount = Math.ceil(max)
  const filledBlockCount = Math.ceil((value / max) * blockCount)

  const blocks = Array.from({ length: blockCount }).map((_, index) => (
    <Box
      key={index}
      w={`${100 / blockCount}%`}
      h={1}
      bg={index < filledBlockCount ? "primary.500" : "#803820"}
      borderLeftRadius={index === 0 ? "xl" : "none"}
      borderRightRadius={max - 1 === index ? "xl" : "none"}
      mx={0.5}
    />
  ))

  return (
    <Box display="flex" w="100%" mt={3}>
      {blocks}
    </Box>
  )
}
