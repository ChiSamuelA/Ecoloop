const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Types
export interface DailyTask {
  id: number
  farm_plan_id: number
  template_id?: number
  day_number: number
  scheduled_date: string
  task_title: string
  task_description: string
  category: 'alimentation' | 'nettoyage' | 'sante' | 'surveillance'
  is_critical: boolean
  completed: boolean
  completion_date?: string
  photo_url?: string
  notes?: string
  created_at: string
  estimated_duration_minutes?: number
}

export interface TasksByDay {
  day: number
  date: string
  tasks: DailyTask[]
}

export interface TaskStatistics {
  total_tasks: number
  completed_tasks: number
  critical_tasks: number
  completed_critical_tasks: number
  overdue_tasks: number
  today_pending_tasks: number
  completion_percentage: number
  critical_completion_percentage: number
}

export interface CategoryStats {
  category: string
  total: number
  completed: number
}

export interface TodaysTasksResponse {
  farm_plan: {
    id: number
    plan_name: string
  }
  date: string
  tasks: DailyTask[]
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  critical_tasks: number
}

export interface TasksOverviewResponse {
  total_tasks: number
  completed_tasks: number
  critical_tasks: number
  upcoming_tasks: number
  tasks_by_day: TasksByDay[]
  statistics: TaskStatistics
}

export interface GenerateTasksResponse {
  generated_count: number
  task_summary: any
}

export interface UpcomingTasksResponse {
  upcoming_tasks: DailyTask[]
  count: number
}

export interface StatisticsResponse {
  overall_statistics: TaskStatistics
  category_breakdown: CategoryStats[]
}

export class TaskError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = "TaskError"
  }
}

export const tasksApi = {
  // Generate tasks for a farm plan
  async generateTasks(farmPlanId: number, token: string): Promise<{ success: boolean; message: string; data: GenerateTasksResponse }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/generate/${farmPlanId}`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to generate tasks", response.status)
    }
    return response.json()
  },

  // Get all tasks for a farm plan
  async getFarmPlanTasks(farmPlanId: number, token: string): Promise<{ success: boolean; message: string; data: TasksOverviewResponse }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${farmPlanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to fetch farm plan tasks", response.status)
    }
    return response.json()
  },

  // Get today's tasks
  async getTodaysTasks(farmPlanId: number, token: string): Promise<{ success: boolean; message: string; data: TodaysTasksResponse }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${farmPlanId}/today`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to fetch today's tasks", response.status)
    }
    return response.json()
  },

  // Get upcoming tasks (next 7 days)
  async getUpcomingTasks(farmPlanId: number, token: string): Promise<{ success: boolean; message: string; data: UpcomingTasksResponse }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${farmPlanId}/upcoming`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to fetch upcoming tasks", response.status)
    }
    return response.json()
  },

  // Complete a task
  async completeTask(taskId: number, notes: string, token: string): Promise<{ success: boolean; message: string; data: { task: DailyTask } }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to complete task", response.status)
    }
    return response.json()
  },

  // Upload photo for a task
  async uploadTaskPhoto(taskId: number, photo: File, token: string): Promise<{ success: boolean; message: string; data: { task: DailyTask; photo_url: string } }> {
    const formData = new FormData()
    formData.append('photo', photo)

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to upload photo", response.status)
    }
    return response.json()
  },

  // Update task notes
  async updateTaskNotes(taskId: number, notes: string, token: string): Promise<{ success: boolean; message: string; data: { task: DailyTask } }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to update task notes", response.status)
    }
    return response.json()
  },

  // Get task statistics
  async getTaskStatistics(farmPlanId: number, token: string): Promise<{ success: boolean; message: string; data: StatisticsResponse }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${farmPlanId}/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new TaskError(errorData.message || "Failed to fetch task statistics", response.status)
    }
    return response.json()
  },

  // Check if tasks exist for a farm plan
  async checkTasksExist(farmPlanId: number, token: string): Promise<boolean> {
    try {
      const response = await this.getFarmPlanTasks(farmPlanId, token)
      return response.success && response.data.total_tasks > 0
    } catch (error) {
      return false
    }
  },

  // Get task summary for dashboard
  async getTaskSummary(farmPlanId: number, token: string): Promise<{
    todaysStats: TodaysTasksResponse | null
    upcomingCount: number
    overallStats: TaskStatistics | null
  }> {
    try {
      const [todaysResponse, upcomingResponse, statsResponse] = await Promise.allSettled([
        this.getTodaysTasks(farmPlanId, token),
        this.getUpcomingTasks(farmPlanId, token),
        this.getTaskStatistics(farmPlanId, token)
      ])

      return {
        todaysStats: todaysResponse.status === 'fulfilled' ? todaysResponse.value.data : null,
        upcomingCount: upcomingResponse.status === 'fulfilled' ? upcomingResponse.value.data.count : 0,
        overallStats: statsResponse.status === 'fulfilled' ? statsResponse.value.data.overall_statistics : null
      }
    } catch (error) {
      return {
        todaysStats: null,
        upcomingCount: 0,
        overallStats: null
      }
    }
  },

  // Bulk complete multiple tasks
  async bulkCompleteTasks(taskIds: number[], notes: string, token: string): Promise<{
    successful: number[]
    failed: { taskId: number; error: string }[]
  }> {
    const results = await Promise.allSettled(
      taskIds.map(taskId => this.completeTask(taskId, notes, token))
    )

    const successful: number[] = []
    const failed: { taskId: number; error: string }[] = []

    results.forEach((result, index) => {
      const taskId = taskIds[index]
      if (result.status === 'fulfilled') {
        successful.push(taskId)
      } else {
        failed.push({
          taskId,
          error: result.reason.message || 'Unknown error'
        })
      }
    })

    return { successful, failed }
  },

  // Get tasks by category for a farm plan
  async getTasksByCategory(farmPlanId: number, category: string, token: string): Promise<{ success: boolean; data: DailyTask[] }> {
    try {
      const response = await this.getFarmPlanTasks(farmPlanId, token)
      if (response.success) {
        const filteredTasks = response.data.tasks_by_day.flatMap(day => 
          day.tasks.filter(task => task.category === category)
        )
        return {
          success: true,
          data: filteredTasks
        }
      }
      return { success: false, data: [] }
    } catch (error) {
      return { success: false, data: [] }
    }
  },

  // Get overdue tasks
  async getOverdueTasks(farmPlanId: number, token: string): Promise<{ success: boolean; data: DailyTask[] }> {
    try {
      const response = await this.getFarmPlanTasks(farmPlanId, token)
      if (response.success) {
        const today = new Date().toISOString().split('T')[0]
        const overdueTasks = response.data.tasks_by_day.flatMap(day => 
          day.tasks.filter(task => !task.completed && task.scheduled_date < today)
        )
        return {
          success: true,
          data: overdueTasks
        }
      }
      return { success: false, data: [] }
    } catch (error) {
      return { success: false, data: [] }
    }
  },

  // Get completion percentage for a specific date range
  async getCompletionRate(farmPlanId: number, startDate: string, endDate: string, token: string): Promise<number> {
    try {
      const response = await this.getFarmPlanTasks(farmPlanId, token)
      if (response.success) {
        const tasksInRange = response.data.tasks_by_day.flatMap(day => 
          day.tasks.filter(task => 
            task.scheduled_date >= startDate && task.scheduled_date <= endDate
          )
        )
        
        if (tasksInRange.length === 0) return 0
        
        const completedInRange = tasksInRange.filter(task => task.completed).length
        return Math.round((completedInRange / tasksInRange.length) * 100)
      }
      return 0
    } catch (error) {
      return 0
    }
  }
}