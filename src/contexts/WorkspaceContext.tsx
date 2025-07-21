"use client"

import { database_boxes } from "@/constants/BoxesConstants"
import {
  SafetyDepositBox,
  getUserBoxes,
} from "@/utils/services/safetyDepositBoxService"
import { walletService } from "@/utils/wallet/unisat/connection"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useAppStore } from "./appStore"
import { useWallet } from "./WalletContext"

interface Workspace {
  value: string
  name: string
  initials: string
  role: string
  color: string
  boxData?: SafetyDepositBox
}

interface WorkspaceContextType {
  // Workspaces state
  workspaces: Workspace[]
  selectedWorkspace: Workspace | null
  isLoading: boolean
  error: string | null

  // Actions
  selectWorkspace: (workspace: Workspace) => void
  refreshWorkspaces: () => Promise<void>
  createNewBox: (
    currency: string,
    addressType: "segwit" | "taproot",
  ) => Promise<void>

  // Available currencies for new boxes
  availableCurrencies: typeof database_boxes
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { walletInfo } = useWallet()
  const setZustandBoxes = useAppStore((s) => s.setSafetyDepositBoxes)
  const setSelectedBoxId = useAppStore((s) => s.setSelectedBoxId)
  const selectedBoxId = useAppStore((s) => s.selectedBoxId)

  // Convert SafetyDepositBox to Workspace format
  const convertBoxToWorkspace = (box: SafetyDepositBox): Workspace => {
    // Get currency info for display
    const currencyInfo = database_boxes.find(
      (db) => db.currency === box.currency,
    )

    // Truncate the box address to show first 10 characters + "..."
    const truncatedAddress =
      box.boxAddress.length > 13
        ? `${box.boxAddress.substring(0, 10)}...`
        : box.boxAddress

    return {
      value: box.syronId,
      name: currencyInfo?.label!, // `${currencyInfo?.label || box.currency} (${addressTypeLabel})`,
      initials: currencyInfo?.iso!,
      role: truncatedAddress, // Truncated box address
      color: getColorForCurrency(box.currency),
      boxData: {
        ...box,
        iso: currencyInfo?.iso, // Include ISO code in boxData
      },
    }
  }

  // Get color for currency
  const getColorForCurrency = (currency: string): string => {
    const colors = [
      "bg-indigo-600 dark:bg-indigo-500",
      "bg-purple-600 dark:bg-purple-500",
      "bg-green-600 dark:bg-green-500",
      "bg-orange-600 dark:bg-orange-500",
      "bg-red-600 dark:bg-red-500",
      "bg-blue-600 dark:bg-blue-500",
    ]

    const index = database_boxes.findIndex((db) => db.currency === currency)
    return colors[index % colors.length]
  }

  // Load user's Safety Deposit ₿oxes
  const loadWorkspaces = React.useCallback(
    async (walletAddress: string) => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if this is a demo address
        if (walletService.isDemoAddress(walletAddress)) {
          console.log("🔄 Demo wallet detected, loading mock data...")

          // Create mock demo boxes
          const mockBoxes: SafetyDepositBox[] = [
            {
              syronId: "demo-syron-susd",
              walletAddress: walletAddress,
              boxAddress:
                "bc1p2em8l7wx3w6gn0w3wswz5scsagfzg6zhlpwuaqszwts29285mnjq4ca8n7",
              currency: "syron-susd",
              addressType: "segwit",
              version: "1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              iso: "USD",
            },
          ]

          const workspaceList = mockBoxes.map(convertBoxToWorkspace)
          setWorkspaces(workspaceList)
          setZustandBoxes(mockBoxes)

          console.log("✅ Demo data loaded successfully")
          return
        }

        // Get all boxes for this wallet address via API (only for real wallets)
        console.log("🔄 Loading real wallet data from API...")
        const boxes = await getUserBoxes(walletAddress)
        const workspaceList = boxes.map(convertBoxToWorkspace)

        setWorkspaces(workspaceList)
        setZustandBoxes(boxes) // Persist in Zustand

        console.log("✅ Real wallet data loaded successfully")
      } catch (err) {
        setError("Failed to load Safety Deposit ₿oxes")
        console.error("Load workspaces error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [setZustandBoxes, convertBoxToWorkspace],
  )

  // Refresh workspaces
  const refreshWorkspaces = async () => {
    if (walletInfo?.address) {
      await loadWorkspaces(walletInfo.address)
    }
  }

  // Select workspace
  const selectWorkspace = (workspace: Workspace) => {
    if (selectedWorkspace?.value !== workspace.value) {
      console.log("🔄 Selecting workspace:", workspace.value)
      setSelectedWorkspace(workspace)
      setSelectedBoxId(workspace.value) // Sync with Zustand
      console.log("✅ Workspace selected")
    }
  }

  // Create new Safety Deposit ₿ox
  const createNewBox = async (
    currency: string,
    addressType: "segwit" | "taproot",
  ) => {
    if (!walletInfo?.address) {
      throw new Error("Wallet not connected")
    }

    try {
      setIsLoading(true)
      setError(null)

      // Check if this is a demo address
      if (walletService.isDemoAddress(walletInfo.address)) {
        console.log("🔄 Demo wallet detected, creating mock box...")

        // Create mock box for demo
        const mockBox: SafetyDepositBox = {
          syronId: `demo-${currency}`,
          walletAddress: walletInfo.address,
          boxAddress: `bc1p${Math.random().toString(36).substring(2, 15)}`,
          currency: currency,
          addressType: addressType,
          version: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          iso: database_boxes.find((db) => db.currency === currency)?.iso,
        }

        // Add to existing workspaces
        const newWorkspace = convertBoxToWorkspace(mockBox)
        setWorkspaces((prev) => [...prev, newWorkspace])

        // Update Zustand store
        const currentBoxes = useAppStore.getState().safetyDepositBoxes
        setZustandBoxes([...currentBoxes, mockBox])

        console.log("✅ Demo box created successfully")
        return
      }

      // Create box via API (only for real wallets)
      console.log("🔄 Creating real box via API...")
      const response = await fetch("/api/safety-deposit-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: walletInfo.address,
          currency,
          addressType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create box")
      }

      // Refresh workspaces to include the new box
      await refreshWorkspaces()

      console.log("New Safety Deposit ₿ox created successfully")
    } catch (err) {
      setError("Failed to create Safety Deposit ₿ox")
      console.error("Create box error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Get available currencies for new boxes
  const availableCurrencies = React.useMemo(() => {
    if (!walletInfo?.address) return database_boxes

    // Always return all currencies - the UI will handle which combinations are available
    // Users can have multiple boxes per currency (different address types)
    return database_boxes
  }, [walletInfo?.address])

  // Load workspaces when wallet connects
  useEffect(() => {
    if (walletInfo?.address) {
      loadWorkspaces(walletInfo.address)
    } else {
      // Clear workspaces when wallet disconnects
      console.log("🔄 Wallet disconnected, clearing workspaces...")
      setWorkspaces([])
      setSelectedWorkspace(null)
      setError(null)
      console.log("✅ Workspaces cleared")
    }
  }, [walletInfo?.address, loadWorkspaces])

  // Select first workspace when workspaces are loaded and none is selected
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      console.log("🔄 Selecting first workspace...")
      setSelectedWorkspace(workspaces[0])
      setSelectedBoxId(workspaces[0].value)
      console.log("✅ First workspace selected")
    }
  }, [workspaces, selectedWorkspace, setSelectedBoxId])

  // Sync selected workspace with Zustand when selectedBoxId changes
  useEffect(() => {
    if (selectedBoxId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.value === selectedBoxId)
      if (workspace && workspace.value !== selectedWorkspace?.value) {
        console.log("🔄 Syncing workspace from selectedBoxId:", selectedBoxId)
        setSelectedWorkspace(workspace)
        console.log("✅ Workspace synced")
      }
    } else if (!selectedBoxId && selectedWorkspace) {
      // Clear selected workspace if selectedBoxId is null
      console.log("🔄 selectedBoxId is null, clearing selected workspace")
      setSelectedWorkspace(null)
    }
  }, [selectedBoxId, workspaces, selectedWorkspace])

  const value: WorkspaceContextType = {
    workspaces,
    selectedWorkspace,
    isLoading,
    error,
    selectWorkspace,
    refreshWorkspaces,
    createNewBox,
    availableCurrencies,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
