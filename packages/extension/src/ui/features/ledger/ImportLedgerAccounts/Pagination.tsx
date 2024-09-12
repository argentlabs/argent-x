import { BoxProps, Button, Center, HStack } from "@chakra-ui/react"
import { FC } from "react"
import { P4, iconsDeprecated } from "@argent/x-ui"

const { ChevronLeftIcon, ChevronRightIcon } = iconsDeprecated

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
          <ChevronLeftIcon h={3} w={3} />
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
            <P4
              fontWeight="bold"
              color={currentPageIndex === index ? "white" : "text-subtle"}
            >
              {index + 1}
            </P4>
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
          <ChevronRightIcon h={3} w={3} />
        </Button>
      </HStack>
    </Center>
  )
}
