import type { NextPage } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"

import { TokenDapp } from "../components/TokenDapp"
import { truncateAddress } from "../services/address.service"
import {
  addWalletChangeListener,
  connectWallet,
  isPreauthorized,
  isWalletConnected,
  networkUrl,
  walletAddress,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [isConnected, setIsConnected] = useState(isWalletConnected())
  const [address, setAddress] = useState<string>()
  const [preauthorized, setPreauthorized] = useState<boolean>(false)

  useEffect(() => {
    addWalletChangeListener((accounts) => {
      setAddress(accounts[0])
    })
  }, [])

  useEffect(() => {
    isPreauthorized().then(setPreauthorized)
  }, [])

  const handleConnectClick = async () => {
    await connectWallet()
    setIsConnected(isWalletConnected())
    setAddress(await walletAddress())
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
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{address && truncateAddress(address)}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Url: <code>{networkUrl()}</code>
            </h3>
            <TokenDapp />
          </>
        ) : (
          <>
            <button className={styles.connect} onClick={handleConnectClick}>
              Connect Wallet
            </button>
            <p>
              First connect wallet to use dapp.
              {preauthorized && (
                <span> The application is already preauthorized</span>
              )}
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default Home
