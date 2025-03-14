import { prettifyCurrencyValue } from "@argent/x-shared"
import { H5, Label1, ListGroup, useDappId } from "@argent/x-ui"
import { Flex, Image, Square } from "@chakra-ui/react"
import { type FC } from "react"
import type {
  ParsedDefiDecompositionItemWithUsdValue,
  ParsedDefiDecompositionWithUsdValue,
  ParsedProductWithUsdValue,
} from "../../../../shared/defiDecomposition/schema"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { DefiPosition } from "./DefiPosition"
import { routes } from "../../../../shared/ui/routes"
import { useNavigate } from "react-router-dom"

interface DefiDecompositionProps {
  defiDecomposition?: ParsedDefiDecompositionWithUsdValue
  account?: BaseWalletAccount
}

export const DefiDecomposition: FC<DefiDecompositionProps> = ({
  defiDecomposition,
  account,
}) => {
  return (
    <Flex flexDirection="column" gap={4}>
      {defiDecomposition?.map((item, index) => (
        <DappItem
          key={`${item.dappId}-${index}`}
          item={item}
          account={account}
        />
      ))}
    </Flex>
  )
}

const DappItem: FC<{
  item: ParsedDefiDecompositionItemWithUsdValue
  account?: BaseWalletAccount
}> = ({ item, account }) => {
  const dapp = useDappId(item.dappId)

  return (
    <Flex flexDirection="column" gap={2}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex>
          {dapp?.logoUrl && (
            <Square
              position="relative"
              overflow="hidden"
              size={6}
              rounded={"md"}
              mr={4}
            >
              <Image
                position="absolute"
                left={0}
                right={0}
                top={0}
                bottom={0}
                alt={dapp.name}
                src={dapp.logoUrl}
              />
            </Square>
          )}
          <H5>{dapp?.name}</H5>
        </Flex>
        <Label1 textColor="text-secondary">
          {prettifyCurrencyValue(item.totalUsdValue, undefined, {
            allowLeadingZerosInDecimalPart: false,
          })}
        </Label1>
      </Flex>
      {item.products.map((product, index) => (
        <ProductItem
          key={`${product.productId}-${index}`}
          product={product}
          account={account}
          dappId={item.dappId}
        />
      ))}
    </Flex>
  )
}

const ProductItem: FC<{
  product: ParsedProductWithUsdValue
  account?: BaseWalletAccount
  dappId: string
}> = ({ product, account, dappId }) => {
  const navigate = useNavigate()
  if (!account) {
    return null
  }

  return (
    <ListGroup
      title={product.name}
      items={product.positions.map((position, index) => (
        <DefiPosition
          key={`${position.id}-${index}`}
          parsedPosition={position}
          networkId={account?.networkId}
          onClick={() =>
            navigate(routes.defiPositionDetails(position.id, dappId))
          }
          borderBottomRadius={
            index === product.positions.length - 1 ? "xl" : undefined
          }
        />
      ))}
    />
  )
}
