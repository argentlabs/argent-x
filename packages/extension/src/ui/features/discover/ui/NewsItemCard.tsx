import { AspectRatio, Button, ButtonProps, Flex, Image } from "@chakra-ui/react"
import { NewsItem } from "../../../../shared/discover/schema"
import { FC } from "react"
import { H6, L2, P4 } from "@argent/ui"
import { isEmpty } from "lodash-es"

interface NewsItemCardProps extends ButtonProps {
  newsItem: NewsItem
}

export const NewsItemCard: FC<NewsItemCardProps> = ({ newsItem, ...rest }) => {
  const { title, description, backgroundImageUrl, linkUrl, badgeText } =
    newsItem

  const hasImage = !isEmpty(backgroundImageUrl)
  return (
    <Button
      role="group"
      as={"a"}
      href={linkUrl}
      target={"_blank"}
      rounded={"xl"}
      size={"auto"}
      flexDirection={"column"}
      whiteSpace={"initial"}
      textAlign={"initial"}
      justifyContent={"initial"}
      px={2}
      pt={2}
      pb={5}
      {...rest}
    >
      <Flex position={"relative"} w={"full"}>
        <AspectRatio w="full" ratio={16 / 9} rounded={"lg"} overflow={"hidden"}>
          {hasImage ? (
            <Image
              src={backgroundImageUrl}
              alt={title}
              objectFit="cover"
              transitionProperty={"filter"}
              transitionDuration={"fast"}
              _groupHover={{ filter: "saturate(1.25)" }}
            />
          ) : (
            <Flex bg={"neutrals.600"} />
          )}
        </AspectRatio>
        {badgeText && (
          <Flex
            pointerEvents={"none"}
            position={"absolute"}
            textAlign={"right"}
            m={2}
            right={0}
            rounded={"base"}
            bg={"black"}
            py={0.5}
            px={1}
          >
            <L2>{badgeText}</L2>
          </Flex>
        )}
      </Flex>
      <Flex direction={"column"} px={1} mt={4} w={"full"} gap={0.5}>
        <H6>{title}</H6>
        {description && <P4 fontWeight={"normal"}>{description}</P4>}
      </Flex>
    </Button>
  )
}
