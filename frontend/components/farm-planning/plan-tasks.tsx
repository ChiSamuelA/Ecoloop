"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, AlertTriangle, Camera } from "lucide-react"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: number
  task_title: string
  task_description: string
  scheduled_date: string
  completed: boolean
  completion_date?: string
  is_critical: boolean
  category: string
  estimated_duration_minutes?: number
  photo_url?: string
}

interface DayTasks {
  day: number
  date: string
  tasks: Task[]
}

interface TasksData {
  total_tasks: number
  completed_tasks: number
  critical_tasks: number
  upcoming_tasks: number
  tasks_by_day: DayTasks[]
  statistics: {
    completion_percentage: number
  }
}

interface PlanTasksProps {
  farmPlanId: number
}

export function PlanTasks({ farmPlanId }: PlanTasksProps) {
  const [tasksData, setTasksData] = useState<TasksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingTask, setCompletingTask] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
  }, [farmPlanId])

  const fetchTasks = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${farmPlanId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch tasks")
      const data = await response.json()
      setTasksData(data.data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTasks = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/generate/${farmPlanId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Generation failed" }))
        throw new Error(error.message || "Failed to generate tasks")
      }
  
      toast({
        title: "Tasks Generated",
        description: "Daily tasks have been created for your farm plan",
      })
      
      fetchTasks()
    } catch (error) {
      toast({
        title: "Generation Failed", 
        description: "Failed to generate tasks",
        variant: "destructive",
      })
    }
  }

  const completeTask = async (taskId: number) => {
    setCompletingTask(taskId)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: "Completed via plan view" }),
      })

      if (!response.ok) throw new Error("Failed to complete task")

      toast({
        title: "Task Completed",
        description: "Task marked as completed successfully",
      })
      
      fetchTasks()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
    } finally {
      setCompletingTask(null)
    }
  }

  const getTaskStatusBadge = (task: Task) => {
    if (task.completed) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    
    const today = new Date().toISOString().split('T')[0]
    const taskDate = task.scheduled_date
    
    if (taskDate < today) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    } else if (taskDate === today) {
      return <Badge className="bg-blue-100 text-blue-800">Today</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tasksData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tasks found for this plan.</p>
        </CardContent>
      </Card>
    )
  }

  const completionPercentage = tasksData.total_tasks > 0 
    ? Math.round((tasksData.completed_tasks / tasksData.total_tasks) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Task Overview</span>
          </CardTitle>
          <CardDescription>Your daily farming activities progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tasksData.completed_tasks}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tasksData.upcoming_tasks}</div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tasksData.total_tasks - tasksData.completed_tasks - tasksData.upcoming_tasks}
              </div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{tasksData.critical_tasks}</div>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Day */}
      {tasksData.tasks_by_day && tasksData.tasks_by_day.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Daily Tasks Schedule</h3>
          
          {tasksData.tasks_by_day.map((dayData: DayTasks) => (
            <Card key={dayData.day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Day {dayData.day} - {new Date(dayData.date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayData.tasks.map((task: Task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{task.task_title}</h4>
                          {task.is_critical && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {getTaskStatusBadge(task)}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {task.task_description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Category: {task.category}</span>
                          {task.estimated_duration_minutes && (
                            <span>Duration: {task.estimated_duration_minutes}min</span>
                          )}
                          {task.completion_date && (
                            <span>Completed: {new Date(task.completion_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {task.photo_url && (
                          <Camera className="h-4 w-4 text-green-500" />
                        )}
                        
                        {!task.completed ? (
                          <Button
                            size="sm"
                            onClick={() => completeTask(task.id)}
                            disabled={completingTask === task.id}
                          >
                            {completingTask === task.id ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Tasks Generated Yet</h3>
            <p className="text-muted-foreground mb-4">
                Generate personalized daily tasks for this farm plan based on your cycle duration and experience level.
            </p>
            <Button onClick={generateTasks}>
                Generate Daily Tasks
            </Button>
            </CardContent>
        </Card>
      )}
    </div>
  )
}