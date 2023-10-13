import { Textarea, TextareaProps, useMergeRefs } from "@chakra-ui/react"
import { forwardRef, useEffect, useRef } from "react"

const TextareaAutosize = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ value, ...rest }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const refs = useMergeRefs(internalRef, ref)

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.style.height = "0"
        const scrollHeight = internalRef.current.scrollHeight
        internalRef.current.style.height = `${scrollHeight}px`
      }
      // hook updates height when value changes, but doesn't use its actual value
      /* eslint-disable react-hooks/exhaustive-deps */
    }, [value])

    return (
      <Textarea
        ref={refs}
        lineHeight={1.15}
        overflow={"hidden"}
        resize={"none"}
        rows={1}
        value={value}
        {...rest}
      />
    )
  },
)

TextareaAutosize.displayName = "TextareaAutosize"

export { TextareaAutosize }
