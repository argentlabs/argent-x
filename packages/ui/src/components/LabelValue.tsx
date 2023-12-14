import { Flex, FlexProps, Text, TextProps, Tooltip } from "@chakra-ui/react"
import {
  ReactNode,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { typographyStyles } from "."
import { isString } from "lodash-es"
import { formatAddress, formatFullAddress, isAddress } from "@argent/shared"

export function LabelValueStack(props: FlexProps) {
  return <Flex direction={"column"} w={"full"} {...props} />
}

export function LabelValueRow({
  label,
  value,
}: {
  label: ReactNode
  value?: ReactNode
}) {
  const displayValue = useMemo(() => {
    if (value === undefined) {
      return null
    }
    if (isValidElement(value)) {
      return value
    }
    if (isString(value) && isAddress(value)) {
      return (
        <Tooltip label={formatFullAddress(value)} placement="top">
          <Text ml={"auto"} textAlign={"right"}>
            {formatAddress(value)}
          </Text>
        </Tooltip>
      )
    }

    return (
      <LabelValueAutoTooltip ml={"auto"} textAlign={"right"} value={value} />
    )
  }, [value])

  return (
    <Flex
      alignItems="center"
      flex={1}
      gap={1}
      _notFirst={{ mt: 2 }}
      {...typographyStyles.P4}
    >
      <Text color="text.secondary" whiteSpace={"nowrap"}>
        {label}
      </Text>
      {displayValue}
    </Flex>
  )
}

/** Truncates text to one line. If overflowing displays full text as tooltip on hover */

export function LabelValueAutoTooltip({
  value,
  ...rest
}: TextProps & { value: ReactNode }) {
  const [hasOverflow, setHasOverflow] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const setRef = useCallback((nextRef: HTMLDivElement | null) => {
    ref.current = nextRef
    if (ref?.current) {
      const { scrollWidth, offsetWidth } = ref.current
      setHasOverflow(scrollWidth > offsetWidth)
    }
  }, [])
  return (
    <Tooltip label={value} placement="top" isDisabled={!hasOverflow}>
      <Text
        ref={setRef}
        overflow={"hidden"}
        textOverflow={"ellipsis"}
        whiteSpace={"nowrap"}
        {...rest}
      >
        {value}
      </Text>
    </Tooltip>
  )
}
