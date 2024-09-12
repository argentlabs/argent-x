import React from "react"
import {
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SmartAccountValidationErrorMessage,
} from "../../../../shared/errors/argentAccount"
import { ZENDESK_LINK } from "../../userReview/constants"
import { Link } from "@chakra-ui/react"

interface SmartAccountErrorProps {
  error: SmartAccountValidationErrorMessage
}

const SmartAccountError: React.FC<SmartAccountErrorProps> = ({ error }) => {
  const FAILURE_SCENARIO_1 =
    error === SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1
  const FAILURE_SCENARIO_2 =
    error === SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2

  return (
    <>
      {FAILURE_SCENARIO_1 && (
        <>
          This address is associated with accounts from another seedphrase.
          <br />
          <br />
          Please enter another email address to continue.
        </>
      )}
      {FAILURE_SCENARIO_2 && (
        <>
          Please use the same email address that you used to create your other
          Smart Accounts
        </>
      )}
      {!FAILURE_SCENARIO_1 && !FAILURE_SCENARIO_2 && (
        <>
          This address is associated with accounts from another seedphrase.
          <br />
          <br />
          Please enter the right email address to continue
          <br />
          <br />
          If you can’t remember your email address, please{" "}
          <Link href={ZENDESK_LINK} target="_blank" textDecoration="underline">
            contact support
          </Link>
        </>
      )}
    </>
  )
}

export default SmartAccountError
