import { CellStack, HeaderCell } from "@argent/x-ui"
import type { FC } from "react"
import type { FlexProps } from "@chakra-ui/react"
import { Button, Flex } from "@chakra-ui/react"

import type { PasswordFormProps } from "../../lock/PasswordForm"
import { PasswordForm } from "../../lock/PasswordForm"
import type { WarningRecoveryBannerProps } from "./WarningRecoveryBanner"
import { WarningRecoveryBanner } from "./WarningRecoveryBanner"

interface PasswordWarningFormProps
  extends Pick<PasswordFormProps, "verifyPassword">,
    WarningRecoveryBannerProps,
    Omit<FlexProps, "title"> {}

export const PasswordWarningForm: FC<PasswordWarningFormProps> = ({
  verifyPassword,
  title,
  reasons,
  ...rest
}) => {
  return (
    <CellStack flex={1} {...rest}>
      <WarningRecoveryBanner title={title} reasons={reasons} mb={4} />
      <HeaderCell color={"text-primary"}>Enter your password</HeaderCell>
      <PasswordForm flex={1} verifyPassword={verifyPassword}>
        {({ isDirty }) => (
          <>
            <Flex flex={1}></Flex>
            <Button
              type="submit"
              isDisabled={!isDirty}
              colorScheme="primary"
              width="full"
            >
              Unlock
            </Button>
          </>
        )}
      </PasswordForm>
    </CellStack>
  )
}
