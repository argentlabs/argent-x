import { CellStack, HeaderCell, icons } from "@argent/x-ui"
import { FC } from "react"
import { Button, Flex, FlexProps } from "@chakra-ui/react"

import { PasswordForm, PasswordFormProps } from "../../lock/PasswordForm"
import {
  WarningRecoveryBanner,
  WarningRecoveryBannerProps,
} from "./WarningRecoveryBanner"

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
        {(isDirty) => (
          <>
            <Flex flex={1}></Flex>
            <Button
              type="submit"
              disabled={!isDirty}
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
