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

export function DialogMessage({
  open,
  onOpenChange,
  title,
  desc,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  desc: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title || "Message"}</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6">
            {desc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button className="w-full sm:w-fit">Ok, got it!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
