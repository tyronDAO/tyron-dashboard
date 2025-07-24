// Zustand will be used for persisting wallet info, safety deposit boxes, and transactions (icp and bitcoin)
// Store implementation will be in src/contexts/appStore.ts
import { Button } from "@/components/Button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { useWallet } from "@/contexts/WalletContext"
import { walletService } from "@/utils/wallet/unisat/connection"
import { useTheme } from "next-themes"
import Image from "next/image"
import React from "react"

export function WalletConnectModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { theme, systemTheme } = useTheme()
  const { connectWallet, loadingStates, isLoading } = useWallet()
  const [isUnisatInstalled, setIsUnisatInstalled] = React.useState(false)
  const [isOKXInstalled, setIsOKXInstalled] = React.useState(false)

  const resolvedTheme = theme === "system" ? systemTheme : theme
  const logoSrc =
    resolvedTheme === "dark"
      ? "/tyrondao_logotype_chrome.svg"
      : "/tyrondao_logotype_dark.svg"

  // Check if wallets are installed
  React.useEffect(() => {
    setIsUnisatInstalled(walletService.isUnisatInstalled())
    setIsOKXInstalled(walletService.isOKXInstalled())
  }, [])

  const handleConnect = async (walletType: string) => {
    try {
      await connectWallet(walletType)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleInstallUnisat = () => {
    window.open("https://unisat.io", "_blank")
  }

  const handleInstallOKX = () => {
    window.open("https://www.okx.com/web3", "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex w-full flex-col items-center">
            <Image
              src={logoSrc}
              alt="TyronDAO logotype"
              width={200}
              height={48}
              className="mb-1 h-auto w-[200px] sm:w-[150px]"
              priority // Preloads the image for faster display
              sizes="(max-width: 640px) 150px, 200px" // Loads a smaller image on mobile
            />
            <DialogDescription className="-mt-1 text-center text-xs text-orange-400 drop-shadow-[0_0_6px_rgba(245,145,27,0.5)] sm:text-sm">
              Be Your Own ₿ank
            </DialogDescription>
            <DialogTitle className="mt-4 w-full text-left text-base font-semibold sm:text-lg">
              Connect your Wallet
            </DialogTitle>
            <div className="mt-4 flex w-full flex-col gap-2 sm:gap-3">
              {/* Demo Account */}
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleConnect("demo")}
                isLoading={loadingStates.demo}
                loadingText="Connecting..."
                disabled={isLoading && !loadingStates.demo}
              >
                Demo Account
              </Button>

              {/* Unisat Wallet */}
              {isUnisatInstalled ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleConnect("unisat")}
                  isLoading={loadingStates.unisat}
                  loadingText="Connecting..."
                  disabled={isLoading && !loadingStates.unisat}
                >
                  UniSat Wallet
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleInstallUnisat}
                  disabled={isLoading}
                >
                  Install UniSat Wallet
                </Button>
              )}

              {/* OKX Wallet */}
              {isOKXInstalled ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleConnect("okx")}
                  isLoading={loadingStates.okx}
                  loadingText="Connecting..."
                  disabled={isLoading && !loadingStates.okx}
                >
                  OKX Wallet
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleInstallOKX}
                  disabled={isLoading}
                >
                  Install OKX Wallet
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="light" className="w-full" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
