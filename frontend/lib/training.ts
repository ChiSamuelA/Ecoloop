const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Types
export interface Formation {
  id: number
  titre: string
  description: string
  categorie: string
  contenu_type: string
  contenu_url?: string
  contenu_text?: string
  duree_minutes: number
  ordre_affichage: number
  is_active: boolean
  created_at: string
  status?: 'not_started' | 'in_progress' | 'completed'
  progress_percentage?: number
  quiz_score?: number
  started_at?: string
  completed_at?: string
}

export interface Category {
  categorie: string
  formation_count: number
  avg_duration: number
}

export interface UserProgress {
  overall_statistics: {
    total_formations: number
    started_formations: number
    completed_formations: number
    avg_progress: number
    avg_quiz_score: number
  }
  category_progress: Array<{
    categorie: string
    total_formations: number
    completed_formations: number
    avg_progress: number
  }>
  recent_activity: Array<{
    titre: string
    categorie: string
    started_at: string
    completed_at?: string
    progress_percentage: number
    quiz_score?: number
  }>
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  explanation: string
  order_number: number
}

export interface QuizQuestionsResponse {
  formation: {
    id: number
    title: string
  }
  questions: QuizQuestion[]
  total_questions: number
}

export class TrainingError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = "TrainingError"
  }
}

export const trainingApi = {
  // Get all formations with user progress
  async getFormations(token: string, category?: string): Promise<{ success: boolean; data: { formations: Formation[]; formations_by_category: Record<string, Formation[]>; statistics: any } }> {
    const url = category ? `/api/formations?category=${category}` : `/api/formations`
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new TrainingError("Failed to fetch formations")
    return response.json()
  },

  // Get formation categories
  async getCategories(token: string): Promise<{ success: boolean; data: { categories: Category[] } }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new TrainingError("Failed to fetch categories")
    return response.json()
  },

  // Get specific formation
  async getFormation(id: number, token: string): Promise<{ success: boolean; data: { formation: Formation; related_formations: Formation[] } }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new TrainingError("Failed to fetch formation")
    return response.json()
  },

  // Start formation
  async startFormation(id: number, token: string): Promise<{ success: boolean; data: { progress: any } }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/${id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new TrainingError("Failed to start formation")
    return response.json()
  },

  // Update progress
  async updateProgress(id: number, progressPercentage: number, notes: string, token: string): Promise<{ success: boolean; data: { progress: any } }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/${id}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        progress_percentage: progressPercentage,
        notes,
      }),
    })
    if (!response.ok) throw new TrainingError("Failed to update progress")
    return response.json()
  },

  // Get quiz questions for a formation
  async getQuizQuestions(id: number, token: string): Promise<{ success: boolean; data: QuizQuestionsResponse }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/${id}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new TrainingError("Failed to fetch quiz questions")
    return response.json()
  },

  // Submit quiz
  async submitQuiz(id: number, answers: string[], token: string): Promise<{ success: boolean; data: { quiz_score: number; passed: boolean; total_questions: number; correct_answers: number; passing_score: number } }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/${id}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    })
    if (!response.ok) throw new TrainingError("Failed to submit quiz")
    return response.json()
  },

  // Complete formation
  async completeFormation(id: number, quizScore: number, notes: string, token: string): Promise<{ success: boolean; message: string; data: { progress: any } }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quiz_score: quizScore,
        notes,
      }),
    })
    if (!response.ok) throw new TrainingError("Failed to complete formation")
    return response.json()
  },

  // Get user progress overview
  async getUserProgress(token: string): Promise<{ success: boolean; data: UserProgress }> {
    const response = await fetch(`${API_BASE_URL}/api/formations/user/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new TrainingError("Failed to fetch user progress")
    return response.json()
  },
}