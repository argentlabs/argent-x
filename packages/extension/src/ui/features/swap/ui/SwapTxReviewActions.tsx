import {
  AccordionIconDropdown,
  L2Bold,
  Label,
  LabelValueRow,
  LabelValueStack,
  NestedAccordion,
  P3,
  P3Bold,
  usePriceImpactConfig,
} from "@argent/x-ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  Tooltip,
} from "@chakra-ui/react"
import type {
  BaseTradeProvider,
  PriceImpactResult,
  SwapReviewTrade,
} from "../../../../shared/swap/model/trade.model"
import { Providers } from "./SwapProviders"

interface SwapTxReviewActionsProps {
  reviewTrade: SwapReviewTrade
}

const PriceImpact = ({ priceImpact }: { priceImpact?: PriceImpactResult }) => {
  const config = usePriceImpactConfig()
  if (!priceImpact) {
    return null
  }

  const { value, type } = priceImpact

  const formattedValue = value === 0 ? "(0.00%)" : `(${value.toFixed(2)}%)`
  const color = config[type].textColor

  return (
    <P3 color={color} marginLeft={"auto"}>
      {formattedValue}
    </P3>
  )
}

const Provider = ({ providers }: { providers: BaseTradeProvider[] }) => {
  return (
    <HStack marginLeft={"auto"}>
      {providers.length > 1 && (
        <Tooltip
          label={<Providers providers={providers} NameComponent={P3Bold} />}
        >
          <P3 bg="surface-default" px="2" pb="2px" borderRadius="8px">
            {providers.length} providers
          </P3>
        </Tooltip>
      )}
      {providers.length === 1 && (
        <Providers providers={providers} NameComponent={P3} />
      )}
    </HStack>
  )
}

export const SwapTxReviewActions = ({
  reviewTrade,
}: SwapTxReviewActionsProps) => {
  const slippage = `${reviewTrade.slippage / 100}%`
  return (
    <Accordion colorScheme="neutrals" size="sm" allowToggle defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton
          justifyContent="space-between"
          data-testid={`transaction-review-action-swap`}
        >
          <Flex alignItems="center">
            <P3Bold mr={1}>
              <Label label={"Price Info"} />
            </P3Bold>
            <AccordionIconDropdown />
          </Flex>
        </AccordionButton>

        <AccordionPanel>
          <LabelValueStack>
            <LabelValueRow
              label={<Label label={"Provider"} />}
              value={<Provider providers={reviewTrade.providers} />}
            />
            <LabelValueRow
              label={<Label label={"Price"} />}
              value={reviewTrade.executionPrice}
            />
            <LabelValueRow
              label={<Label label={"Price impact"} />}
              value={<PriceImpact priceImpact={reviewTrade.priceImpact} />}
            />
            <LabelValueRow
              label={<Label label={"Slippage"} />}
              value={slippage}
            />
            <L2Bold color="text-subtle" mt={3}>
              {`Quote includes a ${reviewTrade.totalFeePercentage * 100}% fee`}
            </L2Bold>
          </LabelValueStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
