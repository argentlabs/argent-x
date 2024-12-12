import type { ButtonProps } from "@chakra-ui/react"
import { AspectRatio, Button, Flex, Image } from "@chakra-ui/react"
import type { NewsItem } from "../../../../shared/discover/schema"
import type { FC } from "react"
import { H5, L2Bold, P3 } from "@argent/x-ui"
import { isEmpty } from "lodash-es"
import { ampli } from "../../../../shared/analytics"
import { useView } from "../../../views/implementation/react"
import { selectedAccountView } from "../../../views/account"
import type { FeedPostClickedProperties } from "../../../../ampli"

interface NewsItemCardProps extends ButtonProps {
  newsItem: NewsItem
}
const supportedAccountTypes = ["smart", "multisig", "standard"]
export const NewsItemCard: FC<NewsItemCardProps> = ({ newsItem, ...rest }) => {
  const { title, description, backgroundImageUrl, linkUrl, badgeText } =
    newsItem
  const account = useView(selectedAccountView)
  const hasImage = !isEmpty(backgroundImageUrl)
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    void ampli.feedPostClicked({
      title: newsItem.title,
      "wallet platform": "browser extension",
      // agreed with product to use standard as fallback
      "account type":
        account?.type && supportedAccountTypes.includes(account?.type)
          ? (account.type as FeedPostClickedProperties["account type"])
          : "standard",
    })
    setTimeout(() => {
      window.open(linkUrl, "_blank")
    }, 100)
  }
  return (
    <Button
      role="group"
      rounded={"xl"}
      size={"auto"}
      flexDirection={"column"}
      whiteSpace={"initial"}
      textAlign={"initial"}
      justifyContent={"initial"}
      px={2}
      pt={2}
      pb={5}
      onClick={handleClick}
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
            <L2Bold>{badgeText}</L2Bold>
          </Flex>
        )}
      </Flex>
      <Flex direction={"column"} px={1} mt={4} w={"full"} gap={0.5}>
        <H5>{title}</H5>
        {description && <P3 fontWeight={"normal"}>{description}</P3>}
      </Flex>
    </Button>
  )
}
