import {
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialog as ChakraAlertDialog,
  AlertDialogProps as ChakraAlertDialogProps,
  HStack,
  VStack,
} from "@chakra-ui/react"
import { FC, PropsWithChildren, useRef } from "react"

import { pxToRem } from "../theme/utilities/pxToRem"
import { Button } from "./Button"
import { H5, P4 } from "./Typography"

export interface AlertDialogProps
  extends PropsWithChildren,
    Omit<
      ChakraAlertDialogProps,
      "onClose" | "leastDestructiveRef" | "children"
    > {
  onCancel: () => void
  cancelTitle?: string
  onDestroy?: () => void
  destroyTitle?: string
  onConfirm?: () => void
  confirmTitle?: string
  title: string
  message?: string
}

/**
 * Wraps Chakra AlertDialog {@link https://chakra-ui.com/docs/components/alert-dialog}
 * with a simpler API for most common use cases of cancel, confirm or destroy
 */

export const AlertDialog: FC<AlertDialogProps> = ({
  title,
  onDestroy,
  destroyTitle = "Delete",
  onCancel,
  cancelTitle = "Cancel",
  onConfirm,
  confirmTitle = "OK",
  message,
  children,
  ...rest
}) => {
  const cancelRef = useRef<HTMLButtonElement | null>(null)
  return (
    <ChakraAlertDialog
      onClose={onCancel}
      leastDestructiveRef={cancelRef}
      {...rest}
    >
      <AlertDialogOverlay bg="black50">
        <AlertDialogContent
          p={6}
          bg="neutrals.700"
          rounded="lg"
          maxWidth={[pxToRem(320), pxToRem(480)]}
        >
          <VStack textAlign="center" spacing={6}>
            <H5>{title}</H5>
            {message && <P4>{message}</P4>}
            {children}
            <HStack>
              <Button
                ref={cancelRef}
                colorScheme="tertiary"
                size="sm"
                onClick={onCancel}
              >
                {cancelTitle}
              </Button>
              {!!onDestroy && (
                <Button colorScheme="danger" size="sm" onClick={onDestroy}>
                  {destroyTitle}
                </Button>
              )}
              {!!onConfirm && (
                <Button colorScheme="primary" size="sm" onClick={onConfirm}>
                  {confirmTitle}
                </Button>
              )}
            </HStack>
          </VStack>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </ChakraAlertDialog>
  )
}
