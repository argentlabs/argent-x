import { Box, Tooltip } from "@chakra-ui/react"
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import { useOnClickOutside } from "../hooks"

interface CopyTooltipProps extends PropsWithChildren {
  copyValue: string
  prompt?: string
  message?: string
  autoDismiss?: boolean
}

export const CopyTooltip: FC<CopyTooltipProps> = ({
  copyValue,
  prompt = "Click to copy",
  message = "Copied",
  autoDismiss = true,
  children,
}) => {
  const [visible, setVisible] = useState(false)
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>()
  const clickOutsideRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(clickOutsideRef, () => setVisible(false))

  useEffect(() => {
    if (autoDismiss && visible) {
      timeoutIdRef.current = setTimeout(() => setVisible(false), 2500)
    }
    return () => {
      clearTimeout(timeoutIdRef.current)
    }
  }, [autoDismiss, visible])

  return (
    <>
      <Tooltip label={visible ? message : prompt} isOpen={visible || undefined}>
        <Box ref={clickOutsideRef}>
          <CopyToClipboard text={copyValue} onCopy={() => setVisible(true)}>
            {children}
          </CopyToClipboard>
        </Box>
      </Tooltip>
    </>
  )
}
