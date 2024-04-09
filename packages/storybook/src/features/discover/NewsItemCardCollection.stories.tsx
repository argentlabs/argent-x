import { CellStack } from "@argent/x-ui"
import { StoryObj } from "@storybook/react"
import { ComponentProps } from "react"

import { decorators } from "../../decorators/routerDecorators"

import { NewsItemCardCollection } from "@argent-x/extension/src/ui/features/discover/ui/NewsItemCardCollection"

import newsFixture from "./__fixtures__/news.json"

export default {
  component: NewsItemCardCollection,
  decorators,
  render: (props: ComponentProps<typeof NewsItemCardCollection>) => (
    <CellStack>
      <NewsItemCardCollection {...props}></NewsItemCardCollection>
    </CellStack>
  ),
}

export const Default: StoryObj<typeof NewsItemCardCollection> = {
  args: {
    newsItems: [...newsFixture.news, ...newsFixture.news, ...newsFixture.news],
  },
}
