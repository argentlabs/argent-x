import { SessionAccount, createSession } from "@argent/x-sessions"
import { FC, useEffect, useMemo, useState } from "react"
import {
  Abi,
  AccountInterface,
  Contract,
  stark,
  hash,
  GatewayError,
  isSierra,
  CompiledSierraCasm,
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"

import Erc20Abi from "../../abi/ERC20.json"
import { truncateAddress, truncateHex } from "../services/address.service"
import {
  DAITokenAddress,
  ETHTokenAddress,
  mintToken,
  parseInputAmountToUint256,
  transfer,
} from "../services/token.service"
import {
  addNetwork,
  addToken,
  declare,
  deploy,
  signMessage,
  waitForTransaction,
  declareAndDeploy,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"
import { getStarkKey, utils } from "micro-starknet"
import { readFileAsString } from "@argent/shared"

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
  const [classHash, setClassHash] = useState("")
  const [contract, setContract] = useState<string | null>(null)
  const [casm, setCasm] = useState<CompiledSierraCasm | null>(null)
  const [shouldDeploy, setShouldDeploy] = useState(false)
  const [deployClassHash, setDeployClassHash] = useState("")
  const [addNetworkError, setAddNetworkError] = useState("")

  const [sessionSigner] = useState(utils.randomPrivateKey())
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
        } catch (error) {
          setTransactionStatus("failure")
          let message = error ? `${error}` : "No further details"
          if (error instanceof GatewayError) {
            message = JSON.stringify(error.message, null, 2)
          }
          setTransactionError(message)
        }
      }
    })()
  }, [transactionStatus, lastTransactionHash])

  // if (network !== "goerli-alpha" && network !== "mainnet-alpha") {
  //   return (
  //     <>
  //       <p>
  //         There is no demo token for this network, but you can deploy one and
  //         add its address to this file:
  //       </p>
  //       <div>
  //         <pre>packages/dapp/src/token.service.ts</pre>
  //       </div>
  //     </>
  //   )
  // }

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

      const result = await transfer(transferTo, transferAmount)
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

      setLastSig(stark.formatSignature(result))
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
      console.log(result)

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleDeclare = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (!contract) {
        throw new Error("No contract")
      }
      if (!classHash) {
        throw new Error("No class hash")
      }
      const payload: DeclareContractPayload = {
        contract,
        classHash,
      }
      if (casm) {
        payload.casm = casm
        delete payload.classHash
      }
      if (shouldDeploy) {
        const result = await declareAndDeploy(payload)
        console.log(result)
        setLastTransactionHash(result.deploy.transaction_hash)
      } else {
        const result = await declare(payload)
        console.log(result)
        setLastTransactionHash(result.transaction_hash)
      }
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const contractIsSierra = useMemo(() => {
    return contract && isSierra(contract)
  }, [contract])

  const handleDeploy = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (!deployClassHash) {
        throw new Error("No class hash")
      }
      const payload: UniversalDeployerContractPayload = {
        classHash: deployClassHash,
      }
      const result = await deploy(payload)
      console.log(result)
      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleAddNetwork = async () => {
    await addNetwork({
      id: "dapp-test",
      chainId: "SN_DAPP_TEST",
      chainName: "Test chain name",
      baseUrl: "http://localhost:5050",
    })
  }

  return (
    <>
      <h3 style={{ margin: 0 }}>
        Transaction status: <code>{transactionStatus}</code>
      </h3>
      {lastTransactionHash && (
        <h3 style={{ margin: 0 }}>
          Transaction hash:{" "}
          <a
            // href={`${getExplorerBaseUrl()}/tx/${lastTransactionHash}`}
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
              <code>{truncateHex(getStarkKey(sessionSigner))}</code>
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

      <div className="columns">
        <form onSubmit={handleDeclare}>
          <h2 className={styles.title}>Declare (and deploy)</h2>

          <label htmlFor="contract">Compiled Cairo contract to declare:</label>
          <input
            id="contract"
            name="contract"
            type="file"
            onChange={async (e) => {
              if (!e.target.files) {
                return
              }
              setCasm(null)

              const file = e.target.files[0]
              const fileAsString = await readFileAsString(file)
              setContract(fileAsString)

              const classHash = hash.computeContractClassHash(fileAsString)
              setClassHash(classHash)
            }}
          />

          <label htmlFor="classHash">
            ClassHash (calculated automatically):
          </label>
          <input
            style={{ width: "100%" }}
            id="classHash"
            name="classHash"
            type="text"
            value={classHash}
            readOnly
          />

          {contractIsSierra && (
            <>
              <label htmlFor="contract">Compiled CASM to declare:</label>
              <input
                id="casm"
                name="casm"
                type="file"
                onChange={async (e) => {
                  if (!e.target.files) {
                    return
                  }
                  const file = e.target.files[0]
                  const fileAsString = await readFileAsString(file)
                  const fileAsJson = JSON.parse(fileAsString)
                  setCasm(fileAsJson)
                }}
              />
            </>
          )}

          <input
            type="checkbox"
            id="shouldDeploy"
            name="shouldDeploy"
            checked={shouldDeploy}
            onChange={() => setShouldDeploy(!shouldDeploy)}
          />
          <label htmlFor="shouldDeploy">Also deploy</label>

          <input
            type="submit"
            value={shouldDeploy ? "Declare and Deploy" : "Declare"}
            disabled={!contract}
          />
        </form>
        <form onSubmit={handleDeploy}>
          <h2 className={styles.title}>Deploy</h2>

          <label htmlFor="deployClassHash">Class Hash to deploy:</label>
          <input
            style={{ width: "100%" }}
            id="deployClassHash"
            name="deployClassHash"
            type="text"
            onChange={(e) => {
              setDeployClassHash(e.target.value)
            }}
            value={deployClassHash}
          />

          <input type="submit" value="Deploy" />
        </form>
      </div>
      <div className="columns">
        <div>
          <h2 className={styles.title}>ERC20</h2>
          ETH token address
          <br />
          <code>
            <a
              target="_blank"
              // href={`${getExplorerBaseUrl()}/contract/${tokenAddress}`}
              rel="noreferrer"
            >
              {truncateAddress(ETHTokenAddress)}
            </a>
          </code>
          <br />
          <button
            className="flat"
            style={{ marginLeft: ".6em" }}
            onClick={async () => {
              try {
                await addToken(ETHTokenAddress)
                setAddTokenError("")
              } catch (error) {
                setAddTokenError((error as any).message)
              }
            }}
          >
            Add ETH token to wallet
          </button>
          <br />
          <button
            className="flat"
            style={{ marginLeft: ".6em" }}
            onClick={async () => {
              try {
                await addToken(DAITokenAddress)
                setAddTokenError("")
              } catch (error) {
                setAddTokenError((error as any).message)
              }
            }}
          >
            Add DAI token to wallet
          </button>
          <span className="error-message">{addTokenError}</span>
        </div>
        <div>
          <h2 className={styles.title}>Network</h2>
          <button
            className="flat"
            onClick={async () => {
              try {
                await handleAddNetwork()
                setAddNetworkError("")
              } catch (error) {
                setAddNetworkError((error as any).message)
              }
            }}
          >
            Add network to wallet
          </button>
          <br />
          <span className="error-message">{addNetworkError}</span>
        </div>
      </div>
    </>
  )
}
