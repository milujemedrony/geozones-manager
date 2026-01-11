"use client"

import { useEffect, useState } from "react"
import { GeozonesManager } from "@/components/geozones-manager"
import { cn } from "@/lib/utils"

export default function AdminGeozonesPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">

        <div
          className={cn(
            "mb-8 transition-all duration-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                Správa Geozón
              </h1>
              <p className="text-blue-200/60 mt-1">
                Poďme urobiť prácu za Dopravnú úrad, kedže niesu schopní spraviť aplikáciu a legislatívu sami.
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "transition-all duration-700 delay-200 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <GeozonesManager />
        </div>
      </div>
    </div>
  )
}
