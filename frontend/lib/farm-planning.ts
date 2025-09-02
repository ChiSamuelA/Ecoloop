export interface FarmPlanInput {
  farmType: "layers" | "broilers" | "mixed"
  budget: number
  spaceSize: number
  spaceUnit: "sqm" | "hectares"
  experience: "beginner" | "intermediate" | "advanced"
  location: string
  objectives: string[]
  timeline: number // months
}

export interface FarmPlanRecommendation {
  id: string
  chickenCount: number
  breed: string
  setupCost: number
  monthlyOperatingCost: number
  projectedMonthlyRevenue: number
  roi: number
  profitabilityScore: number
  timeline: number
  recommendations: {
    housing: string
    feeding: string
    healthcare: string
    equipment: string[]
  }
  risks: string[]
  marketInsights: string[]
}

export interface FarmPlanResponse {
  success: boolean
  plan: FarmPlanRecommendation
  alternatives?: FarmPlanRecommendation[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class FarmPlanningError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "FarmPlanningError"
  }
}

export const farmPlanningApi = {
  async createPlan(input: FarmPlanInput, token: string): Promise<FarmPlanResponse> {
    const response = await fetch(`${API_BASE_URL}/api/farm-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create farm plan" }))
      throw new FarmPlanningError(error.message || "Failed to create farm plan", response.status)
    }

    return response.json()
  },

  async getPlans(token: string): Promise<FarmPlanRecommendation[]> {
    const response = await fetch(`${API_BASE_URL}/api/farm-plans`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new FarmPlanningError("Failed to fetch farm plans", response.status)
    }

    const data = await response.json()
    return data.plans || []
  },

  async getPlan(id: string, token: string): Promise<FarmPlanRecommendation> {
    const response = await fetch(`${API_BASE_URL}/api/farm-plans/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new FarmPlanningError("Failed to fetch farm plan", response.status)
    }

    return response.json()
  },
}

// Mock data for development/demo purposes
export const mockFarmPlanResponse: FarmPlanResponse = {
  success: true,
  plan: {
    id: "plan-001",
    chickenCount: 150,
    breed: "Rhode Island Red (Layers)",
    setupCost: 2500000, // CFA Francs
    monthlyOperatingCost: 450000,
    projectedMonthlyRevenue: 675000,
    roi: 45,
    profitabilityScore: 8.5,
    timeline: 6,
    recommendations: {
      housing: "Semi-intensive system with 10 chickens per square meter",
      feeding: "Layer feed with 16-18% protein, supplemented with local grains",
      healthcare: "Vaccination schedule: Newcastle, Fowl Pox, and Infectious Bronchitis",
      equipment: [
        "Automatic feeders (10 units)",
        "Water nipples system",
        "Nesting boxes (30 units)",
        "Perches and roosting bars",
        "Ventilation fans (4 units)",
      ],
    },
    risks: ["Disease outbreaks during rainy season", "Feed price fluctuations", "Market demand variations"],
    marketInsights: [
      "High demand for fresh eggs in Douala and Yaoundé",
      "Premium pricing for organic/free-range eggs",
      "Growing restaurant and hotel market",
    ],
  },
  alternatives: [
    {
      id: "plan-002",
      chickenCount: 100,
      breed: "Local Breed (Mixed)",
      setupCost: 1800000,
      monthlyOperatingCost: 320000,
      projectedMonthlyRevenue: 480000,
      roi: 38,
      profitabilityScore: 7.2,
      timeline: 4,
      recommendations: {
        housing: "Free-range system with basic shelter",
        feeding: "Mixed feed with local supplements",
        healthcare: "Basic vaccination program",
        equipment: ["Basic feeders", "Water containers", "Simple shelter"],
      },
      risks: ["Weather dependency", "Predator threats"],
      marketInsights: ["Local market preference", "Lower setup costs"],
    },
  ],
}
