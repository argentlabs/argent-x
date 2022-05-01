import type { IStarknetWindowObject } from "@argent/get-starknet"
import type { NextPage } from "next"
import Head from "next/head"
import { useEffect, useMemo, useState } from "react"

import { TokenDapp } from "../components/TokenDapp"
import { truncateAddress } from "../services/address.service"
import {
  addWalletChangeListener,
  connectWallet,
  networkUrl,
  removeWalletChangeListener,
  silentConnectWallet,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [wallet, setWallet] = useState<IStarknetWindowObject>()

  const address = useMemo(() => wallet?.selectedAddress, [wallet])
  const isConnected = useMemo(() => wallet?.isConnected ?? false, [wallet])

  useEffect(() => {
    const handler = async () => {
      const wallet = await silentConnectWallet()
      setWallet(wallet)
    }
    addWalletChangeListener(handler, wallet)
    return () => {
      removeWalletChangeListener(handler, wallet)
    }
  }, [wallet])

  useEffect(() => {
    ;(async () => {
      const wallet = await silentConnectWallet()
      console.log(wallet)
      setWallet(wallet)
    })()
  }, [])

  const handleConnectClick = async () => {
    const wallet = await connectWallet()
    setWallet(wallet)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Argent x StarkNet test dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected && wallet ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{address && truncateAddress(address)}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Url: <code>{networkUrl(wallet)}</code>
            </h3>
            <TokenDapp wallet={wallet} />
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
