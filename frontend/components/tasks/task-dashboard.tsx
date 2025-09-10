"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  ArrowRight,
  Loader2,
  BarChart3,
  Target
} from "lucide-react"
import { tasksApi, type TaskStatistics, type DailyTask } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface TaskDashboardProps {
  farmPlanId: number
  farmPlanName?: string
  onViewTodaysTasks: () => void
  onViewAllTasks: () => void
  onViewStatistics: () => void
  onGenerateTasks?: () => void
}

export function TaskDashboard({ 
  farmPlanId, 
  farmPlanName,
  onViewTodaysTasks,
  onViewAllTasks, 
  onViewStatistics,
  onGenerateTasks
}: TaskDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [todaysStats, setTodaysStats] = useState<any>(null)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [overallStats, setOverallStats] = useState<TaskStatistics | null>(null)
  const [hasExistingTasks, setHasExistingTasks] = useState(false)
  const [upcomingTasks, setUpcomingTasks] = useState<DailyTask[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [farmPlanId])

  const fetchDashboardData = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      // Check if tasks exist first
      const tasksExist = await tasksApi.checkTasksExist(farmPlanId, token)
      setHasExistingTasks(tasksExist)

      if (tasksExist) {
        // Get comprehensive task summary
        const summary = await tasksApi.getTaskSummary(farmPlanId, token)
        setTodaysStats(summary.todaysStats)
        setUpcomingCount(summary.upcomingCount)
        setOverallStats(summary.overallStats)

        // Get upcoming tasks for preview
        const upcomingResponse = await tasksApi.getUpcomingTasks(farmPlanId, token)
        if (upcomingResponse.success) {
          setUpcomingTasks(upcomingResponse.data.upcoming_tasks.slice(0, 5)) // Show first 5
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTasks = async () => {
    setGenerating(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.generateTasks(farmPlanId, token)
      
      toast({
        title: "Tasks Generated",
        description: `Successfully generated ${response.data.generated_count} tasks`,
      })
      
      await fetchDashboardData() // Refresh dashboard
      onGenerateTasks?.()
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
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
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // No tasks generated yet
  if (!hasExistingTasks) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Management</h2>
          <p className="text-muted-foreground mt-1">
            {farmPlanName && `${farmPlanName} • `}Manage your daily farming tasks
          </p>
        </div>

        {/* Generate Tasks Card */}
        <Card className="bg-gradient-to-br from-blue-50 via-background to-blue-100 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-12 w-12 text-blue-600" />
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Generate Your Task Schedule</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create a personalized daily task calendar based on your farm plan. 
                  Get organized tasks for feeding, cleaning, health monitoring, and more.
                </p>
                <Button 
                  onClick={handleGenerateTasks}
                  disabled={generating}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating Tasks...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Generate Tasks
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">Daily Schedule</h4>
                  <p className="text-sm text-muted-foreground">Organized tasks by day</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <h4 className="font-medium">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor completion rates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-purple-500" />
                <div>
                  <h4 className="font-medium">Task Documentation</h4>
                  <p className="text-sm text-muted-foreground">Photos and notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard with existing tasks
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Task Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          {farmPlanName && `${farmPlanName} • `}Track your daily farming progress
        </p>
      </div>

      {/* Stats Overview */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{overallStats.total_tasks}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{overallStats.completed_tasks}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                  <div className="text-xs text-muted-foreground">
                    {overallStats.completion_percentage}% completion
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{overallStats.overdue_tasks}</div>
                  <div className="text-sm text-muted-foreground">Overdue</div>
                  <div className="text-xs text-muted-foreground">
                    {overallStats.critical_tasks} critical
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{upcomingCount}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                  <div className="text-xs text-muted-foreground">Next 7 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Tasks Summary */}
      {todaysStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Today's Tasks</span>
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString()} • {todaysStats.total_tasks} tasks scheduled
                </CardDescription>
              </div>
              <Button onClick={onViewTodaysTasks} className="flex items-center space-x-2">
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Daily Progress</span>
                <span>{todaysStats.completed_tasks}/{todaysStats.total_tasks} completed</span>
              </div>
              <Progress 
                value={todaysStats.total_tasks > 0 ? (todaysStats.completed_tasks / todaysStats.total_tasks) * 100 : 0} 
                className="h-2" 
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{todaysStats.completed_tasks}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{todaysStats.pending_tasks}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{todaysStats.critical_tasks}</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(todaysStats.total_tasks > 0 ? (todaysStats.completed_tasks / todaysStats.total_tasks) * 100 : 0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Tasks Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Upcoming Tasks</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onViewAllTasks}>
                View All
              </Button>
            </CardTitle>
            <CardDescription>Next few scheduled tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-2 border border-border rounded-lg">
                    <span className="text-lg">{getCategoryIcon(task.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-1">{task.task_title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(task.scheduled_date).toLocaleDateString()} • 
                        <Badge className={`ml-1 text-xs ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                    {task.is_critical && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No upcoming tasks</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onViewStatistics}>
                Details
              </Button>
            </CardTitle>
            <CardDescription>Task completion insights</CardDescription>
          </CardHeader>
          <CardContent>
            {overallStats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Completion</span>
                  <span className="font-bold text-green-600">{overallStats.completion_percentage}%</span>
                </div>
                <Progress value={overallStats.completion_percentage} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical Tasks</span>
                  <span className="font-bold text-purple-600">{overallStats.critical_completion_percentage}%</span>
                </div>
                <Progress value={overallStats.critical_completion_percentage} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{overallStats.today_pending_tasks}</div>
                    <div className="text-xs text-muted-foreground">Today Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{overallStats.overdue_tasks}</div>
                    <div className="text-xs text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No statistics available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}