"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { WalletConnectModal } from "@/components/ui/wallet/WalletConnectModal"
import { useWallet } from "@/contexts/WalletContext"
import {
  RiArrowRightUpLine,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from "@remixicon/react"
import { useTheme } from "next-themes"
import * as React from "react"

export type DropdownUserProfileProps = {
  children: React.ReactNode
  align?: "center" | "start" | "end"
}

export function DropdownUserProfile({
  children,
  align = "start",
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const [language, setLanguage] = React.useState("en")
  const [walletModalOpen, setWalletModalOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const { isWalletConnected, disconnectWallet } = useWallet()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuLabel>Be Your Own ₿ank</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>Language</DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={(value) => {
                    setLanguage(value)
                  }}
                >
                  <DropdownMenuRadioItem
                    aria-label="Switch to English"
                    value="en"
                    iconType="check"
                  >
                    English
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to Spanish"
                    value="es"
                    iconType="check"
                  >
                    Spanish
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value)
                  }}
                >
                  <DropdownMenuRadioItem
                    aria-label="Switch to Light Mode"
                    value="light"
                    iconType="check"
                  >
                    <RiSunLine className="size-4 shrink-0" aria-hidden="true" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to Dark Mode"
                    value="dark"
                    iconType="check"
                  >
                    <RiMoonLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to System Mode"
                    value="system"
                    iconType="check"
                  >
                    <RiComputerLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <a
                href="https://t.me/tyrondao"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center"
              >
                Telegram
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href="https://blog.tyrondao.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center"
              >
                Blog
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href="https://docs.tyrondao.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center"
              >
                Documentation
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href="https://bsky.app/profile/tyrondao.bsky.social"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center"
              >
                Bluesky
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href="https://tyrondao.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center"
              >
                TyronDAO
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {isWalletConnected ? (
              <DropdownMenuItem onClick={disconnectWallet}>
                Sign out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setWalletModalOpen(true)}>
                Sign in
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
      />
    </>
  )
}
