import type { Session, User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

import { fetchProfile } from "@/lib/queries/auth"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

type AuthState = {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  isInventoryStaff: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    try {
      const p = await fetchProfile(userId)
      setProfile(p)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    let active = true

    // isLoading must stay true until the PROFILE (and therefore the role) is
    // known, not just the session. Route guards read isAdmin/isInventoryStaff,
    // so releasing early makes a signed-in admin look like a customer for a
    // frame and bounces them out of /admin.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) await loadProfile(data.session.user.id)
      if (!active) return
      setIsLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        setIsLoading(true)
        // Supabase warns against calling its client from inside this callback;
        // defer a tick so the auth lock is released first.
        const userId = newSession.user.id
        setTimeout(() => {
          loadProfile(userId).finally(() => {
            if (active) setIsLoading(false)
          })
        }, 0)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isAdmin: profile?.role === "admin",
    isInventoryStaff: profile?.role === "admin" || profile?.role === "manager" || profile?.role === "staff",
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
