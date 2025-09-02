"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  type AuthResponse,
  type LoginCredentials,
  type RegisterCredentials,
  authApi,
  tokenStorage,
  AuthError,
} from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.get()
      if (token) {
        try {
          const userData = await authApi.verifyToken(token)
          setUser(userData)
        } catch (error) {
          console.error("Token verification failed:", error)
          tokenStorage.remove()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response: AuthResponse = await authApi.login(credentials)

      tokenStorage.set(response.token)
      setUser(response.user)

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${response.user.name}`,
      })
    } catch (error) {
      const message = error instanceof AuthError ? error.message : "Login failed"
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true)
      const response: AuthResponse = await authApi.register(credentials)

      tokenStorage.set(response.token)
      setUser(response.user)

      toast({
        title: "Welcome to Éco Loop!",
        description: `Account created successfully for ${response.user.name}`,
      })
    } catch (error) {
      const message = error instanceof AuthError ? error.message : "Registration failed"
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    tokenStorage.remove()
    setUser(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
