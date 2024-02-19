import { Center, CenterProps } from "@chakra-ui/react"
import QRCodeStyling from "qr-code-styling"
import { FC, useCallback, useEffect, useMemo, useRef } from "react"

interface QrCodeProps extends CenterProps {
  size: number
  data: string
}

export const QrCode: FC<QrCodeProps> = ({ size, data, ...rest }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const qrCode = useMemo(
    () =>
      new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        dotsOptions: { type: "dots", color: "#000000" },
        cornersSquareOptions: { type: "dot", color: "#000000" },
        cornersDotOptions: { type: "dot", color: "#000000" },
        imageOptions: {
          crossOrigin: "anonymous",
        },
      }),
    [size],
  )

  const setRef = useCallback(
    (nextRef: HTMLDivElement | null) => {
      ref.current = nextRef
      if (ref?.current) {
        qrCode.append(ref.current)
      }
    },
    [qrCode],
  )

  useEffect(() => {
    qrCode.update({ data })
  }, [data, qrCode])

  return (
    <Center
      ref={setRef}
      data-testid="qr-code"
      bg={"white"}
      p={4}
      rounded={"2xl"}
      {...rest}
    />
  )
}
