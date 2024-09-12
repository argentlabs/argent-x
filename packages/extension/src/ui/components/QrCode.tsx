import { Box, Center, CenterProps, Circle } from "@chakra-ui/react"
import QRCodeStyling, { Options } from "qr-code-styling"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { iconsDeprecated, useOnClickOutside } from "@argent/x-ui"

const { MaximizeIcon } = iconsDeprecated

interface QrCodeProps extends CenterProps {
  size: number
  data: string
  qrCodeOptions?: Partial<Options>
}

export const QrCode: FC<QrCodeProps> = ({
  size,
  data,
  qrCodeOptions = {},
  children,
  ...rest
}) => {
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
        ...qrCodeOptions,
      }),
    [qrCodeOptions, size],
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
    >
      {children}
    </Center>
  )
}

interface FullscreenQrCodeProps extends QrCodeProps {
  fullscreenSize: number
}

export const FullscreenQrCode: FC<FullscreenQrCodeProps> = ({
  fullscreenSize,
  data,
  size,
}) => {
  const [showExpandIcon, setShowExpandIcon] = useState(false)
  const [isQRFullscreen, setQRFullScreen] = useState(false)

  const qrRef = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(qrRef, () => setQRFullScreen(false))

  return (
    <>
      {isQRFullscreen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.7)"
          zIndex={999}
        />
      )}
      <Box position="relative" ref={qrRef}>
        <QrCode
          size={isQRFullscreen ? fullscreenSize : size}
          data={data}
          borderRadius="2xl"
          margin={0}
          p={2}
          qrCodeOptions={{ qrOptions: { errorCorrectionLevel: "M" } }}
          _hover={{ cursor: "pointer" }}
          boxShadow={isQRFullscreen ? "menu" : "none"}
          zIndex={isQRFullscreen ? 1000 : "auto"}
          transform={isQRFullscreen ? "translate(-50%, -50%)" : "none"}
          position={isQRFullscreen ? "fixed" : "relative"}
          top={isQRFullscreen ? "50%" : "auto"}
          left={isQRFullscreen ? "50%" : "auto"}
          onMouseEnter={() => setShowExpandIcon(true)}
          onMouseLeave={() => setShowExpandIcon(false)}
          onClick={() => isQRFullscreen && setQRFullScreen(false)}
        />
        {showExpandIcon && !isQRFullscreen && (
          <Circle
            bg="surface-default"
            position="absolute"
            top="50%"
            left="50%"
            transform={"translate(-50%, -50%) scale(1)"}
            transition="transform 0.3s ease-in-out, opacity 0.3s ease-in-out"
            cursor="pointer"
            p={7}
            opacity={1}
            onMouseEnter={() => setShowExpandIcon(true)}
            onClick={() => setQRFullScreen(!isQRFullscreen)}
            _hover={{
              transform: "translate(-50%, -50%) scale(1.1)",
              opacity: 0.9,
            }}
          >
            <MaximizeIcon color="white" zIndex={100000} w={8} h={8} />
          </Circle>
        )}
      </Box>
    </>
  )
}
