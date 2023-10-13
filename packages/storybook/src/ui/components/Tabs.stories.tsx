import { theme } from "@argent/ui"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

export default {
  component: Tabs,
  argTypes: {
    ...getThemingArgTypes(theme, "Tabs"),
  },
  render: (props: any) => (
    <Tabs {...props}>
      <TabList>
        <Tab>One</Tab>
        <Tab>Two</Tab>
        <Tab>Three</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <p>one!</p>
        </TabPanel>
        <TabPanel>
          <p>two!</p>
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
}

export const Default = {
  args: {},
}
