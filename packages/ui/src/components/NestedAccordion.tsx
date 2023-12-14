import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
  Text,
} from "@chakra-ui/react"
import {
  isArray,
  isEmpty,
  isObject,
  isObjectLike,
  lowerCase,
  upperFirst,
} from "lodash-es"
import { FC } from "react"
import { JsonArray, JsonObject } from "type-fest"
import { AccordionIconDropdown, LabelValueRow, LabelValueStack } from "."

interface NestedAccordionProps extends AccordionProps {
  json: JsonObject | JsonArray
  initiallyExpanded?: boolean
}

export const NestedAccordion: FC<NestedAccordionProps> = ({
  json,
  initiallyExpanded,
  ...rest
}) => {
  if (!isObjectLike(json)) {
    return null
  }
  const defaultIndex = initiallyExpanded ? 0 : undefined
  return (
    <LabelValueStack>
      {Object.entries(json).map(([label, value], index) => {
        const key = `${label}-${index}`
        const displayLabel = upperFirst(lowerCase(label))

        if ((isObject(value) || isArray(value)) && !isEmpty(value)) {
          return (
            <Accordion
              key={key}
              allowToggle
              defaultIndex={defaultIndex}
              size={"sm"}
              variant={"nested"}
              {...rest}
            >
              <AccordionItem>
                <AccordionButton>
                  <Text mr={1}>{displayLabel}</Text>
                  <AccordionIconDropdown />
                </AccordionButton>
                <AccordionPanel>
                  <NestedAccordion
                    json={value}
                    initiallyExpanded={initiallyExpanded}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )
        }

        /** Show empty array as "–" rather than empty accordion */
        const displayValue = isArray(value) && isEmpty(value) ? "–" : `${value}`

        return (
          <LabelValueRow key={key} label={displayLabel} value={displayValue} />
        )
      })}
    </LabelValueStack>
  )
}
