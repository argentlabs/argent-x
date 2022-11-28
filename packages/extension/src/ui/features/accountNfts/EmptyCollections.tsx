import { Button, CellStack, H6, P3, logos } from "@argent/ui"
import { FC } from "react"

const { Aspect, Briq, Mintsquare } = logos

const EmptyCollections: FC<{ networkId: string }> = ({ networkId }) => (
  <>
    <H6 color="neutrals.400">No NFTs</H6>
    <P3 color="neutrals.400" mb="3" mt="1.5">
      Discover NFTs on StarkNet
    </P3>

    <CellStack>
      {networkId === "goerli-alpha" && (
        <>
          <Button
            as={"a"}
            size="sm"
            rounded={"lg"}
            leftIcon={<Aspect />}
            href="https://testnet.aspect.co"
            title="Aspect"
            target="_blank"
          >
            Aspect
          </Button>
          <Button
            as={"a"}
            size="sm"
            rounded={"lg"}
            leftIcon={<Mintsquare />}
            href="https://mintsquare.io/starknet-testnet"
            title="Mintsquare"
            target="_blank"
          >
            Mintsquare
          </Button>
          <Button
            as={"a"}
            size="sm"
            rounded={"lg"}
            leftIcon={<Briq />}
            href="https://briq.construction/"
            title="Briq"
            target="_blank"
          >
            Briq
          </Button>
        </>
      )}
      {networkId === "mainnet-alpha" && (
        <>
          <Button
            as={"a"}
            size="sm"
            rounded={"lg"}
            leftIcon={<Aspect />}
            href="https://aspect.co"
            title="Aspect"
            target="_blank"
          >
            Aspect
          </Button>
          <Button
            as={"a"}
            size="sm"
            rounded={"lg"}
            leftIcon={<Mintsquare />}
            href="https://mintsquare.io/starknet"
            title="Mintsquare"
            target="_blank"
          >
            Mintsquare
          </Button>
        </>
      )}
    </CellStack>
  </>
)

export { EmptyCollections }
