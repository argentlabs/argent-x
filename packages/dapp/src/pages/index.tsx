import type { NextPage } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"

import { TokenDapp } from "../components/TokenDapp"
import { truncateAddress } from "../services/address.service"
import {
  addWalletChangeListener,
  connectWallet,
  disconnectWallet,
  isPreauthorized,
  isWalletConnected,
  networkUrl,
  walletAddress,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [isConnected, setIsConnected] = useState(isWalletConnected())
  const [address, setAddress] = useState<string>()

  useEffect(() => {
    addWalletChangeListener((accounts) => {
      if (accounts.length > 0) {
        setAddress(accounts[0])
      } else {
        setAddress("")
        setIsConnected(false)
      }
    })
  }, [])

  useEffect(() => {
    ;(async () => {
      if (await isPreauthorized()) {
        await handleConnectClick()
      }
    })()
  }, [])

  const handleConnectClick = async () => {
    await connectWallet()
    setIsConnected(isWalletConnected())
    setAddress(await walletAddress())
  }

  const handleDisconnectClick = async () => {
    await disconnectWallet()
    setIsConnected(isWalletConnected())
    setAddress("")
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Argent x StarkNet test dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected ? (
          <>
            <div className="section-1">
              <div>
                <h3 style={{ margin: 0 }}>
                  Wallet address:{" "}
                  <code>{address && truncateAddress(address)}</code>
                </h3>
                <h3 style={{ margin: 0 }}>
                  Url: <code>{networkUrl()}</code>
                </h3>
              </div>
              <button onClick={handleDisconnectClick}>disconnect</button>
            </div>
            <TokenDapp />
          </>
        ) : (
          <>
            <button className={styles.connect} onClick={handleConnectClick}>
              Connect Wallet
            </button>
            <p>First connect wallet to use dapp.</p>
          </>
        )}
      </main>
    </div>
  )
}

export default Home
