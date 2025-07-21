import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { DialogMessage } from "@/components/DialogMessage"
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

export function AddBox() {
  const { refreshWorkspaces } = useWorkspace()
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
          setDialog({
            open: true,
            desc: "Safety Deposit ₿ox created successfully!",
            title: "Success",
          })
          // Reset form
          setAddressType("segwit")
          setSelectedCurrency(database_boxes[0].currency)
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

  return (
    <>
      <DialogMessage
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        title={dialog.title}
        desc={dialog.desc}
      />
      <form onSubmit={handleSubmit}>
        <div>Add Safety Deposit ₿ox</div>
        <div className="mt-1 text-sm leading-6">
          Create a Safety Deposit ₿ox for your chosen currency and address type.
          You can have multiple boxes per currency (one for each address type).
        </div>
        <div className="mt-4">
          <Label htmlFor="sdb-currency" className="font-medium">
            ₿ox Currency
          </Label>
          <RadioCardGroup
            value={selectedCurrency}
            onValueChange={setSelectedCurrency}
            className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-2"
          >
            {database_boxes.map((database) => (
              <RadioCardItem key={database.currency} value={database.currency}>
                <div className="flex items-start gap-3">
                  <RadioCardGroupIndicator className="mt-0.5" />
                  <div>
                    {database.isRecommended ? (
                      <div className="flex items-center gap-2">
                        <span className="leading-5">{database.label}</span>
                        <Badge>Recommended</Badge>
                      </div>
                    ) : (
                      <span>{database.label}</span>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {database.description}
                    </p>
                  </div>
                </div>
              </RadioCardItem>
            ))}
          </RadioCardGroup>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="col-span-full">
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
                <SelectItem value="segwit">Segregated Witness</SelectItem>
                <SelectItem value="taproot">Taproot</SelectItem>
              </SelectContent>
            </Select>
            {/* <p className="mt-2 text-xs text-gray-500">
            For best performance, choose Taproot.
          </p> */}
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            type="submit"
            className="w-full sm:w-fit"
            isLoading={isSubmitting}
            loadingText="Creating..."
          >
            Add Safety Deposit ₿ox
          </Button>
        </div>
      </form>
    </>
  )
}
