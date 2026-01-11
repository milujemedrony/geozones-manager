"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function SignupFormDemo() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/admin", undefined)
    }
  }, [status, router])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!email || !password) return alert("Prosím, vyplň všetky polia.")
    setButtonDisabled(true)
    const response = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password,
    })

    if (!response) {
      alert("Nastala neočakávaná chyba. Skús to, prosím, znova.")
    } else if (response.ok) {
      router.push("/admin", undefined)
      alert("Gratulujeme! Dostal si sa k nám do Administrácie!")
    } else {
      alert("Nemáš dostatočné práva na prístup do tejto sekcie")
    }
    setButtonDisabled(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>
      <div
        className={cn(
          "relative z-10 max-w-md w-full mx-4 transition-all duration-700 ease-out",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 animate-pulse" />

        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
          <div
            className={cn(
              "transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="font-bold text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Mrk mrk
              </h2>
            </div>
            <p className="text-blue-200/60 text-sm mt-3 leading-relaxed">
             ALE ČAU! (Dunlock referencia), chceli by ste sa prihlásiť do Administrácie? Tak sem s tým emailom a heslom!
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div
              className={cn(
                "transition-all duration-500 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <div className="relative group">
                <Input
                  className={cn(
                    "h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800/80",
                    focusedField === "email" && "border-blue-500/50 bg-slate-800/80",
                  )}
                  id="email"
                  aria-label="Emailová adresa"
                  placeholder="jamilujemdrony@milujemedrony.sk"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none -z-10 blur-xl",
                    focusedField === "email" && "opacity-100",
                  )}
                />
              </div>
            </div>

            <div
              className={cn(
                "transition-all duration-500 delay-300",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <div className="relative group">
                <Input
                  className={cn(
                    "h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800/80",
                    focusedField === "password" && "border-blue-500/50 bg-slate-800/80",
                  )}
                  id="password"
                  aria-label="Heslo"
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none -z-10 blur-xl",
                    focusedField === "password" && "opacity-100",
                  )}
                />
              </div>
            </div>

            <div
              className={cn(
                "transition-all duration-500 delay-400",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <Button
                className="relative w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                disabled={buttonDisabled}
                type="submit"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {buttonDisabled ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Prihlasujem...
                    </>
                  ) : (
                    <>
                      Prihlásiť sa
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </div>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <span className="text-blue-300/40 text-xs">
                  Created with ❤️ by Milujemedrony.sk
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </div>
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
      `}</style>
    </div>
  )
}
