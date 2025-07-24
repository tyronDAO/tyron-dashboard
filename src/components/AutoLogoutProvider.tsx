"use client"

// AutoLogoutProvider: Handles inactivity-based auto-logout with a warning modal and user-configurable timeout.
// Reads timeout from sessionStorage (default 15 min), tracks user activity, and shows a warning modal 1 minute before logout.
// Used globally in layout.tsx to wrap the app.

import { Button } from "@/components/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/Dialog"
import { useAppStore } from "@/contexts/appStore"
import { useWallet } from "@/contexts/WalletContext"
import React, { useEffect, useRef, useState } from "react"

export const AutoLogoutProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { disconnectWallet, isWalletConnected } = useWallet()
  const [showWarning, setShowWarning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const timeoutMinutes = useAppStore((s) => s.timeoutMinutes)

  const [countdown, setCountdown] = useState(60)

  // @dev interpret timeoutMinutes as minutes
  // Show warning 1 minute before logout
  // Main timer effect (no event listener logic here)
  useEffect(() => {
    if (!isWalletConnected) return
    if (timerRef.current) clearTimeout(timerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current)
    setShowWarning(false)
    setCountdown(60)

    const warningDelay = Math.max((timeoutMinutes - 1) * 60 * 1000, 0)
    console.log(
      "timeoutMinutes:",
      timeoutMinutes,
      "warningDelay:",
      warningDelay,
    )

    warningTimerRef.current = setTimeout(() => {
      console.log("Warning modal should show now")
      setShowWarning(true)
      setCountdown(60)
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!)
            setShowWarning(false)
            setTimeout(() => {
              disconnectWallet()
            }, 0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, warningDelay)
  }, [timeoutMinutes, isWalletConnected, disconnectWallet])

  // User activity event listeners: only active when modal is NOT open
  useEffect(() => {
    if (!isWalletConnected || showWarning) return
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current)
      setShowWarning(false)
      setCountdown(60)
      const warningDelay = Math.max((timeoutMinutes - 1) * 60 * 1000, 0)
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true)
        setCountdown(60)
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current!)
              setShowWarning(false)
              setTimeout(() => {
                disconnectWallet()
              }, 0)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }, warningDelay)
    }
    const events = ["mousemove", "keydown", "mousedown", "touchstart"]
    events.forEach((event) => window.addEventListener(event, reset))
    return () => {
      events.forEach((event) => window.removeEventListener(event, reset))
    }
  }, [showWarning, isWalletConnected, timeoutMinutes, disconnectWallet])

  // When modal closes (user stays signed in), clear countdown
  useEffect(() => {
    if (!showWarning && countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
  }, [showWarning])

  const handleStaySignedIn = () => {
    setShowWarning(false)
    // Reset timers by simulating activity
    const event = new Event("mousemove")
    window.dispatchEvent(event)
  }

  const handleSignOut = async () => {
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current)
    setShowWarning(false)
    setTimeout(() => {
      disconnectWallet()
    }, 0)
  }

  return (
    <>
      {children}
      <Dialog open={showWarning}>
        <DialogContent
          className="max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
          style={{ minWidth: 340 }}
        >
          <DialogTitle className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            Are you still there?
          </DialogTitle>
          <DialogDescription className="mb-6 text-base text-gray-600 dark:text-gray-300">
            You will be signed out in {countdown} second
            {countdown === 1 ? "" : "s"} due to inactivity.
          </DialogDescription>
          <DialogFooter className="flex flex-row justify-end gap-3">
            <Button
              variant="primary"
              onClick={handleStaySignedIn}
              className="px-6 py-2 text-base font-medium"
            >
              Stay signed in
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              loadingText="Signing out..."
              className="px-6 py-2 text-base font-medium"
            >
              Sign out now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
