"use client"

import { WalletInfo, walletService } from "@/utils/wallet/unisat/connection"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useAppStore } from "./appStore"

interface WalletContextType {
  // Wallet state
  walletInfo: WalletInfo | null
  isWalletConnected: boolean
  loadingStates: {
    demo: boolean
    unisat: boolean
    okx: boolean
  }
  isLoading: boolean // Computed: true if any wallet is loading
  error: string | null

  // Actions
  connectWallet: (walletType?: string) => Promise<void>
  disconnectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loadingStates, setLoadingStates] = useState({
    demo: false,
    unisat: false,
    okx: false,
  })
  const [error, setError] = useState<string | null>(null)

  const isWalletConnected = walletInfo?.isConnected || false

  // Connect wallet
  const connectWallet = async (walletType: string = "demo") => {
    try {
      setLoadingStates((prev) => ({ ...prev, [walletType]: true }))
      setError(null)

      const info = await walletService.connect(walletType)
      setWalletInfo(info)

      // Update Zustand store
      useAppStore.getState().setWalletInfo(info)
    } catch (err) {
      setError("Failed to connect wallet")
      console.error("Wallet connection error:", err)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [walletType]: false }))
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      console.log("🔄 Starting wallet disconnect...")
      console.log("Current wallet info before disconnect:", walletInfo)

      await walletService.disconnect()
      console.log("✅ Wallet service disconnected")

      // Clear storage FIRST to prevent persistence
      sessionStorage.clear()
      console.log("✅ Storage cleared first")

      // Clear local state
      setWalletInfo(null)
      setError(null)
      console.log("✅ Local wallet state cleared")

      // Clear Zustand store
      useAppStore.getState().clearAll()
      console.log("✅ Zustand store cleared")

      // Explicitly clear selected box to ensure UI updates
      useAppStore.getState().setSelectedBoxId(null)
      console.log("✅ Selected box explicitly cleared")
    } catch (err) {
      console.error("❌ Wallet disconnection error:", err)
      // Even if there's an error, try to clear state
      sessionStorage.clear()
      setWalletInfo(null)
      setError(null)
      useAppStore.getState().clearAll()
      useAppStore.getState().setSelectedBoxId(null)
    }
  }

  // Setup wallet event listeners
  useEffect(() => {
    const handleWalletInfoChanged = (info: WalletInfo) => {
      setWalletInfo(info)
      useAppStore.getState().setWalletInfo(info)
    }

    const handleWalletDisconnected = () => {
      setWalletInfo(null)
      setError(null)
      useAppStore.getState().clearAll()
      useAppStore.getState().setSelectedBoxId(null)
      sessionStorage.clear()
    }

    // Subscribe to wallet events
    walletService.on("walletInfoChanged", handleWalletInfoChanged)
    walletService.on("walletDisconnected", handleWalletDisconnected)

    // Cleanup listeners on unmount
    return () => {
      walletService.off("walletInfoChanged", handleWalletInfoChanged)
      walletService.off("walletDisconnected", handleWalletDisconnected)
    }
  }, [])

  // Restore wallet state on app load (only for real wallets)
  useEffect(() => {
    const restoreWalletState = async () => {
      console.log("🔄 Checking for wallet state restoration...")

      // Check if there's persisted wallet info
      const persistedState = sessionStorage.getItem("tyron-app-storage")
      if (!persistedState) {
        console.log("ℹ️ No persisted wallet state found")
        return
      }

      try {
        const parsed = JSON.parse(persistedState)
        if (!parsed.state?.walletInfo) {
          console.log("ℹ️ No wallet info in persisted state")
          return
        }

        const persistedWallet = parsed.state.walletInfo

        // Check if this is a demo account - if so, clear it and don't restore
        if (walletService.isDemoAddress(persistedWallet.address)) {
          console.log("🚫 Demo account found in persistence, clearing...")
          useAppStore.getState().clearAll()
          sessionStorage.clear()
          return
        }

        // Only restore if the wallet is actually connected (has an address)
        if (!persistedWallet.address) {
          console.log("ℹ️ No wallet address in persisted state")
          return
        }

        console.log("✅ Found persisted wallet:", persistedWallet.address)

        // Try to restore Unisat wallet if it was previously connected
        if (walletService.isUnisatInstalled()) {
          console.log(
            "ℹ️ Unisat is installed, checking for existing connection...",
          )
          try {
            const unisat = (window as any).unisat
            if (unisat) {
              const accounts = await unisat.getAccounts()
              if (
                accounts.length > 0 &&
                accounts[0] === persistedWallet.address
              ) {
                console.log("✅ Found matching Unisat connection, restoring...")
                // Use restoreUnisat to restore without prompting
                const info = await walletService.restoreUnisat()
                setWalletInfo(info)
                useAppStore.getState().setWalletInfo(info)
                console.log("✅ Unisat wallet restored successfully")
                return // Exit early if Unisat is restored
              } else {
                console.log("ℹ️ Unisat accounts don't match persisted address")
              }
            }
          } catch (err) {
            console.error("❌ Failed to restore Unisat wallet state:", err)
          }
        }

        // Try to restore OKX wallet if Unisat restoration failed
        if (walletService.isOKXInstalled()) {
          console.log(
            "ℹ️ OKX wallet is installed, checking for existing connection...",
          )
          try {
            const okxwallet = (window as any).okxwallet
            if (okxwallet) {
              const accounts = await okxwallet.bitcoin.getAccounts()
              if (
                accounts.length > 0 &&
                accounts[0] === persistedWallet.address
              ) {
                console.log("✅ Found matching OKX connection, restoring...")
                // Use restoreOKX to restore without prompting
                const info = await walletService.restoreOKX()
                setWalletInfo(info)
                useAppStore.getState().setWalletInfo(info)
                console.log("✅ OKX wallet restored successfully")
                return // Exit early if OKX is restored
              } else {
                console.log("ℹ️ OKX accounts don't match persisted address")
              }
            }
          } catch (err) {
            console.error("❌ Failed to restore OKX wallet state:", err)
          }
        }

        // If we get here, the persisted wallet is not connected anymore
        console.log(
          "ℹ️ Persisted wallet is no longer connected, clearing state...",
        )
        useAppStore.getState().clearAll()
        sessionStorage.clear()
      } catch (err) {
        console.error("❌ Error parsing persisted state:", err)
        // Clear corrupted state
        useAppStore.getState().clearAll()
        sessionStorage.clear()
      }
    }

    restoreWalletState()
  }, [])

  const value: WalletContextType = {
    walletInfo,
    isWalletConnected,
    loadingStates,
    isLoading: loadingStates.demo || loadingStates.unisat || loadingStates.okx,
    error,
    connectWallet,
    disconnectWallet,
  }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
