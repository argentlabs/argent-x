import { Button, H3, P3, icons, typographyStyles } from "@argent/ui"
import { Flex, Link } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

const { ExpandIcon } = icons

interface MigrationDisclaimerScreenProps {
  onCreate: ReactEventHandler
}

export const MigrationDisclaimerScreen: FC<MigrationDisclaimerScreenProps> = ({
  onCreate,
}) => {
  return (
    <Flex flexDirection={"column"} flex={1} px={8} pt={18} pb={8} gap={4}>
      <H3>Please migrate your funds</H3>
      <P3>
        StarkNet is in Alpha and its testnet has made breaking changes. Mainnet
        will follow soon.
      </P3>
      <P3>
        Please create a new account and send all your assets from your old
        account(s) to this new one. You may need to use a dapp to do this.
      </P3>
      <P3>
        Old accounts will not be recoverable with your backup or seed phrase.
      </P3>
      <Link
        color={"primary.500"}
        href="https://starkware.notion.site/Contracts-As-Classes-641060360aef4d048f7cb172afd57866"
        target="_blank"
        rel="noreferrer"
        {...typographyStyles.P3}
      >
        Learn more about this change <ExpandIcon display={"inline-block"} />
      </Link>
      <Flex flex={1} />
      <Button onClick={onCreate}>Create new account</Button>
    </Flex>
  )
}
