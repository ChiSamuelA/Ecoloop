export interface User {
  id: string
  email: string
  name: string
  role?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }))
      throw new AuthError(error.message || "Login failed", response.status)
    }

    const data = await response.json()
    
    // Transform backend response to match v0 structure
    if (data.success && data.data) {
      return {
        user: {
          id: data.data.user.id.toString(),
          email: data.data.user.email,
          name: data.data.user.nom, // Map nom to name
          role: data.data.user.role,
        },
        token: data.data.token,
      }
    }
    
    throw new AuthError("Invalid response format")
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Transform v0 structure to backend structure
    const backendCredentials = {
      nom: credentials.name, // Map name to nom
      email: credentials.email,
      password: credentials.password,
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendCredentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Registration failed" }))
      throw new AuthError(error.message || "Registration failed", response.status)
    }

    const data = await response.json()
    
    // Transform backend response to match v0 structure
    if (data.success && data.data) {
      return {
        user: {
          id: data.data.user.id.toString(),
          email: data.data.user.email,
          name: data.data.user.nom, // Map nom to name
          role: data.data.user.role,
        },
        token: data.data.token,
      }
    }
    
    throw new AuthError("Invalid response format")
  },

  async verifyToken(token: string): Promise<User> {
    // Use your backend's profile endpoint instead of verify
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new AuthError("Token verification failed", response.status)
    }

    const data = await response.json()
    
    // Transform backend response to match v0 structure
    if (data.success && data.data) {
      return {
        id: data.data.user.id.toString(),
        email: data.data.user.email,
        name: data.data.user.nom, // Map nom to name
        role: data.data.user.role,
      }
    }
    
    throw new AuthError("Invalid response format")
  },
}

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("eco_loop_token")
  },

  set(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("eco_loop_token", token)
  },

  remove(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("eco_loop_token")
  },
}