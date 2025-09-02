export interface Task {
  id: string
  title: string
  description: string
  category: "feeding" | "cleaning" | "health" | "maintenance" | "monitoring" | "other"
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed" | "overdue"
  dueDate: string
  dueTime?: string
  estimatedDuration: number // minutes
  assignedTo?: string
  farmPlanId?: string
  completedAt?: string
  completedBy?: string
  photos?: TaskPhoto[]
  notes?: string
  recurring?: {
    frequency: "daily" | "weekly" | "monthly"
    interval: number
    endDate?: string
  }
}

export interface TaskPhoto {
  id: string
  url: string
  caption?: string
  uploadedAt: string
}

export interface CreateTaskInput {
  title: string
  description: string
  category: Task["category"]
  priority: Task["priority"]
  dueDate: string
  dueTime?: string
  estimatedDuration: number
  farmPlanId?: string
  recurring?: Task["recurring"]
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: Task["status"]
  notes?: string
}

export interface CompleteTaskInput {
  notes?: string
  photos?: File[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class TaskError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "TaskError"
  }
}

export const tasksApi = {
  async getTasks(token: string, filters?: { date?: string; status?: string; category?: string }): Promise<Task[]> {
    const params = new URLSearchParams()
    if (filters?.date) params.append("date", filters.date)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.category) params.append("category", filters.category)

    const response = await fetch(`${API_BASE_URL}/api/tasks?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new TaskError("Failed to fetch tasks", response.status)
    }

    const data = await response.json()
    return data.tasks || []
  },

  async createTask(input: CreateTaskInput, token: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create task" }))
      throw new TaskError(error.message || "Failed to create task", response.status)
    }

    return response.json()
  },

  async updateTask(id: string, input: UpdateTaskInput, token: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new TaskError("Failed to update task", response.status)
    }

    return response.json()
  },

  async completeTask(id: string, input: CompleteTaskInput, token: string): Promise<Task> {
    const formData = new FormData()
    if (input.notes) formData.append("notes", input.notes)
    if (input.photos) {
      input.photos.forEach((photo, index) => {
        formData.append(`photos`, photo)
      })
    }

    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new TaskError("Failed to complete task", response.status)
    }

    return response.json()
  },

  async deleteTask(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new TaskError("Failed to delete task", response.status)
    }
  },
}

// Mock data for development
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Morning Feed - Layer Chickens",
    description: "Feed 150 layer chickens with layer feed (16-18% protein)",
    category: "feeding",
    priority: "high",
    status: "overdue",
    dueDate: "2024-01-15",
    dueTime: "07:00",
    estimatedDuration: 30,
    recurring: {
      frequency: "daily",
      interval: 1,
    },
  },
  {
    id: "task-2",
    title: "Water System Check",
    description: "Inspect water nipples and refill water tanks",
    category: "maintenance",
    priority: "medium",
    status: "pending",
    dueDate: "2024-01-15",
    dueTime: "10:00",
    estimatedDuration: 20,
  },
  {
    id: "task-3",
    title: "Egg Collection",
    description: "Collect eggs from nesting boxes and sort by quality",
    category: "monitoring",
    priority: "medium",
    status: "pending",
    dueDate: "2024-01-15",
    dueTime: "14:00",
    estimatedDuration: 45,
    recurring: {
      frequency: "daily",
      interval: 1,
    },
  },
  {
    id: "task-4",
    title: "Coop Cleaning",
    description: "Deep clean chicken coop and replace bedding",
    category: "cleaning",
    priority: "medium",
    status: "pending",
    dueDate: "2024-01-16",
    dueTime: "09:00",
    estimatedDuration: 120,
    recurring: {
      frequency: "weekly",
      interval: 1,
    },
  },
  {
    id: "task-5",
    title: "Health Inspection",
    description: "Check chickens for signs of illness or injury",
    category: "health",
    priority: "high",
    status: "completed",
    dueDate: "2024-01-14",
    dueTime: "16:00",
    estimatedDuration: 60,
    completedAt: "2024-01-14T16:30:00Z",
    notes: "All chickens appear healthy. No signs of disease.",
    photos: [
      {
        id: "photo-1",
        url: "/healthy-chickens-in-coop.png",
        caption: "Healthy chickens in main coop",
        uploadedAt: "2024-01-14T16:30:00Z",
      },
    ],
  },
]
