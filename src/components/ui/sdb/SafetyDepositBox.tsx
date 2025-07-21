import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { useAppStore } from "@/contexts/appStore"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import {
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
} from "@remixicon/react"
import React from "react"

export function SafetyDepositBox() {
  const { selectedWorkspace } = useWorkspace()
  const { safetyDepositBoxes } = useAppStore()
  const [copied, setCopied] = React.useState(false)

  // Find the box data for the selected workspace from Zustand
  const selectedBox = safetyDepositBoxes.find(
    (box) => box.syronId === selectedWorkspace?.value,
  )

  const boxAddress = selectedBox?.boxAddress

  const formatAddressType = (type: string) => {
    switch (type) {
      case "segwit":
        return "SegWit"
      case "taproot":
        return "Taproot"
      default:
        return type
    }
  }

  const handleCopy = async () => {
    if (boxAddress) {
      await navigator.clipboard.writeText(boxAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!selectedWorkspace || !selectedBox) {
    return (
      <Card className="w-full max-w-full p-6">
        <div className="w-full max-w-full text-center text-gray-500">
          {!selectedWorkspace
            ? "Select a Safety Deposit ₿ox to view details"
            : "Box address not available"}
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-full p-6">
      <div className="mb-4 flex w-full max-w-full flex-col items-start justify-between sm:flex-row sm:items-center">
        <div className="w-full max-w-full">
          <h3 className="break-words text-lg font-semibold text-gray-900 dark:text-gray-50">
            {selectedWorkspace.name} Safety Deposit ₿ox
          </h3>
          <p className="text-sm text-gray-500">
            Address Type: {formatAddressType(selectedBox.addressType)}
          </p>
        </div>
        <Badge variant="default" className="mt-2 sm:mt-0">
          {selectedBox.iso ?? ""}
        </Badge>
      </div>

      <div className="w-full max-w-full space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Box Address
          </label>
          <div className="flex w-full max-w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
            <code className="w-full max-w-full flex-1 break-all rounded-md bg-gray-50 p-3 font-mono text-sm dark:bg-gray-900">
              {boxAddress}
            </code>
            <div className="mt-2 flex flex-row gap-2 sm:mt-0">
              <Button
                variant="secondary"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <RiCheckLine className="h-4 w-4 text-green-600" />
                ) : (
                  <RiFileCopyLine className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  window.open(
                    `https://mempool.space/address/${boxAddress}`,
                    "_blank",
                  )
                }
                className="shrink-0"
              >
                <RiExternalLinkLine className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {copied && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Address copied to clipboard!
          </p>
        )}

        <div className="grid w-full max-w-full grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-50">
              {new Date(selectedBox.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-50">
              {new Date(selectedBox.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
