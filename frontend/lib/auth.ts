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

    return response.json()
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Registration failed" }))
      throw new AuthError(error.message || "Registration failed", response.status)
    }

    return response.json()
  },

  async verifyToken(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new AuthError("Token verification failed", response.status)
    }

    return response.json()
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
