import { useState } from "react"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import {
  connectWallet,
  isWalletConnected,
  walletAddress,
} from "./wallet.service"
import { TokenDapp } from "./TokenDapp"

const Home: NextPage = () => {
  const [isConnected, setIsConnected] = useState(isWalletConnected())
  const [address, setAddress] = useState<string>()

  const handleConnectClick = async () => {
    await connectWallet()
    setIsConnected(isWalletConnected())
    setAddress(await walletAddress())
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>ArgentX test dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{address}</code>
            </h3>
            <TokenDapp />
          </>
        ) : (
          <>
            <button onClick={handleConnectClick}>Connect Wallet</button>
            <p>First connect wallet to use dapp.</p>
          </>
        )}
      </main>
    </div>
  )
}

export default Home
