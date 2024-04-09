import { H2, H4, Input, Textarea } from "@argent/x-ui"
import { SessionAccount, createSession } from "@argent/x-sessions"
import { FC, useEffect, useState } from "react"
import { Abi, AccountInterface, Contract, GatewayError } from "starknet"

import { Flex } from "@chakra-ui/react"
import { getStarkKey, utils } from "micro-starknet"
import Erc20Abi from "../../abi/ERC20.json"
import { truncateHex } from "../services/address.service"
import {
  ETHTokenAddress,
  parseInputAmountToUint256,
} from "../services/token.service"
import { waitForTransaction } from "../services/wallet.service"
import { AddNetwork } from "./AddNetwork"
import { AddToken } from "./AddToken"
import { Declare } from "./Declare"
import { Deploy } from "./Deploy"
import { InfoRow } from "./InfoRow"
import { Mint } from "./Mint"
import { MintWithStarknetReact } from "./MintWithStarknetReact"
import { OffchainSessionKeys } from "./OffchainSessionKeys"
import { SignMessage } from "./SignMessage"
import { Transfer } from "./Transfer"
import { TransferWithStarknetReact } from "./TransferWithStarknetReact"
import { SignMessageWithStarknetReact } from "./SignMessageWithStarknetReact"
import { Status } from "../types/Status"

export const TokenDapp: FC<{
  showSession: null | boolean
  account: AccountInterface
  starknetReact?: boolean
}> = ({ account, showSession, starknetReact }) => {
  const [lastTransactionHash, setLastTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle")
  const [transactionError, setTransactionError] = useState("")

  const [sessionSigner] = useState(utils.randomPrivateKey())
  const [sessionAccount, setSessionAccount] = useState<
    SessionAccount | undefined
  >()

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus)

  useEffect(() => {
    const waitTx = async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        setTransactionError("")
        try {
          await waitForTransaction(lastTransactionHash)
          setTransactionStatus("success")
        } catch (error) {
          setTransactionStatus("failure")
          let message = error ? `${error}` : "No further details"
          if (error instanceof GatewayError) {
            message = JSON.stringify(error.message, null, 2)
          }
          setTransactionError(message)
        }
      }
    }
    waitTx()
  }, [transactionStatus, lastTransactionHash])

  const handleOpenSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const signedSession = await createSession(
      {
        key: getStarkKey(sessionSigner),
        expires: Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000), // 1 day in seconds
        policies: [
          {
            contractAddress: ETHTokenAddress,
            selector: "transfer",
          },
        ],
      },
      account,
    )

    setSessionAccount(
      new SessionAccount(
        account,
        account.address,
        sessionSigner,
        signedSession,
      ),
    )
  }

  const handleSessionTransactionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (!sessionAccount) {
        throw new Error("No open session")
      }
      const erc20Contract = new Contract(
        Erc20Abi as Abi,
        ETHTokenAddress,
        sessionAccount as any,
      )

      const result = await erc20Contract.transfer(
        account.address,
        parseInputAmountToUint256("0.000000001"),
      )

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <>
      <InfoRow title="Transaction status" content={transactionStatus} />
      {lastTransactionHash && (
        <>
          <Flex mt="1">
            <InfoRow
              title="Transaction hash"
              content={truncateHex(lastTransactionHash)}
              copyContent={lastTransactionHash}
            />
          </Flex>
        </>
      )}
      {transactionError && (
        <Flex direction="column" gap="1" mt="1" mb="6">
          <H4 whiteSpace="nowrap">Transaction error:</H4>
          <Textarea value={"transactionError"} readOnly w="full" />
        </Flex>
      )}
      {!transactionError && <Flex mb="6" />}
      <Flex direction="column" gap="10">
        <Flex flex={1} width="full" gap={10}>
          {starknetReact ? (
            <MintWithStarknetReact
              account={account}
              setLastTransactionHash={setLastTransactionHash}
              setTransactionStatus={setTransactionStatus}
              transactionStatus={transactionStatus}
            />
          ) : (
            <Mint
              account={account}
              setLastTransactionHash={setLastTransactionHash}
              setTransactionStatus={setTransactionStatus}
              transactionStatus={transactionStatus}
            />
          )}

          {starknetReact ? (
            <TransferWithStarknetReact
              account={account}
              setLastTransactionHash={setLastTransactionHash}
              setTransactionStatus={setTransactionStatus}
              transactionStatus={transactionStatus}
            />
          ) : (
            <Transfer
              setLastTransactionHash={setLastTransactionHash}
              setTransactionStatus={setTransactionStatus}
              transactionStatus={transactionStatus}
            />
          )}
        </Flex>
        {starknetReact ? (
          <SignMessageWithStarknetReact
            account={account}
            setTransactionStatus={setTransactionStatus}
          />
        ) : (
          <SignMessage setTransactionStatus={setTransactionStatus} />
        )}
        <OffchainSessionKeys
          account={account}
          setLastTransactionHash={setLastTransactionHash}
          setTransactionStatus={setTransactionStatus}
          transactionStatus={transactionStatus}
        />
        {showSession && (
          <>
            <div className="columns">
              <form onSubmit={handleOpenSessionSubmit}>
                <H2>Sessions</H2>

                <p>
                  Random session signer:{" "}
                  <code>{truncateHex(getStarkKey(sessionSigner))}</code>
                </p>

                <Input
                  type="submit"
                  value="Open session"
                  disabled={Boolean(sessionAccount)}
                />
              </form>
              <form onSubmit={handleSessionTransactionSubmit}>
                <H2>Open session</H2>

                <p>Send some ETH to yourself using the session!</p>

                <Input
                  type="submit"
                  value="Use session"
                  disabled={Boolean(!sessionAccount) || buttonsDisabled}
                />
              </form>
            </div>
          </>
        )}
        {!starknetReact && (
          <Flex>
            <Declare
              setLastTransactionHash={setLastTransactionHash}
              setTransactionStatus={setTransactionStatus}
            />
            <Deploy
              setLastTransactionHash={setLastTransactionHash}
              setTransactionStatus={setTransactionStatus}
            />
          </Flex>
        )}
        {!starknetReact && (
          <Flex flex={1} width="full" gap={10}>
            <AddToken />
            <AddNetwork />
          </Flex>
        )}
      </Flex>
    </>
  )
}
