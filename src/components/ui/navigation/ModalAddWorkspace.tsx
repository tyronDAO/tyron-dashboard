import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog"
import { DialogMessage } from "@/components/DialogMessage"
import { DropdownMenuItem } from "@/components/Dropdown"
import { Label } from "@/components/Label"
import {
  RadioCardGroup,
  RadioCardGroupIndicator,
  RadioCardItem,
} from "@/components/RadioCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { database_boxes } from "@/constants/BoxesConstants"
import { useWallet } from "@/contexts/WalletContext"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import {
  formatBoxFormData,
  handleBoxFormSubmit,
} from "@/utils/services/safetyDepositBoxService"
import React from "react"

export type ModalProps = {
  itemName: string
  onSelect: () => void
  onOpenChange: (open: boolean) => void
}

export function ModalAddWorkspace({
  itemName,
  onSelect,
  onOpenChange,
}: ModalProps) {
  const { refreshWorkspaces, workspaces } = useWorkspace()
  const { isWalletConnected, walletInfo } = useWallet()
  const [addressType, setAddressType] = React.useState("segwit")
  const [selectedCurrency, setSelectedCurrency] = React.useState(
    database_boxes[0].currency,
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [dialog, setDialog] = React.useState<{
    open: boolean
    desc: string
    title?: string
  }>({ open: false, desc: "", title: undefined })

  // Get available address types for selected currency
  const getAvailableAddressTypes = (currency: string) => {
    const existingBoxes = workspaces.filter(
      (w) => w.boxData?.currency === currency,
    )
    const usedAddressTypes = existingBoxes
      .map((w) => w.boxData?.addressType)
      .filter(Boolean)

    const allAddressTypes: Array<"segwit" | "taproot"> = ["segwit", "taproot"]
    return allAddressTypes.filter((type) => !usedAddressTypes.includes(type))
  }

  // Get available currencies (currencies that still have available address types)
  const getAvailableCurrencies = () => {
    return database_boxes.filter((db) => {
      const availableAddressTypes = getAvailableAddressTypes(db.currency)
      return availableAddressTypes.length > 0
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isWalletConnected) {
      setDialog({
        open: true,
        desc: "Please connect your Bitcoin wallet first.",
        title: "Wallet Not Connected",
      })
      return
    }

    // Check if this combination is available
    const availableAddressTypes = getAvailableAddressTypes(selectedCurrency)
    if (!availableAddressTypes.includes(addressType as "segwit" | "taproot")) {
      setDialog({
        open: true,
        desc: `You already have a ${selectedCurrency} box with ${addressType} address type.`,
        title: "Box Already Exists",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = formatBoxFormData(addressType, selectedCurrency)
      const walletAddress = walletInfo?.address || "mock_wallet_address"

      await handleBoxFormSubmit(
        formData,
        walletAddress,
        // onSuccess callback
        (data) => {
          console.log("Box created successfully:", data)
          onOpenChange(false)
        },
        // onError callback
        (error) => {
          setDialog({ open: true, desc: error, title: "Error" })
        },
        // onBoxCreated callback - refresh workspaces
        refreshWorkspaces,
      )
    } catch (error) {
      console.error("Error in form submission:", error)
      setDialog({
        open: true,
        desc: "An unexpected error occurred. Please try again.",
        title: "Error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableCurrencies = getAvailableCurrencies()
  const availableAddressTypes = getAvailableAddressTypes(selectedCurrency)

  // Update selected currency if current one is not available
  React.useEffect(() => {
    if (
      availableCurrencies.length > 0 &&
      !availableCurrencies.find((c) => c.currency === selectedCurrency)
    ) {
      setSelectedCurrency(availableCurrencies[0].currency)
    }
  }, [availableCurrencies, selectedCurrency])

  // Update address type if current one is not available
  React.useEffect(() => {
    if (
      availableAddressTypes.length > 0 &&
      !availableAddressTypes.includes(addressType as "segwit" | "taproot")
    ) {
      setAddressType(availableAddressTypes[0])
    }
  }, [availableAddressTypes, addressType])

  return (
    <>
      <DialogMessage
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        title={dialog.title}
        desc={dialog.desc}
      />
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger className="w-full text-left">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onSelect && onSelect()
            }}
          >
            {itemName}
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Safety Deposit ₿ox</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                Create a Safety Deposit ₿ox for your chosen currency and address
                type. You can have multiple boxes per currency (one for each
                address type).
              </DialogDescription>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* <div>
                    <Label htmlFor="workspace-name" className="font-medium">
                      Workspace name
                    </Label>
                    <Input
                      id="workspace-name"
                      name="workspace-name"
                      placeholder="my_workspace"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="starter-kit" className="font-medium">
                      Starter kit
                    </Label>
                    <Select defaultValue="empty-workspace">
                      <SelectTrigger
                        id="starter-kit"
                        name="starter-kit"
                        className="mt-2"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty-workspace">
                          None - Empty workspace
                        </SelectItem>
                        <SelectItem value="commerce-analytics">
                          Commerce analytics
                        </SelectItem>
                        <SelectItem value="product-analytics">
                          Product analytics
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
              </div>
              <div className="mt-4">
                <Label htmlFor="sdb-currency" className="font-medium">
                  ₿ox Currency
                </Label>
                <RadioCardGroup
                  value={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                  className="mt-2 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"
                >
                  {availableCurrencies.map((database) => {
                    const availableAddressTypes = getAvailableAddressTypes(
                      database.currency,
                    )
                    const addressTypeLabels = availableAddressTypes
                      .map((type) => (type === "segwit" ? "SegWit" : "Taproot"))
                      .join(", ")

                    return (
                      <RadioCardItem
                        key={database.currency}
                        value={database.currency}
                      >
                        <div className="flex items-start gap-3">
                          <RadioCardGroupIndicator className="mt-0.5" />
                          <div>
                            {database.isRecommended ? (
                              <div className="flex items-center gap-2">
                                <span className="leading-5">
                                  {database.label}
                                </span>
                                <Badge>Recommended</Badge>
                              </div>
                            ) : (
                              <span>{database.label}</span>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              {database.description}
                            </p>
                            <p className="mt-1 text-xs text-blue-600">
                              Available: {addressTypeLabels}
                            </p>
                          </div>
                        </div>
                      </RadioCardItem>
                    )
                  })}
                </RadioCardGroup>
              </div>
              <div className="mt-6">
                <Label htmlFor="sdb-currency" className="font-medium">
                  ₿ox Address Type
                </Label>
                <Select
                  value={addressType}
                  onValueChange={(value) => {
                    setAddressType(value)
                  }}
                >
                  <SelectTrigger id="sdb-type" name="sdb-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAddressTypes.includes("segwit") && (
                      <SelectItem value="segwit">Segregated Witness</SelectItem>
                    )}
                    {availableAddressTypes.includes("taproot") && (
                      <SelectItem value="taproot">Taproot</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {/* <p className="mt-2 text-xs text-gray-500">
                    For best performance, choose Taproot.
                  </p> */}
              </div>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-0">
              <DialogClose asChild>
                <Button
                  className="w-full sm:w-fit"
                  variant="secondary"
                  type="button"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="w-full sm:w-fit"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Add Safety Deposit ₿ox
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
