import { CellStack } from "@argent/x-ui"
import { StoryObj } from "@storybook/react"
import { ComponentProps } from "react"

import { decorators } from "../../decorators/routerDecorators"

import { NewsItemCard } from "@argent-x/extension/src/ui/features/discover/ui/NewsItemCard"

import newsFixture from "./__fixtures__/news.json"

export default {
  component: NewsItemCard,
  decorators,
  render: (props: ComponentProps<typeof NewsItemCard>) => (
    <CellStack>
      <NewsItemCard {...props}></NewsItemCard>
    </CellStack>
  ),
}

export const Default: StoryObj<typeof NewsItemCard> = {
  args: {
    newsItem: newsFixture.news[0],
  },
}

export const LongDescriptionNoImage: StoryObj<typeof NewsItemCard> = {
  args: {
    newsItem: newsFixture.news[2],
  },
}
