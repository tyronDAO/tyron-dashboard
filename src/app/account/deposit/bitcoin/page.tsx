"use client"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import BTCDepositDrawer from "@/components/ui/deposit/BTCDepositDrawer"
import { RiAddLine } from "@remixicon/react"

import React from "react"

export default function BitcoinDepositPage() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  return (
    <Card>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3
            id="deposit-btc"
            className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
          >
            Bitcoin Deposits
          </h3>
          <p className="text-sm leading-6 text-gray-500">
            Follow along to add BTC funds into your Safety Deposit Box.
          </p>
        </div>
        <div className="mt-6">
          <Button
            className="mt-4 w-full gap-2 sm:mt-0 sm:w-fit"
            onClick={() => setDrawerOpen(true)}
          >
            <RiAddLine className="-ml-1 size-4 shrink-0" aria-hidden="true" />
            Deposit BTC
          </Button>
          <BTCDepositDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        </div>
      </div>
    </Card>
  )
}
