import { FC, useEffect, useState } from "react"

import {
  getErc20TokenAddress,
  mintToken,
  transfer,
} from "../services/token.service"
import {
  getExplorerUrlBase,
  networkId,
  waitForTransaction,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

export const TokenDapp: FC = () => {
  const [mintAmount, setMintAmount] = useState("10")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("1")
  const [lastTransactionHash, setLastTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "approve" | "pending" | "success"
  >("idle")

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus)

  useEffect(() => {
    ;(async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        await waitForTransaction(lastTransactionHash)
        setTransactionStatus("success")
      }
    })()
  }, [transactionStatus, lastTransactionHash])

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setTransactionStatus("approve")

      console.log("mint", mintAmount)
      const result = await mintToken(mintAmount, networkId())
      console.log(result)

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("approve")

      console.log("transfer", { transferTo, transferAmount })
      const result = await transfer(transferTo, transferAmount, networkId())
      console.log(result)

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <>
      <h3 style={{ margin: 0 }}>
        Transaction status: <code>{transactionStatus}</code>
      </h3>
      {lastTransactionHash && (
        <a
          href={`${getExplorerUrlBase()}/tx/${lastTransactionHash}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "blue", margin: "0 0 1em" }}
        >
          <code>{lastTransactionHash}</code>
        </a>
      )}
      <div className="columns">
        <form onSubmit={handleMintSubmit}>
          <h2 className={styles.title}>Mint token</h2>

          <label htmlFor="mint-amount">Amount</label>
          <input
            type="text"
            id="mint-amount"
            name="fname"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />

          <input type="submit" disabled={buttonsDisabled} value="Mint" />
        </form>

        <form onSubmit={handleTransferSubmit}>
          <h2 className={styles.title}>Transfer token</h2>

          <label htmlFor="transfer-to">To</label>
          <input
            type="text"
            id="transfer-to"
            name="fname"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />

          <label htmlFor="transfer-amount">Amount</label>
          <input
            type="text"
            id="transfer-amount"
            name="fname"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <br />
          <input type="submit" disabled={buttonsDisabled} value="Transfer" />
        </form>
      </div>
      <h3 style={{ margin: 0 }}>
        ERC-20 token address:{" "}
        <code>
          <a
            target="_blank"
            href={`${getExplorerUrlBase()}/contract/${getErc20TokenAddress(
              networkId(),
            )}`}
            rel="noreferrer"
          >
            {getErc20TokenAddress(networkId())}
          </a>
        </code>
      </h3>
    </>
  )
}
