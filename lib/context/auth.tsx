'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isSupabaseConfigured: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
  initialUser?: User | null
  initialProfile?: Profile | null
  isSupabaseConfigured?: boolean
}

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
  isSupabaseConfigured = true,
}: AuthProviderProps) {
  const router = useRouter()
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [isSupabaseConfigured],
  )
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const cartSyncOwner = useCartStore((state) => state.syncOwner)
  const replaceCartItems = useCartStore((state) => state.replaceItems)
  const resetCartForGuest = useCartStore((state) => state.resetForGuest)
  const cartHasHydrated = useCartStore((state) => state.hasHydrated)
  const wishlistSyncOwner = useWishlistStore((state) => state.syncOwner)
  const replaceWishlistItems = useWishlistStore((state) => state.replaceItems)
  const resetWishlistForGuest = useWishlistStore((state) => state.resetForGuest)
  const wishlistHasHydrated = useWishlistStore((state) => state.hasHydrated)

  useEffect(() => {
    setUser(initialUser)
    setProfile(initialProfile)
  }, [initialProfile, initialUser])

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return null

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      return data
    },
    [supabase],
  )

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }

    setProfile(await fetchProfile(user.id))
  }, [fetchProfile, user])

  useEffect(() => {
    let cancelled = false
    const userId = user?.id ?? null

    if (!cartHasHydrated || !wishlistHasHydrated) {
      return
    }

    if (!userId) {
      cartSyncOwner(null)
      wishlistSyncOwner(null)
      return
    }

    const currentCartState = useCartStore.getState()
    const currentWishlistState = useWishlistStore.getState()
    const guestCartItems = currentCartState.ownerId === userId ? [] : currentCartState.items
    const guestWishlistItems = currentWishlistState.ownerId === userId ? [] : currentWishlistState.items

    async function syncPersistedState() {
      try {
        const [cartResponse, wishlistResponse] = await Promise.all([
          fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: guestCartItems }),
          }),
          fetch('/api/wishlist', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: guestWishlistItems }),
          }),
        ])

        if (cancelled) return

        if (cartResponse.ok) {
          const json = await cartResponse.json()
          if (Array.isArray(json?.data?.store_items)) {
            replaceCartItems(json.data.store_items)
            cartSyncOwner(userId)
          }
        }

        if (wishlistResponse.ok) {
          const json = await wishlistResponse.json()
          if (Array.isArray(json?.data?.store_items)) {
            replaceWishlistItems(json.data.store_items)
            wishlistSyncOwner(userId)
          }
        }
      } catch {
        // Keep the local cart/wishlist usable if sync is temporarily unavailable.
      }
    }

    void syncPersistedState()

    return () => {
      cancelled = true
    }
  }, [
    cartHasHydrated,
    cartSyncOwner,
    replaceCartItems,
    replaceWishlistItems,
    user?.id,
    wishlistHasHydrated,
    wishlistSyncOwner,
  ])

  useEffect(() => {
    if (!supabase) {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      return
    }

    let isActive = true

    const syncUser = async () => {
      const {
        data: { user: verifiedUser },
      } = await supabase.auth.getUser()

      if (!isActive) return

      setUser(verifiedUser ?? null)
      setProfile(verifiedUser ? await fetchProfile(verifiedUser.id) : null)
      setIsLoading(false)
    }

    void syncUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null

      setUser(nextUser)
      setProfile(null)
      setIsLoading(false)

      if (nextUser) {
        setTimeout(() => {
          void fetchProfile(nextUser.id).then((nextProfile) => {
            if (isActive) setProfile(nextProfile)
          })
        }, 0)
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        router.refresh()
      }
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, router, supabase])

  const signOut = useCallback(async () => {
    if (!supabase) {
      setUser(null)
      setProfile(null)
      resetCartForGuest()
      resetWishlistForGuest()
      router.replace('/')
      router.refresh()
      return
    }

    setUser(null)
    setProfile(null)
    setIsLoading(false)
    resetCartForGuest()
    resetWishlistForGuest()

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out failed:', error.message)
    }

    router.replace('/')
    router.refresh()
  }, [resetCartForGuest, resetWishlistForGuest, router, supabase])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isSupabaseConfigured,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
