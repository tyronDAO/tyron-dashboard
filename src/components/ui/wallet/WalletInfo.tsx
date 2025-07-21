import { useWallet } from "@/contexts/WalletContext"
import { RiBitCoinLine } from "@remixicon/react"

export function WalletDashboard() {
  const { walletInfo, isWalletConnected } = useWallet()

  if (!isWalletConnected || !walletInfo) {
    return null
  }

  // Format the address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Get network display name
  const getNetworkDisplay = (network: string) => {
    return network === "mainnet" ? "Bitcoin Mainnet" : "Bitcoin Testnet"
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <RiBitCoinLine className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Connected Wallet
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getNetworkDisplay(walletInfo.network)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-gray-900 dark:text-gray-50">
            {formatAddress(walletInfo.address)}
          </p>
          {walletInfo.balance && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(parseFloat(walletInfo.balance) / 10 ** 8).toFixed(8)} BTC
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
