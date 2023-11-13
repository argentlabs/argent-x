import {
  Box,
  Input,
  InputGroup,
  InputLeftAddon,
  SimpleGrid,
  SimpleGridProps,
} from "@chakra-ui/react"
import { wordlist } from "@scure/bip39/wordlists/english"
import {
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { generateFakeWords } from "./generateFakeWords"

interface SeedInputProps extends Omit<SimpleGridProps, "onChange"> {
  length?: 12
  onChange?: (seed: string) => void
}

export const SeedInput: FC<SeedInputProps> = ({
  length = 12,
  onChange,
  ...rest
}) => {
  const refInputs = useRef(new Array(length).fill(null))
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const [seedInput, _setSeedInput] = useState([...Array(length)].map(() => ""))
  const setSeedInput = useCallback(
    (value: SetStateAction<string[]>) => {
      const seed = typeof value === "function" ? value(seedInput) : value
      _setSeedInput(seed)
      onChange?.(seed.join(" "))
    },
    [onChange, seedInput],
  )

  const fakeWords = useMemo(() => {
    return generateFakeWords(wordlist, length)
  }, [length])

  return (
    <SimpleGrid columns={4} spacing={2} spacingY={3} {...rest}>
      <Box
        style={{
          position: "absolute",
          left: "-150vw",
          maxWidth: "1px",
          top: "-150vh",
          maxHeight: "1px",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {fakeWords.map((word, i) => (
          <input type="text" defaultValue={word} key={i} />
        ))}
      </Box>
      {seedInput.map((word, i) => (
        <InputGroup
          key={i}
          position="relative"
          borderRadius={100}
          overflow="hidden"
        >
          <InputLeftAddon
            borderLeftRadius={100}
            bgColor="transparent"
            pointerEvents="none"
            minH={0}
            p={0}
            pos="absolute"
            top={0}
            left={1}
            height="100%"
            zIndex={1}
            border="none"
          >
            <Box
              as="span"
              color="white"
              fontSize="xs"
              fontWeight="semibold"
              lineHeight="none"
              p={1}
              bgColor="neutrals.600"
              borderRadius={100}
              minH="5"
              minW="5"
              display={"inline-flex"}
              alignItems="center"
              justifyContent="center"
            >
              {i + 1}
            </Box>
          </InputLeftAddon>
          <Input
            data-testid={`seed-input-${i}`}
            variant={"filled"}
            autoFocus={i === 0}
            value={word}
            size="pill"
            pl={8}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            onFocus={(e) => {
              setFocusIndex(i)
              // select all text on focus
              e.target.select()
            }}
            onBlur={() => setFocusIndex(null)}
            type={focusIndex === i ? "text" : "password"}
            fontSize={focusIndex === i ? "sm" : "md"}
            onPaste={(e) => {
              e.preventDefault()
              const pasted = e.clipboardData.getData("text")
              // split by space or newline regex
              const words = pasted.split(/\s+/).filter((s) => s)

              if (words.length === length) {
                setSeedInput(words)
              }
            }}
            ref={(el) => (refInputs.current[i] = el)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && word === "" && i > 0) {
                // switch focus to previous input
                e.preventDefault()
                refInputs.current[i - 1]?.focus()
              }
              if (e.key === " " || e.key === "Enter") {
                // switch focus to next input
                e.preventDefault()
                if (word !== "") {
                  refInputs.current[i + 1]?.focus() // if next input exists, focus it
                }
              }
            }}
            onChange={(e) => {
              setSeedInput((prev) => [
                ...prev.slice(0, i),
                e.target.value,
                ...prev.slice(i + 1),
              ])
            }}
          />
        </InputGroup>
      ))}
    </SimpleGrid>
  )
}
