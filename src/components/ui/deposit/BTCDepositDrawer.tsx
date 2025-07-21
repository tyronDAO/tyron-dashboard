import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/Accordion"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"

export default function BTCDepositDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // Placeholder for form state
  // const [formData, setFormData] = React.useState({})

  const handleSubmit = () => {
    // Placeholder for submit logic
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-x-hidden sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Deposit Bitcoin (BTC)</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          Find the details for your Bitcoin deposit below.
        </DrawerDescription>
        <DrawerBody className="overflow-y-auto">
          <Accordion
            type="multiple"
            defaultValue={["item-1"]}
            className="w-full"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>Step 1: Deposit Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <p className="text-gray-500">
                    Send BTC to your Safety Deposit ₿ox address:
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Step 2: Confirmation</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Add confirmation details here */}
                  <p className="text-gray-500">
                    Confirmation step coming soon...
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Step 3: Review and Submit</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Add review and submit UI here */}
                  <p className="text-gray-500">
                    Review and submit coming soon...
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DrawerBody>
        <DrawerFooter className="-mx-6 -mb-2 gap-2 px-6 sm:justify-between">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSubmit}>Continue</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
