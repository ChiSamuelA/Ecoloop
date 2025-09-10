"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react"
import { tasksApi, type DailyTask, type TasksByDay } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface TaskCalendarProps {
  farmPlanId: number
  onTaskSelect?: (task: DailyTask) => void
  onDateSelect?: (date: string) => void
}

interface CalendarDay {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  tasks: DailyTask[]
  completedTasks: number
  totalTasks: number
  criticalTasks: number
}

export function TaskCalendar({ farmPlanId, onTaskSelect, onDateSelect }: TaskCalendarProps) {
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasksByDate, setTasksByDate] = useState<Record<string, DailyTask[]>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
  }, [farmPlanId])

  const fetchTasks = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.getFarmPlanTasks(farmPlanId, token)
      if (response.success) {
        // Convert tasks by day to tasks by date string
        const tasksByDateMap: Record<string, DailyTask[]> = {}
        
        response.data.tasks_by_day.forEach((dayData: TasksByDay) => {
          const dateString = dayData.date
          tasksByDateMap[dateString] = dayData.tasks
        })
        
        setTasksByDate(tasksByDateMap)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month and last day of the month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    // End at the Saturday of the week containing the last day
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    
    const days: CalendarDay[] = []
    const today = new Date().toDateString()
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const tasks = tasksByDate[dateString] || []
      
      days.push({
        date: new Date(date),
        dateString,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today,
        tasks,
        completedTasks: tasks.filter(t => t.completed).length,
        totalTasks: tasks.length,
        criticalTasks: tasks.filter(t => t.is_critical && !t.completed).length
      })
    }
    
    return days
  }, [currentDate, tasksByDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.dateString)
    onDateSelect?.(day.dateString)
  }

  const getDateIndicator = (day: CalendarDay) => {
    if (day.totalTasks === 0) return null
    
    if (day.completedTasks === day.totalTasks) {
      return <div className="w-2 h-2 bg-green-500 rounded-full" />
    } else if (day.criticalTasks > 0) {
      return <div className="w-2 h-2 bg-red-500 rounded-full" />
    } else {
      return <div className="w-2 h-2 bg-orange-500 rounded-full" />
    }
  }

  const selectedDayTasks = selectedDate ? tasksByDate[selectedDate] || [] : []

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
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading calendar...</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Task Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            View and manage tasks across your farming calendar
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`
                      relative p-3 min-h-[80px] border rounded-lg cursor-pointer transition-colors
                      ${day.isCurrentMonth ? 'bg-background' : 'bg-muted'}
                      ${day.isToday ? 'ring-2 ring-primary' : ''}
                      ${selectedDate === day.dateString ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}
                    `}
                  >
                    {/* Date number */}
                    <div className={`
                      text-sm font-medium mb-1
                      ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      ${day.isToday ? 'text-primary font-bold' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>

                    {/* Task indicators */}
                    <div className="flex flex-col space-y-1">
                      {day.totalTasks > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {getDateIndicator(day)}
                            <span className="text-xs text-muted-foreground">
                              {day.completedTasks}/{day.totalTasks}
                            </span>
                          </div>
                          {day.criticalTasks > 0 && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      )}
                      
                      {/* Show first few tasks */}
                      {day.tasks.slice(0, 2).map((task, taskIndex) => (
                        <div 
                          key={taskIndex}
                          className="text-xs p-1 rounded truncate"
                          style={{ backgroundColor: getCategoryColor(task.category).split(' ')[0].replace('bg-', '') + '20' }}
                        >
                          <span className="mr-1">{getCategoryIcon(task.category)}</span>
                          {task.completed && <CheckCircle2 className="inline h-2 w-2 text-green-500 mr-1" />}
                          <span className={task.completed ? 'line-through' : ''}>
                            {task.task_title}
                          </span>
                        </div>
                      ))}
                      
                      {day.tasks.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{day.tasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>
                  {selectedDate 
                    ? new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric'
                      })
                    : 'Select a Date'
                  }
                </span>
              </CardTitle>
              {selectedDate && (
                <CardDescription>
                  {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDayTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => onTaskSelect?.(task)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getCategoryIcon(task.category)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </Badge>
                              {task.is_critical && (
                                <Badge variant="destructive" className="text-xs">
                                  Critical
                                </Badge>
                              )}
                              {task.completed && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.task_title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {task.task_description}
                            </p>
                            {task.estimated_duration_minutes && (
                              <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimated_duration_minutes} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No tasks scheduled</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Click on a date to view tasks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>All tasks completed</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Has critical tasks</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Has pending tasks</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Critical tasks pending</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}