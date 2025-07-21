"use client"

import { Button } from "@/components/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { WalletConnectModal } from "@/components/ui/wallet/WalletConnectModal"
import { useWallet } from "@/contexts/WalletContext"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { cx, focusInput } from "@/lib/utils"
import { RiArrowRightSLine, RiExpandUpDownLine } from "@remixicon/react"
import React from "react"
import { ModalAddWorkspace } from "./ModalAddWorkspace"

export const WorkspacesDropdownDesktop = () => {
  const { workspaces, selectedWorkspace, selectWorkspace } = useWorkspace()

  const { isWalletConnected } = useWallet()

  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false)
  const [walletModalOpen, setWalletModalOpen] = React.useState(false)
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null)
  const focusRef = React.useRef<null | HTMLButtonElement>(null)

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current
  }

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open)
    if (open === false) {
      setDropdownOpen(false)
    }
  }

  const handleWorkspaceSelect = (workspace: (typeof workspaces)[0]) => {
    selectWorkspace(workspace)
    setDropdownOpen(false)
  }

  // If wallet is not connected, show connect button
  if (!isWalletConnected) {
    return (
      <>
        <Button onClick={() => setWalletModalOpen(true)} className="w-full">
          Connect Bitcoin Wallet
        </Button>
        <WalletConnectModal
          open={walletModalOpen}
          onOpenChange={setWalletModalOpen}
        />
      </>
    )
  }

  // If no workspaces, show create first box message
  // if (workspaces.length === 0) {
  //   return (
  //     <div className="rounded-md border border-gray-300 bg-white p-2 text-sm dark:border-gray-800 dark:bg-gray-950">
  //       <div className="flex w-full items-center justify-between gap-x-4 truncate">
  //         <div className="truncate">
  //           <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
  //             No Safety Deposit ₿oxes
  //           </p>
  //           <p className="whitespace-nowrap text-left text-xs text-gray-700 dark:text-gray-300">
  //             Create your first box
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      {/* sidebar (lg+) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button
            ref={dropdownTriggerRef}
            className={cx(
              "flex w-full items-center gap-x-2.5 rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 hover:dark:bg-gray-900",
              focusInput,
            )}
          >
            {selectedWorkspace && (
              <span
                className={cx(
                  selectedWorkspace.color,
                  "flex aspect-square size-8 items-center justify-center rounded p-2 text-xs font-medium text-white",
                )}
                aria-hidden="true"
              >
                {selectedWorkspace.initials}
              </span>
            )}
            <div className="flex w-full items-center justify-between gap-x-4 truncate">
              <div className="truncate">
                <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                  {selectedWorkspace
                    ? selectedWorkspace.name
                    : "Add Safety Deposit ₿ox"}
                </p>
                {selectedWorkspace && (
                  <p className="whitespace-nowrap text-left text-xs text-gray-700 dark:text-gray-300">
                    {selectedWorkspace.role}
                  </p>
                )}
              </div>
              <RiExpandUpDownLine
                className="size-5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus()
              focusRef.current = null
              event.preventDefault()
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Safety Deposit ₿oxes ({workspaces.length})
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.value}
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className={cx(
                      workspace.color,
                      "flex aspect-square size-8 items-center justify-center rounded p-2 text-xs font-medium text-white",
                    )}
                    aria-hidden="true"
                  >
                    {workspace.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {workspace.name}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-400">
                      {workspace.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddWorkspace
            onSelect={handleDialogItemSelect}
            onOpenChange={handleDialogItemOpenChange}
            itemName="Add Safety Deposit ₿ox"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export const WorkspacesDropdownMobile = () => {
  const { workspaces, selectedWorkspace, selectWorkspace } = useWorkspace()

  const { isWalletConnected } = useWallet()

  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false)
  const [walletModalOpen, setWalletModalOpen] = React.useState(false)
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null)
  const focusRef = React.useRef<null | HTMLButtonElement>(null)

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current
  }

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open)
    if (open === false) {
      setDropdownOpen(false)
    }
  }

  const handleWorkspaceSelect = (workspace: (typeof workspaces)[0]) => {
    selectWorkspace(workspace)
    setDropdownOpen(false)
  }

  // If wallet is not connected, show connect button
  if (!isWalletConnected) {
    return (
      <>
        <Button onClick={() => setWalletModalOpen(true)}>Connect Wallet</Button>
        <WalletConnectModal
          open={walletModalOpen}
          onOpenChange={setWalletModalOpen}
        />
      </>
    )
  }

  // If no workspaces, show create first box message
  if (workspaces.length === 0) {
    return (
      <div className="flex items-center gap-x-1.5 rounded-md p-2">
        <span
          className="flex aspect-square size-7 items-center justify-center rounded bg-gray-400 p-2 text-xs font-medium text-white"
          aria-hidden="true"
        >
          ₿
        </span>
        <div className="flex w-full items-center justify-between gap-x-3 truncate">
          <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
            Add Safety Deposit ₿ox
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* sidebar (xs-lg) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button
            ref={dropdownTriggerRef}
            className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-900"
          >
            {selectedWorkspace && (
              <span
                className={cx(
                  selectedWorkspace.color,
                  "flex aspect-square size-7 items-center justify-center rounded p-2 text-xs font-medium text-white",
                )}
                aria-hidden="true"
              >
                {selectedWorkspace.initials}
              </span>
            )}
            <RiArrowRightSLine
              className="size-4 shrink-0 text-gray-500"
              aria-hidden="true"
            />
            <div className="flex w-full items-center justify-between gap-x-3 truncate">
              <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                {selectedWorkspace ? selectedWorkspace.name : "Select ₿ox"}
              </p>
              <RiExpandUpDownLine
                className="size-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="!min-w-72"
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus()
              focusRef.current = null
              event.preventDefault()
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Safety Deposit ₿oxes ({workspaces.length})
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.value}
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className={cx(
                      workspace.color,
                      "flex size-8 items-center justify-center rounded p-2 text-xs font-medium text-white",
                    )}
                    aria-hidden="true"
                  >
                    {workspace.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {workspace.name}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {workspace.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddWorkspace
            onSelect={handleDialogItemSelect}
            onOpenChange={handleDialogItemOpenChange}
            itemName="Add Safety Deposit ₿ox"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
