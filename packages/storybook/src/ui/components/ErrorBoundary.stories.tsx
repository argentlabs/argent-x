import { BaseError } from "@argent-x/extension/src/shared/errors/baseError"
import ErrorBoundaryFallbackWithCopyError from "@argent-x/extension/src/ui/components/ErrorBoundaryFallbackWithCopyError"

export default {
  component: ErrorBoundaryFallbackWithCopyError,
}

const error = new BaseError({ message: "Lorem ipsum" })

export const Default = {
  args: { error },
}

export const PrivacyErrorReporting = {
  args: { error, privacyErrorReporting: true },
}
