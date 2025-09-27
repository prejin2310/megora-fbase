"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserById } from "@/lib/db"

// ✅ Safe default value
const AuthContext = createContext({ user: null, initializing: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      async function hydrate() {
        if (!u) {
          setUser(null)
          setInitializing(false)
          return
        }

        try {
          const profile = await getUserById(u.uid)
          // Merge profile name into the user object so components can use user.displayName
          const merged = {
            uid: u.uid,
            email: u.email,
            photoURL: u.photoURL,
            displayName: profile?.name || u.displayName || null,
            name: profile?.name || null, // Keep name field separate for phone auth users
            phoneNumber: profile?.phone || u.phoneNumber || null,
            role: profile?.role || null,
            // keep raw firebase user in case callers need it
            _raw: u,
          }
          console.debug("AuthContext: merged user data", {
            hasProfile: !!profile,
            profileName: profile?.name,
            firebaseDisplayName: u.displayName,
            finalDisplayName: merged.displayName,
            email: merged.email,
            phoneNumber: merged.phoneNumber
          })
          setUser(merged)
        } catch (err) {
          console.error("AuthContext: failed to load profile", err)
          setUser(u)
        } finally {
          setInitializing(false)
        }
      }

      hydrate()
    })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      {children}
    </AuthContext.Provider>
  )
}

// ✅ Safer custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
