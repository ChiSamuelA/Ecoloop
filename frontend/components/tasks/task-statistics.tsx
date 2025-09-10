"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Loader2,
  PieChart
} from "lucide-react"
import { tasksApi, type TaskStatistics, type CategoryStats } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface TaskStatisticsProps {
  farmPlanId: number
  farmPlanName?: string
}

export function TaskStatistics({ farmPlanId, farmPlanName }: TaskStatisticsProps) {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchStatistics()
  }, [farmPlanId])

  const fetchStatistics = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.getTaskStatistics(farmPlanId, token)
      if (response.success) {
        setStatistics(response.data.overall_statistics)
        setCategoryStats(response.data.category_breakdown)
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
      toast({
        title: "Error",
        description: "Failed to load task statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'alimentation': { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
      'nettoyage': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
      'sante': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' },
      'surveillance': { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
    }
    return colors[category as keyof typeof colors] || { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }
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

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excellent', color: 'text-green-600', badge: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { level: 'Good', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' }
    if (percentage >= 70) return { level: 'Fair', color: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' }
    return { level: 'Needs Improvement', color: 'text-red-600', badge: 'bg-red-100 text-red-800' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading statistics...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Statistics Available</h3>
          <p className="text-muted-foreground">
            Generate tasks for your farm plan to view statistics
          </p>
        </CardContent>
      </Card>
    )
  }

  const performance = getPerformanceLevel(statistics.completion_percentage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Task Analytics</h2>
        <p className="text-muted-foreground mt-1">
          {farmPlanName && `${farmPlanName} • `}Track your farming task performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{statistics.total_tasks}</div>
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
                <div className="text-2xl font-bold text-green-600">{statistics.completed_tasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-xs text-muted-foreground">
                  {statistics.completion_percentage}% completion
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
                <div className="text-2xl font-bold text-red-600">{statistics.overdue_tasks}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
                <div className="text-xs text-muted-foreground">
                  {statistics.critical_tasks} critical total
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
                <div className="text-2xl font-bold text-orange-600">{statistics.today_pending_tasks}</div>
                <div className="text-sm text-muted-foreground">Due Today</div>
                <div className="text-xs text-muted-foreground">Pending tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Overall Performance</span>
            </CardTitle>
            <CardDescription>Your task completion performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${performance.color} mb-2`}>
                {statistics.completion_percentage}%
              </div>
              <Badge className={performance.badge}>
                {performance.level}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{statistics.completed_tasks}/{statistics.total_tasks}</span>
                </div>
                <Progress value={statistics.completion_percentage} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Critical Tasks</span>
                  <span>{statistics.completed_critical_tasks}/{statistics.critical_tasks}</span>
                </div>
                <Progress value={statistics.critical_completion_percentage} className="h-3" />
                <div className="text-xs text-muted-foreground mt-1">
                  {statistics.critical_completion_percentage}% of critical tasks completed
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Performance Insights</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {statistics.completion_percentage >= 90 && (
                  <p>• Excellent task management! You're consistently completing your farming tasks.</p>
                )}
                {statistics.overdue_tasks > 0 && (
                  <p>• You have {statistics.overdue_tasks} overdue tasks that need attention.</p>
                )}
                {statistics.critical_completion_percentage < 80 && statistics.critical_tasks > 0 && (
                  <p>• Focus on completing critical tasks to improve farm health and productivity.</p>
                )}
                {statistics.today_pending_tasks > 0 && (
                  <p>• You have {statistics.today_pending_tasks} tasks due today.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Category Performance</span>
            </CardTitle>
            <CardDescription>Task completion by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => {
                const colors = getCategoryColor(category.category)
                const completionRate = category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(category.category)}</span>
                        <span className="font-medium capitalize">{category.category}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.completed}/{category.total} ({completionRate}%)
                      </div>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                )
              })}
            </div>

            {/* Category Insights */}
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Category Insights</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {categoryStats.length > 0 && (
                  <>
                    {/* Best performing category */}
                    {(() => {
                      const bestCategory = categoryStats.reduce((best, current) => {
                        const currentRate = current.total > 0 ? (current.completed / current.total) : 0
                        const bestRate = best.total > 0 ? (best.completed / best.total) : 0
                        return currentRate > bestRate ? current : best
                      })
                      const bestRate = Math.round((bestCategory.completed / bestCategory.total) * 100)
                      return (
                        <p>• Best: {bestCategory.category} ({bestRate}% completion)</p>
                      )
                    })()}
                    
                    {/* Category needing attention */}
                    {(() => {
                      const worstCategory = categoryStats.reduce((worst, current) => {
                        const currentRate = current.total > 0 ? (current.completed / current.total) : 0
                        const worstRate = worst.total > 0 ? (worst.completed / worst.total) : 1
                        return currentRate < worstRate ? current : worst
                      })
                      const worstRate = Math.round((worstCategory.completed / worstCategory.total) * 100)
                      if (worstRate < 80) {
                        return (
                          <p>• Needs attention: {worstCategory.category} ({worstRate}% completion)</p>
                        )
                      }
                      return null
                    })()}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Detailed Metrics</span>
          </CardTitle>
          <CardDescription>Comprehensive task statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{statistics.completed_tasks}</div>
              <div className="text-sm text-green-700">Tasks Completed</div>
              <div className="text-xs text-muted-foreground mt-1">
                Out of {statistics.total_tasks} total
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{statistics.critical_tasks}</div>
              <div className="text-sm text-red-700">Critical Tasks</div>
              <div className="text-xs text-muted-foreground mt-1">
                {statistics.completed_critical_tasks} completed
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{statistics.overdue_tasks}</div>
              <div className="text-sm text-orange-700">Overdue Tasks</div>
              <div className="text-xs text-muted-foreground mt-1">
                Need immediate attention
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{statistics.today_pending_tasks}</div>
              <div className="text-sm text-blue-700">Due Today</div>
              <div className="text-xs text-muted-foreground mt-1">
                Pending completion
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}