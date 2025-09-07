const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Backend request format
export interface FarmPlanInput {
  plan_name: string
  budget: number
  espace_m2: number
  experience_level: 'debutant' | 'intermediaire' | 'avance'
  duration_days: number
  notes?: string
}

// Backend calculation request (simpler)
export interface FarmCalculationInput {
  budget: number
  espace_m2: number
  experience_level: 'debutant' | 'intermediaire' | 'avance'
  duration_days: number
}

// Backend response format
export interface FarmPlanResponse {
  success: boolean
  message: string
  data: {
    summary: {
      nb_poulets_optimal: number
      investment_total: number
      profit_estime: number
      roi_percentage: number
      duree_cycle: string
      rentable: boolean
    }
    cost_breakdown: {
      poussins: number
      alimentation: number
      medicaments: number
      divers: number
      buffer_mortalite: number
      total: number
    }
    profitability: {
      poulets_survivants: number
      chiffre_affaires: number
      benefice_net: number
      benefice_par_poulet: number
      retour_investissement: number
      seuil_rentabilite: number
    }
    recommendations: string[]
    limiting_factors: Array<{
      factor: string
      current: string
      recommendation: string
    }>
  }
}

export class FarmPlanningError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = "FarmPlanningError"
  }
}

export const farmPlanningApi = {
  async calculateRecommendations(input: FarmCalculationInput, token: string): Promise<FarmPlanResponse> {
    const response = await fetch(`${API_BASE_URL}/api/farm-plans/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Calculation failed" }))
      throw new FarmPlanningError(error.message || "Calculation failed", response.status)
    }

    return response.json()
  },

  async createPlan(input: FarmPlanInput, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/farm-plans/create`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create plan" }))
      throw new FarmPlanningError(error.message || "Failed to create plan", response.status)
    }

    return response.json()
  },

  async getPlans(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/farm-plans`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new FarmPlanningError("Failed to fetch plans", response.status)
    }

    return response.json()
  }
}