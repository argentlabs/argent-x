import { CrossSecondaryIcon } from "@argent/x-ui/icons"
import { H5, P4 } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import { Circle, Flex, Link } from "@chakra-ui/react"
import type { FC, MouseEvent, ReactNode } from "react"

import { CustomButtonCell } from "../../components/CustomButtonCell"
import type { IStatusMessageLevel } from "../../../shared/statusMessage/types"

import { buttonHoverStyle } from "@argent/x-ui/theme"

export interface BannerProps extends Omit<ButtonProps, "title"> {
  colorScheme?: IStatusMessageLevel | "success"
  onClose?: () => void
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  linkTitle?: string
  linkUrl?: string
  iconColor?: string
}

const LinkTitle: FC<Pick<BannerProps, "linkTitle" | "linkUrl">> = ({
  linkTitle,
  linkUrl,
}) => {
  if (!linkTitle) {
    return null
  }
  if (!linkUrl) {
    return (
      <P4
        overflow="hidden"
        textOverflow="ellipsis"
        color="text-secondary"
        textDecoration="underline"
      >
        {linkTitle}
      </P4>
    )
  }
  return (
    <P4
      as={Link}
      href={linkUrl}
      target="_blank"
      overflow="hidden"
      textOverflow="ellipsis"
      color="text-secondary"
      textDecoration="underline"
      alignSelf="flex-start"
      _hover={{
        color: "text-primary",
      }}
      onClick={(e: MouseEvent) => {
        e.stopPropagation()
      }}
    >
      {linkTitle}
    </P4>
  )
}

export const Banner: FC<BannerProps> = ({
  children,
  colorScheme,
  onClose,
  title,
  description,
  icon,
  linkTitle,
  linkUrl,
  iconColor,
  ...rest
}) => {
  const hasIcon = Boolean(icon)
  const hasLinkTitle = Boolean(linkTitle)
  iconColor =
    iconColor ??
    (colorScheme ? `surface-${colorScheme}-vibrant` : "surface-brand")

  return (
    <CustomButtonCell
      w="full"
      justifyContent="flex-start"
      minHeight={24.5}
      boxShadow="elevated"
      {...rest}
    >
      {hasIcon && (
        <Circle bg={iconColor} size={14} fontSize="3xl" color="surface-default">
          {icon}
        </Circle>
      )}
      <Flex direction="column" gap={1} overflow="hidden">
        {title && (
          <H5 overflow="hidden" textOverflow="ellipsis" mr={hasIcon ? 3 : 0}>
            {title}
          </H5>
        )}
        {description && (
          <P4
            sx={{ textWrap: "wrap" }}
            overflow="hidden"
            textOverflow="ellipsis"
            color="text-secondary"
            noOfLines={hasLinkTitle ? 1 : 2}
          >
            {description}
          </P4>
        )}
        {hasLinkTitle && <LinkTitle linkTitle={linkTitle} linkUrl={linkUrl} />}
      </Flex>
      {children}
      {onClose && (
        <Circle
          position="absolute"
          top={2}
          right={2}
          p={1}
          fontSize="xs"
          bg="surface-elevated-hover"
          color="text-primary"
          _hover={{
            boxShadow: buttonHoverStyle.boxShadow,
          }}
          transitionProperty="common"
          transitionDuration="fast"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
        >
          <CrossSecondaryIcon />
        </Circle>
      )}
    </CustomButtonCell>
  )
}
