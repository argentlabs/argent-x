import {
  Accordion,
  AccordionButton,
  AccordionButtonProps,
  AccordionItem,
  AccordionItemProps,
  AccordionPanel,
  AccordionProps,
  Box,
  Divider,
  Flex,
  FlexProps,
  useAccordionItemState,
} from "@chakra-ui/react"
import { FC, PropsWithChildren, ReactNode } from "react"

import { CopyTooltip } from "./CopyTooltip"
import { P4, typographyStyles } from "./Typography"

export const DetailAccordionHeader: FC<PropsWithChildren> = (props) => {
  return (
    <Flex
      backgroundColor="neutrals.700"
      px="3"
      py="2.5"
      borderTopRadius="xl"
      mb={"1px"}
      className={"detail-accordion__header"}
    >
      <Flex
        {...typographyStyles.P4}
        alignItems="center"
        gap="1"
        fontWeight="medium"
        color="neutrals.300"
        {...props}
      />
    </Flex>
  )
}

export const DetailAccordion: FC<AccordionProps> = (props) => {
  return (
    <Accordion
      allowToggle
      backgroundColor="neutrals.800"
      borderRadius="xl"
      fontWeight="medium"
      sx={{
        ".detail-accordion__header + &": {
          borderTopRadius: "none",
        },
      }}
      overflow={"hidden"}
      {...props}
    />
  )
}

export const DetailAccordionItem: FC<AccordionItemProps> = (props) => {
  return (
    <AccordionItem
      border="none"
      color="white"
      /** handle top and bottom padding changes on expanded items without keeping local 'selected index' state */
      sx={{
        [".chakra-accordion__button"]: {
          py: 1.5,
          ['&[aria-expanded="true"]']: {
            pt: 3,
          },
        },
        _notFirst: {
          ['.chakra-accordion__button[aria-expanded="true"]']: {
            mt: 1.5,
          },
        },
        _notLast: {
          ['.chakra-accordion__button[aria-expanded="true"] + .chakra-collapse > .chakra-accordion__panel']:
            {
              mb: 1.5,
            },
        },
        _first: {
          [".chakra-accordion__button"]: {
            pt: 3,
            ['&[aria-expanded="true"]']: {
              mt: 0,
            },
          },
        },
        _last: {
          [".chakra-accordion__button"]: {
            pb: 3,
            ['&[aria-expanded="true"]']: {
              pb: 1.5,
            },
          },
        },
      }}
      {...props}
    />
  )
}

export const DetailAccordionButton: FC<
  AccordionButtonProps & {
    label?: ReactNode
    value?: ReactNode
  }
> = ({ label, value, children, ...rest }) => {
  const { isDisabled } = useAccordionItemState()
  return (
    <AccordionButton
      transitionProperty="margin, padding, background"
      transitionDuration="fast"
      display="flex"
      width="full"
      justifyContent="space-between"
      outline="none"
      px="3"
      _expanded={{
        backgroundColor: "neutrals.700",
      }}
      _disabled={{
        cursor: "auto",
        opacity: 1,
      }}
      _hover={{
        backgroundColor: isDisabled ? undefined : "neutrals.700",
      }}
      {...rest}
    >
      {label && <P4 fontWeight="medium">{label}</P4>}
      {value && (
        <Flex
          {...typographyStyles.P4}
          color="neutrals.400"
          fontWeight="medium"
          noOfLines={1}
        >
          {value}
        </Flex>
      )}
      {children}
    </AccordionButton>
  )
}

export const DetailAccordionPanel: FC<FlexProps> = (props) => {
  return (
    <AccordionPanel backgroundColor="neutrals.700" px="3" pb="0">
      <Divider color="black" opacity="1" />
      <Flex flexDirection="column" gap="3" py="3" {...props} />
    </AccordionPanel>
  )
}

export const DetailAccordionRow: FC<
  FlexProps & {
    header?: ReactNode
    label?: ReactNode
    copyLabel?: string
    value?: ReactNode
    copyValue?: string
  }
> = ({ header, label, copyLabel, value, copyValue, children, ...rest }) => {
  return (
    <Flex justifyContent="space-between" gap="2" {...rest}>
      {header && (
        <Flex
          {...typographyStyles.P4}
          alignItems="center"
          gap="1"
          color="neutrals.300"
          fontWeight="medium"
        >
          {header}
        </Flex>
      )}
      {label && (
        <Flex
          {...typographyStyles.P4}
          alignItems="center"
          gap="1"
          color="neutrals.400"
          fontWeight="medium"
        >
          {copyLabel ? (
            <CopyTooltip copyValue={copyLabel}>
              <Box
                _hover={{
                  color: "text.primary",
                }}
                cursor="pointer"
                transitionProperty="color"
                transitionDuration="fast"
              >
                {label}
              </Box>
            </CopyTooltip>
          ) : (
            <>{label}</>
          )}
        </Flex>
      )}
      {value && (
        <Flex
          {...typographyStyles.P4}
          color="neutrals.500"
          fontWeight="medium"
          maxWidth="70%"
          noOfLines={1}
        >
          {copyValue ? (
            <CopyTooltip copyValue={copyValue}>
              <Box
                _hover={{
                  color: "text.primary",
                }}
                cursor="pointer"
                transitionProperty="color"
                transitionDuration="fast"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
                minWidth="0"
              >
                {value}
              </Box>
            </CopyTooltip>
          ) : (
            <Box
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              overflow="hidden"
              minWidth="0"
            >
              {value}
            </Box>
          )}
        </Flex>
      )}
      {children}
    </Flex>
  )
}
