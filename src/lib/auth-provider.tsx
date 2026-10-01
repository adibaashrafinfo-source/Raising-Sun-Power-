import type { Session, User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useRef, useState } from "react"

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
  // Whose profile is currently in state. Used to tell a genuine sign-in from
  // Supabase re-emitting the session, which it does every time the tab is
  // brought back to the front.
  const loadedUserId = useRef<string | null>(null)

  const loadProfile = async (userId: string) => {
    try {
      const p = await fetchProfile(userId)
      setProfile(p)
      loadedUserId.current = p ? userId : null
    } catch {
      setProfile(null)
      loadedUserId.current = null
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
      const userId = newSession?.user?.id
      if (!userId) {
        loadedUserId.current = null
        setProfile(null)
        setIsLoading(false)
        return
      }
      // Returning to the tab makes Supabase refresh the token and re-emit the
      // session. That is the same user we already have a profile for, so
      // nothing is reloaded and isLoading stays false: flipping it would blank
      // the route guards for a moment, unmount the page underneath and throw
      // away whatever was half-typed in an open dialog.
      if (loadedUserId.current === userId) return

      setIsLoading(true)
      // Supabase warns against calling its client from inside this callback;
      // defer a tick so the auth lock is released first.
      setTimeout(() => {
        loadProfile(userId).finally(() => {
          if (active) setIsLoading(false)
        })
      }, 0)
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
