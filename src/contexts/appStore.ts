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
  timeoutMinutes: number
  setWalletInfo: (info: WalletInfo | null) => void
  setSafetyDepositBoxes: (boxes: SafetyDepositBox[]) => void
  setTransactions: (txs: Transaction[]) => void
  setSelectedBoxId: (id: string | null) => void
  setTimeoutMinutes: (min: number) => void
  clearAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      walletInfo: null,
      safetyDepositBoxes: [],
      transactions: [],
      selectedBoxId: null,
      timeoutMinutes: 15,
      setWalletInfo: (info: WalletInfo | null) => set({ walletInfo: info }),
      setSafetyDepositBoxes: (boxes: SafetyDepositBox[]) =>
        set({ safetyDepositBoxes: boxes }),
      setTransactions: (txs: Transaction[]) => set({ transactions: txs }),
      setSelectedBoxId: (id: string | null) => set({ selectedBoxId: id }),
      setTimeoutMinutes: (min: number) => set({ timeoutMinutes: min }),
      clearAll: () => {
        console.log("🧹 Zustand clearAll called")
        set({
          walletInfo: null,
          safetyDepositBoxes: [],
          transactions: [],
          selectedBoxId: null,
        })
        console.log("🧹 Zustand clearAll completed")

        sessionStorage.clear()
        console.log("🧹 sessionStorage cleared immediately")
      },
    }),
    {
      name: "tyron-app-storage",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    },
  ),
)
