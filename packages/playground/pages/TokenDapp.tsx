import { FC, useEffect, useState } from "react"
import styles from "../styles/Home.module.css"
import { mintToken, transfer } from "./token.service"
import { waitForTransaction, walletAddress } from "./wallet.service"

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
      const result = await mintToken(mintAmount)
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
      const result = await transfer(transferTo, transferAmount)
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
          href={`https://voyager.online/tx/${lastTransactionHash}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "blue", margin: "0 0 1em" }}
        >
          <code>{lastTransactionHash}</code>
        </a>
      )}
      <h2 className={styles.title}>Mint token</h2>
      <form onSubmit={handleMintSubmit}>
        <label htmlFor="mint-amount">Amount:</label>
        <br />
        <input
          type="text"
          id="mint-amount"
          name="fname"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
        />
        <br />
        <input type="submit" disabled={buttonsDisabled} value="Mint" />
      </form>

      <h2 className={styles.title} style={{ marginTop: 10 }}>
        Transfer token
      </h2>
      <form onSubmit={handleTransferSubmit}>
        <label htmlFor="transfer-to">To:</label>
        <br />
        <input
          type="text"
          id="transfer-to"
          name="fname"
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
        />
        <br />
        <label htmlFor="transfer-amount">Amount:</label>
        <br />
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
    </>
  )
}
