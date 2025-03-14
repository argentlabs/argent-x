import type { BoxProps } from "@chakra-ui/react"
import { Button, Center, HStack } from "@chakra-ui/react"
import type { FC } from "react"
import {
  ChevronLeftSecondaryIcon,
  ChevronRightSecondaryIcon,
} from "@argent/x-ui/icons"
import { P3 } from "@argent/x-ui"

interface PaginationProps extends BoxProps {
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  currentPageIndex: number
}

const NUM_PAGES = 5

export const Pagination: FC<PaginationProps> = ({
  goToPage,
  currentPageIndex,
  nextPage,
  prevPage,
  ...rest
}) => {
  return (
    <Center>
      <HStack spacing={3} {...rest}>
        <Button
          variant="ghost"
          isDisabled={currentPageIndex === 0}
          p={2}
          h={8}
          w={8}
          minH={0}
          minW={0}
          onClick={prevPage}
        >
          <ChevronLeftSecondaryIcon h={3} w={3} />
        </Button>
        {Array.from({ length: NUM_PAGES }).map((_, index) => (
          <Button
            key={index}
            borderRadius="full"
            variant={currentPageIndex === index ? "solid" : "ghost"}
            bgColor={
              currentPageIndex === index ? "neutrals.700" : "transparent"
            }
            p={2.5}
            minH={0}
            minW={0}
            h={6}
            w={6}
            onClick={() => goToPage(index)}
          >
            <P3
              fontWeight="bold"
              color={currentPageIndex === index ? "white" : "text-subtle"}
            >
              {index + 1}
            </P3>
          </Button>
        ))}
        <Button
          variant="ghost"
          isDisabled={currentPageIndex === NUM_PAGES - 1}
          p={2}
          minH={0}
          minW={0}
          h={8}
          w={8}
          onClick={nextPage}
        >
          <ChevronRightSecondaryIcon h={3} w={3} />
        </Button>
      </HStack>
    </Center>
  )
}
