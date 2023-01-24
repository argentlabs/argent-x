import { SessionAccount, createSession } from "@argent/x-sessions"
import { FC, useEffect, useState } from "react"
import { Abi, AccountInterface, Contract, ec, stark } from "starknet"

import Erc20Abi from "../../abi/ERC20.json"
import { truncateAddress, truncateHex } from "../services/address.service"
import {
  Network,
  getErc20TokenAddress,
  mintToken,
  parseInputAmountToUint256,
  transfer,
} from "../services/token.service"
import {
  addToken,
  getExplorerBaseUrl,
  networkId,
  signMessage,
  waitForTransaction,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const { randomPrivateKey } = ec.starkCurve.utils

type Status = "idle" | "approve" | "pending" | "success" | "failure"

export const TokenDapp: FC<{
  showSession: null | boolean
  account: AccountInterface
}> = ({ showSession, account }) => {
  const [mintAmount, setMintAmount] = useState("10")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("1")
  const [shortText, setShortText] = useState("")
  const [lastSig, setLastSig] = useState<string[]>([])
  const [lastTransactionHash, setLastTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle")
  const [transactionError, setTransactionError] = useState("")
  const [addTokenError, setAddTokenError] = useState("")
  const [network, setNetwork] = useState<Network>()

  const [sessionSigner] = useState(randomPrivateKey())
  const [sessionAccount, setSessionAccount] = useState<
    SessionAccount | undefined
  >()

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus)

  useEffect(() => {
    ;(async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        setTransactionError("")
        try {
          await waitForTransaction(lastTransactionHash)
          setTransactionStatus("success")
        } catch (error: any) {
          setTransactionStatus("failure")
          let message = error ? `${error}` : "No further details"
          if (error?.response) {
            message = JSON.stringify(error.response, null, 2)
          }
          setTransactionError(message)
        }
      }
    })()
  }, [transactionStatus, lastTransactionHash])

  useEffect(() => {
    ;(async () => {
      const networkId_ = await networkId()
      setNetwork(networkId_)
    })()
  }, [])

  if (network !== "goerli-alpha" && network !== "mainnet-alpha") {
    return (
      <>
        <p>
          There is no demo token for this network, but you can deploy one and
          add its address to this file:
        </p>
        <div>
          <pre>packages/dapp/src/token.service.ts</pre>
        </div>
      </>
    )
  }

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setTransactionStatus("approve")

      console.log("mint", mintAmount)
      const result = await mintToken(mintAmount, network)
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
      const result = await transfer(transferTo, transferAmount, network)
      console.log(result)

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleSignSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("approve")

      console.log("sign", shortText)
      const result = await signMessage(shortText)
      console.log(result)

      const formattedSig = stark.formatSignature(result)

      setLastSig(formattedSig)
      setTransactionStatus("success")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleOpenSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const signedSession = await createSession(
      {
        key: ec.starkCurve.getStarkKey(sessionSigner),
        expires: Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000), // 1 day in seconds
        policies: [
          {
            contractAddress: getErc20TokenAddress(network),
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
        getErc20TokenAddress(network),
        sessionAccount,
      )

      const result = await erc20Contract.transfer(
        account.address,
        parseInputAmountToUint256("0.000000001"),
      )
      console.log(result)

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }
  const tokenAddress = getErc20TokenAddress(network as any)

  return (
    <>
      <h3 style={{ margin: 0 }}>
        Transaction status: <code>{transactionStatus}</code>
      </h3>
      {lastTransactionHash && (
        <h3 style={{ margin: 0 }}>
          Transaction hash:{" "}
          <a
            href={`${getExplorerBaseUrl()}/tx/${lastTransactionHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "blue", margin: "0 0 1em" }}
          >
            <code>{truncateHex(lastTransactionHash)}</code>
          </a>
        </h3>
      )}
      {transactionError && (
        <h3 style={{ margin: 0 }}>
          Transaction error:{" "}
          <textarea
            style={{ width: "100%", height: 100, background: "white" }}
            value={transactionError}
            readOnly
          />
        </h3>
      )}
      <div className="columns">
        <form onSubmit={handleMintSubmit}>
          <h2 className={styles.title}>Mint token</h2>

          <label htmlFor="mint-amount">Amount</label>
          <input
            disabled
            type="text"
            id="mint-amount"
            name="fname"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />

          <input type="submit" disabled={true} value="Not possible with ETH!" />
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
      <div className="columns">
        <form onSubmit={handleSignSubmit}>
          <h2 className={styles.title}>Sign Message</h2>

          <label htmlFor="mint-amount">Short Text</label>
          <input
            type="text"
            id="short-text"
            name="short-text"
            value={shortText}
            onChange={(e) => setShortText(e.target.value)}
          />

          <input type="submit" value="Sign" />
        </form>
        <form>
          <h2 className={styles.title}>Sign results</h2>

          {/* Label and textarea for value r */}
          <label htmlFor="r">r</label>
          <textarea
            className={styles.textarea}
            id="r"
            name="r"
            value={lastSig[0]}
            readOnly
          />
          {/* Label and textarea for value s */}
          <label htmlFor="s">s</label>
          <textarea
            className={styles.textarea}
            id="s"
            name="s"
            value={lastSig[1]}
            readOnly
          />
        </form>
      </div>
      {showSession && (
        <div className="columns">
          <form onSubmit={handleOpenSessionSubmit}>
            <h2 className={styles.title}>Sessions</h2>

            <p>
              Random session signer:{" "}
              <code>
                {truncateHex(ec.starkCurve.getStarkKey(sessionSigner))}
              </code>
            </p>

            <input
              type="submit"
              value="Open session"
              disabled={Boolean(sessionAccount)}
            />
          </form>
          <form onSubmit={handleSessionTransactionSubmit}>
            <h2 className={styles.title}>Open session</h2>

            <p>Send some ETH to yourself using the session!</p>

            <input
              type="submit"
              value="Use session"
              disabled={Boolean(!sessionAccount) || buttonsDisabled}
            />
          </form>
        </div>
      )}
      <h3 style={{ margin: 0 }}>
        ETH token address
        <button
          className="flat"
          style={{ marginLeft: ".6em" }}
          onClick={async () => {
            try {
              await addToken(tokenAddress)
              setAddTokenError("")
            } catch (error: any) {
              setAddTokenError(error.message)
            }
          }}
        >
          Add to wallet
        </button>
        <br />
        <code>
          <a
            target="_blank"
            href={`${getExplorerBaseUrl()}/contract/${tokenAddress}`}
            rel="noreferrer"
          >
            {truncateAddress(tokenAddress)}
          </a>
        </code>
      </h3>
      <span className="error-message">{addTokenError}</span>
    </>
  )
}
