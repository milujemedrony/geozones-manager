"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 text-center px-4">
        <div
          className={cn(
            "transition-all duration-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-blue-500/30 mb-8 animate-bounce-slow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        </div>

        <h1
          className={cn(
            "text-5xl md:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            MilujemeDrony.sk
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Správa Geozón</span>
        </h1>

        <p
          className={cn(
            "text-xl md:text-2xl text-blue-200/70 mb-12 max-w-lg mx-auto leading-relaxed transition-all duration-700 delay-200 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          Ak si dostanatočná alfa a omega, tak vieš, že POĎME UPRAVIŤ GEOZÓNY PODĽA LEGISLATÍVY NA SK!
        </p>

        <div
          className={cn(
            "transition-all duration-700 delay-300 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <Link href="/admin/login">
            <Button className="relative h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 overflow-hidden group">
              <span className="relative z-10 flex items-center gap-3">
                Prihlásenie
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </Link>
        </div>

        <div
          className={cn(
            "flex flex-wrap justify-center gap-4 mt-16 transition-all duration-700 delay-500 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {["Moderná aplikácia", "Jednoduché rozhranie", "Bezpečné a spoľahlivé (asi)"].map((feature, i) => (
            <div
              key={feature}
              className="px-4 py-2 rounded-full bg-slate-800/50 border border-blue-500/20 text-blue-200/70 text-sm backdrop-blur-sm"
              style={{ animationDelay: `${0.6 + i * 0.1}s` }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
