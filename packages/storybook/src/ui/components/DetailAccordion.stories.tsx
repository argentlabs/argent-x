import {
  DetailAccordion,
  DetailAccordionButton,
  DetailAccordionHeader,
  DetailAccordionItem,
  DetailAccordionPanel,
  DetailAccordionRow,
} from "@argent/ui"

export default {
  component: DetailAccordion,
}

const Inner = () => (
  <DetailAccordion>
    <DetailAccordionItem isDisabled>
      <DetailAccordionButton label={"Label (disabled)"} value={"Value"} />
      <DetailAccordionPanel>
        <DetailAccordionRow
          label={"Label 1"}
          value={"Value 1"}
          copyValue={"Copy value 1"}
        />
        <DetailAccordionRow
          label={"Label 2"}
          value={"Value 2"}
          copyValue={"Copy value 2"}
        />
        <DetailAccordionRow
          label={"Label 3"}
          value={"Value 3"}
          copyValue={"Copy value 3"}
        />
      </DetailAccordionPanel>
    </DetailAccordionItem>
    <DetailAccordionItem>
      <DetailAccordionButton label={"Label"} value={"Value"} />
      <DetailAccordionPanel>
        <DetailAccordionRow
          label={"Label 1"}
          value={"Value 1"}
          copyValue={"Copy value 1"}
        />
        <DetailAccordionRow
          label={"Label 2"}
          value={"Value 2"}
          copyValue={"Copy value 2"}
        />
        <DetailAccordionRow
          label={"Label 3"}
          value={"Value 3"}
          copyValue={"Copy value 3"}
        />
      </DetailAccordionPanel>
    </DetailAccordionItem>
    <DetailAccordionItem>
      <DetailAccordionButton label={"Label"} value={"Value"} />
      <DetailAccordionPanel>
        <DetailAccordionRow
          label={"Label 1"}
          value={"Value 1"}
          copyValue={"Copy value 1"}
        />
        <DetailAccordionRow
          label={"Label 2"}
          value={"Value 2"}
          copyValue={"Copy value 2"}
        />
        <DetailAccordionRow
          label={"Label 3"}
          value={"Value 3"}
          copyValue={"Copy value 3"}
        />
      </DetailAccordionPanel>
    </DetailAccordionItem>
  </DetailAccordion>
)

export const WithHeader = () => (
  <>
    <DetailAccordionHeader>Lorem ipsum dolor</DetailAccordionHeader>
    <Inner />
  </>
)

export const WithoutHeader = () => <Inner />
