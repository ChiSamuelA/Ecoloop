"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Calendar,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { tasksApi, type DailyTask } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface UpcomingTasksProps {
  farmPlanId: number
  onViewAllTasks?: () => void
  onTaskSelect?: (task: DailyTask) => void
  maxTasks?: number
  showViewAll?: boolean
}

export function UpcomingTasks({ 
  farmPlanId, 
  onViewAllTasks,
  onTaskSelect,
  maxTasks = 5,
  showViewAll = true
}: UpcomingTasksProps) {
  const [upcomingTasks, setUpcomingTasks] = useState<DailyTask[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUpcomingTasks()
  }, [farmPlanId])

  const fetchUpcomingTasks = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.getUpcomingTasks(farmPlanId, token)
      if (response.success) {
        setUpcomingTasks(response.data.upcoming_tasks.slice(0, maxTasks))
      }
    } catch (error) {
      console.error("Failed to fetch upcoming tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load upcoming tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'alimentation': 'bg-green-100 text-green-800',
      'nettoyage': 'bg-blue-100 text-blue-800',
      'sante': 'bg-red-100 text-red-800',
      'surveillance': 'bg-orange-100 text-orange-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alimentation': return '🍽️'
      case 'nettoyage': return '🧹'
      case 'sante': return '⚕️'
      case 'surveillance': return '👁️'
      default: return '📋'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getDaysUntil = (dateString: string) => {
    const taskDate = new Date(dateString)
    const today = new Date()
    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTaskPriority = (task: DailyTask) => {
    const daysUntil = getDaysUntil(task.scheduled_date)
    
    if (task.is_critical && daysUntil <= 1) return { level: 'urgent', color: 'text-red-600' }
    if (task.is_critical) return { level: 'high', color: 'text-orange-600' }
    if (daysUntil <= 1) return { level: 'due-soon', color: 'text-blue-600' }
    return { level: 'normal', color: 'text-muted-foreground' }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Upcoming Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading upcoming tasks...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Upcoming Tasks</span>
            </CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </div>
          {showViewAll && onViewAllTasks && upcomingTasks.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onViewAllTasks}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map((task) => {
              const priority = getTaskPriority(task)
              const daysUntil = getDaysUntil(task.scheduled_date)
              
              return (
                <div 
                  key={task.id}
                  onClick={() => onTaskSelect?.(task)}
                  className={`p-3 border rounded-lg transition-colors ${
                    onTaskSelect ? 'cursor-pointer hover:bg-muted/50' : ''
                  } ${task.is_critical ? 'border-red-200 bg-red-50/50' : 'border-border'}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getCategoryIcon(task.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </Badge>
                        {task.is_critical && (
                          <Badge variant="destructive" className="flex items-center space-x-1 text-xs">
                            <AlertTriangle className="h-2 w-2" />
                            <span>Critical</span>
                          </Badge>
                        )}
                        {task.completed && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle2 className="h-2 w-2 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className={`font-medium text-sm line-clamp-1 ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.task_title}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {task.task_description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span className={priority.color}>
                            {formatDate(task.scheduled_date)}
                            {daysUntil === 0 && " (Due today)"}
                            {daysUntil === 1 && " (Due tomorrow)"}
                            {daysUntil > 1 && ` (${daysUntil} days)`}
                          </span>
                        </div>
                        
                        {task.estimated_duration_minutes && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimated_duration_minutes}min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Summary footer */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {upcomingTasks.filter(t => t.is_critical && !t.completed).length} critical tasks
                </span>
                <span>
                  {upcomingTasks.filter(t => getDaysUntil(t.scheduled_date) <= 1 && !t.completed).length} due soon
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No upcoming tasks in the next 7 days</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}