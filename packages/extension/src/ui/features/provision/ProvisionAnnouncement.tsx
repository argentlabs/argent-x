import {
  BarCloseButton,
  NavigationBar,
  ScrollContainer,
  H3,
  P3,
  Button,
} from "@argent/ui"
import { default as ProvisionLogo } from "./provisionAsset.svg"
import { Flex } from "@chakra-ui/react"

import { provisionAnnouncementStore } from "../../services/provision/provision.state"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"
import { WalletAccount } from "../../../shared/wallet.model"

type ProvisionAnnouncementProps = {
  account: WalletAccount
}

export const ProvisionAnnouncement = ({
  account,
}: ProvisionAnnouncementProps) => {
  const navigate = useNavigate()

  const onClose = () => {
    void provisionAnnouncementStore.set({
      [account.address]: Date.now(),
    })

    navigate(routes.accountTokens())
  }

  const text = `Just claimed my STRK with @argenthq on Starknet 🚀`
  // randomly 1 2 or 3
  const number = Math.ceil(Math.random() * 3)
  const imageUrl = `https://static.argent.net/tweets/twitter_0${number}.html`
  const encodedText = encodeURIComponent(text)
  const encodedImageUrl = encodeURIComponent(imageUrl)
  const twitterIntentURL = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedImageUrl}`

  return (
    <ScrollContainer
      overflowX="hidden"
      alignItems="center"
      justifyContent="space-between"
    >
      <NavigationBar
        rightButton={<BarCloseButton onClick={onClose} />}
        mb={-9}
      />
      <ProvisionLogo />
      <Flex mx={5} textAlign="center" flexDir={"column"} height="100px">
        <H3 mb={3}> Congratulations!!</H3>
        <P3>
          {account.name} has just received STRK tokens from the Starknet airdrop
        </P3>
      </Flex>
      <Flex w="100%" px={5}>
        <Button
          as="a"
          w="full"
          mt={12}
          mb={6}
          colorScheme="primary"
          href={twitterIntentURL}
          target="_blank"
        >
          Share it on X
        </Button>
      </Flex>
    </ScrollContainer>
  )
}
