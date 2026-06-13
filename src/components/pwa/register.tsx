"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js?v=3").then((reg) => {
        reg.update()
      })
    }
  }, [])

  return null
}
