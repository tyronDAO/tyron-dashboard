import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WalletInfo = {
  address: string
  isConnected: boolean
  network: "mainnet" | "testnet"
  balance?: string
}

// Match the service type exactly and include iso from database_boxes
export type SafetyDepositBox = {
  syronId: string
  walletAddress: string
  boxAddress: string
  currency: string
  addressType: "segwit" | "taproot"
  version?: string
  createdAt: string
  updatedAt: string
  iso?: string // ISO code from database_boxes
}

export type Transaction = {
  id: string
  type: "icp" | "bitcoin"
  amount: number
  date: string
  status: string
  // ...other fields
}

type AppState = {
  walletInfo: WalletInfo | null
  safetyDepositBoxes: SafetyDepositBox[]
  transactions: Transaction[]
  selectedBoxId: string | null
  setWalletInfo: (info: WalletInfo | null) => void
  setSafetyDepositBoxes: (boxes: SafetyDepositBox[]) => void
  setTransactions: (txs: Transaction[]) => void
  setSelectedBoxId: (id: string | null) => void
  clearAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      walletInfo: null,
      safetyDepositBoxes: [],
      transactions: [],
      selectedBoxId: null,
      setWalletInfo: (info: WalletInfo | null) => set({ walletInfo: info }),
      setSafetyDepositBoxes: (boxes: SafetyDepositBox[]) =>
        set({ safetyDepositBoxes: boxes }),
      setTransactions: (txs: Transaction[]) => set({ transactions: txs }),
      setSelectedBoxId: (id: string | null) => set({ selectedBoxId: id }),
      clearAll: () => {
        console.log("🧹 Zustand clearAll called")
        set({
          walletInfo: null,
          safetyDepositBoxes: [],
          transactions: [],
          selectedBoxId: null,
        })
        console.log("🧹 Zustand clearAll completed")

        // Also clear localStorage immediately to prevent persistence
        localStorage.removeItem("tyron-app-storage")
        sessionStorage.clear()
        console.log("🧹 Storage cleared immediately")
      },
    }),
    { name: "tyron-app-storage" },
  ),
)
