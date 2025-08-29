import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signInWithBCH: (address: string, signature: string, message: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user and profile on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await loadProfile(user.id)
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
  
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

     

      console.log('Profile data:', data)
      console.log('Role value:', data?.role)
      console.log('Is admin check:', data?.role === 'admin')
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error

    // Create profile if signup was successful
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || '',
          role: 'user'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id)
    }
  }

async function signInWithBCH(address: string, signature: string, message: string) {
    try {
      // Por ahora, crear/encontrar usuario basado en la dirección BCH
      // En el futuro aquí verificaremos la firma
      
      // Buscar si ya existe un perfil con esta dirección BCH
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('bch_address', address)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (existingProfile) {
        // Usuario existente - crear sesión personalizada
        // Por ahora simulamos esto, en producción necesitarías edge functions
        return { user: { bch_address: address }, profile: existingProfile }
      } else {
        // Nuevo usuario - crear perfil
        const newProfile = {
          id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
}),
          email: `${address.slice(-8)}@bch.local`, // Email temporal
          full_name: `BCH User ${address.slice(-8)}`,
          role: 'user',
          bch_address: address,
          auth_method: 'bch'
        }

        const { data, error } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (error) throw error

        return { user: { bch_address: address }, profile: data }
      }
    } catch (error) {
      console.error('BCH sign in error:', error)
      throw error
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      signIn,
      signUp,
      signInWithBCH,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
