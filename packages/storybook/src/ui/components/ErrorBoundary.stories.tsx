import ErrorBoundaryFallbackWithCopyError from "@argent-x/extension/src/ui/components/ErrorBoundaryFallbackWithCopyError"

export default {
  component: ErrorBoundaryFallbackWithCopyError,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}

export const PrivacyErrorReporting = {
  args: {
    privacyErrorReporting: true,
  },
}
