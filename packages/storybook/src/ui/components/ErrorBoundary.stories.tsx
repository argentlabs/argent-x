import ErrorBoundaryFallbackWithCopyError from "@argent-x/extension/src/ui/components/ErrorBoundaryFallbackWithCopyError"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/ErrorBoundary",
  component: ErrorBoundaryFallbackWithCopyError,
} as ComponentMeta<typeof ErrorBoundaryFallbackWithCopyError>

const Template: ComponentStory<typeof ErrorBoundaryFallbackWithCopyError> = (
  props,
) => (
  <div style={{ width: "328px", height: "568px", display: "flex" }}>
    <ErrorBoundaryFallbackWithCopyError
      {...props}
    ></ErrorBoundaryFallbackWithCopyError>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  privacyErrorReporting: true,
}
