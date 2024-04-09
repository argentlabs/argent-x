import { Button, icons } from "@argent/x-ui"
import { ButtonProps, Spinner } from "@chakra-ui/react"
import { FC, useMemo } from "react"

const { DocumentIcon, UploadDocumentIcon } = icons

interface FileInputButtonProps extends ButtonProps {
  isInvalid?: boolean
}

export const FileInputButton: FC<FileInputButtonProps> = ({
  value,
  isInvalid,
  isLoading,
  children,
  ...rest
}) => {
  const leftIcon = useMemo(() => {
    if (isLoading) {
      return
    }
    if (value) {
      return <DocumentIcon />
    }
    return <UploadDocumentIcon />
  }, [isLoading, value])
  const color = value ? "fg" : "neutrals.400"
  const justifyContent = isLoading ? undefined : "flex-start"
  const borderColor = useMemo(() => {
    if (isLoading) {
      return "transparent"
    }
    if (isInvalid) {
      return "error.500"
    }
    if (value) {
      return "transparent"
    }
    return "neutrals.400"
  }, [isInvalid, isLoading, value])
  const borderStyle = value ? "solid" : "dashed"
  const hover = {
    color: value ? undefined : "neutrals.100",
    borderColor: "neutrals.200",
  }
  return (
    <Button
      px="5"
      py="4.5"
      minHeight="16"
      rounded={"lg"}
      w={"full"}
      leftIcon={leftIcon}
      textAlign={"left"}
      justifyContent={justifyContent}
      color={color}
      fontWeight="semibold"
      borderWidth="1px"
      borderStyle={borderStyle}
      borderColor={borderColor}
      _hover={hover}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : <>{children}</>}
    </Button>
  )
}
