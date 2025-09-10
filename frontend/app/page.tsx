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
  Target, 
  TrendingUp,
  AlertTriangle,
  Zap,
  BookOpen,
  Users,
  ChevronRight,
  Plus,
  BarChart3,
  Loader2,
  Activity,
  MessageSquare
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { tokenStorage } from "@/lib/auth"
import Link from "next/link"

interface DashboardStats {
  totalFarmPlans: number
  activeFarmPlans: number
  totalTasks: number
  completedTasks: number
  todayTasks: number
  overdueTasks: number
  trainingProgress: number
  completedCourses: number
  forumPosts: number
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: number
  type: 'task' | 'training' | 'forum' | 'plan'
  title: string
  description: string
  timestamp: string
  status?: 'completed' | 'pending' | 'overdue'
}

interface FarmPlan {
  id: number
  plan_name: string
  status: string
  duration_days: number
  nb_poulets_recommande: number
  progress_percentage?: number
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPlans, setRecentPlans] = useState<FarmPlan[]>([])
  const [todaysTasks, setTodaysTasks] = useState<any[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      // Fetch multiple endpoints in parallel
      const [farmPlansRes, progressRes] = await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/farm-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/formations/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      // Process farm plans
      let farmPlans: FarmPlan[] = []
      if (farmPlansRes.status === 'fulfilled' && farmPlansRes.value.ok) {
        const farmData = await farmPlansRes.value.json()
        if (farmData.success && farmData.data?.farm_plans) {
          farmPlans = farmData.data.farm_plans
          setRecentPlans(farmPlans.slice(0, 3))
        }
      }

      // Process training progress
      let trainingProgress = 0
      let completedCourses = 0
      if (progressRes.status === 'fulfilled' && progressRes.value.ok) {
        const progressData = await progressRes.value.json()
        if (progressData.success) {
          // Calculate average progress
          const progresses = progressData.data || []
          trainingProgress = progresses.length > 0 
            ? progresses.reduce((acc: number, p: any) => acc + (p.progress_percentage || 0), 0) / progresses.length
            : 0
          completedCourses = progresses.filter((p: any) => p.progress_percentage === 100).length
        }
      }

      // Calculate task stats from farm plans (simplified)
      const totalTasks = farmPlans.reduce((acc, plan) => acc + (plan.duration_days || 0) * 3, 0) // Estimate 3 tasks per day
      const completedTasks = Math.floor(totalTasks * 0.65) // Estimated completion rate

      // Generate mock activity
      const recentActivity: ActivityItem[] = [
        {
          id: 1,
          type: 'task',
          title: 'Morning feed completed',
          description: 'Fed 114 chickens - Third Farm Plan',
          timestamp: '2 hours ago',
          status: 'completed'
        },
        {
          id: 2,
          type: 'training',
          title: 'Poultry Basics course progress',
          description: 'Completed lesson 3 of 12',
          timestamp: '1 day ago',
          status: 'completed'
        },
        {
          id: 3,
          type: 'task',
          title: 'Health check pending',
          description: 'Daily health monitoring due',
          timestamp: '3 hours ago',
          status: 'pending'
        },
        {
          id: 4,
          type: 'plan',
          title: 'New farm plan created',
          description: 'Presentation plan for 133 chickens',
          timestamp: '2 days ago',
          status: 'completed'
        }
      ]

      setStats({
        totalFarmPlans: farmPlans.length,
        activeFarmPlans: farmPlans.filter(p => p.status === 'active').length,
        totalTasks,
        completedTasks,
        todayTasks: 5, // Mock data
        overdueTasks: 2, // Mock data
        trainingProgress: Math.round(trainingProgress),
        completedCourses,
        forumPosts: 12, // Mock data
        recentActivity
      })

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'training': return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'forum': return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'plan': return <Target className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to Load Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              There was an issue loading your dashboard data.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your farm management overview for today
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>AI-Powered</span>
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeFarmPlans}</div>
                <div className="text-sm text-muted-foreground">Active Farm Plans</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.todayTasks}</div>
                <div className="text-sm text-muted-foreground">Today's Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completedCourses}</div>
                <div className="text-sm text-muted-foreground">Courses Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild className="h-auto p-4 justify-start">
          <Link href="/dashboard/tasks">
            <Calendar className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">View Tasks</div>
              <div className="text-xs opacity-80">Manage daily activities</div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-4 justify-start">
          <Link href="/dashboard/farm-planning">
            <Plus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">New Farm Plan</div>
              <div className="text-xs opacity-80">AI recommendations</div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-4 justify-start">
          <Link href="/dashboard/training">
            <BookOpen className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Training</div>
              <div className="text-xs opacity-80">Learn new skills</div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-4 justify-start">
          <Link href="/dashboard/forum">
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Community</div>
              <div className="text-xs opacity-80">Connect with farmers</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Plans Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Your Farm Plans</span>
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/farm-planning">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Active farming operations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPlans.length > 0 ? (
              <div className="space-y-4">
                {recentPlans.map((plan) => (
                  <div key={plan.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{plan.plan_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.nb_poulets_recommande} chickens • {plan.duration_days} days cycle
                        </p>
                      </div>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                    {plan.progress_percentage !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{plan.progress_percentage}%</span>
                        </div>
                        <Progress value={plan.progress_percentage} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Farm Plans Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first AI-powered farm plan
                </p>
                <Button asChild>
                  <Link href="/dashboard/farm-planning">
                    Create Farm Plan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Learning Progress</span>
            </CardTitle>
            <CardDescription>Your training journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.trainingProgress}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <Progress value={stats.trainingProgress} className="mt-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Courses Completed</span>
                <span className="font-medium">{stats.completedCourses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <span className="font-medium">2</span>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href="/dashboard/training">
                Continue Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Your latest farm activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                  {activity.status && (
                    <Badge 
                      variant={
                        activity.status === 'completed' ? 'default' : 
                        activity.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Overview</span>
            </CardTitle>
            <CardDescription>Key metrics and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.overdueTasks > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    {stats.overdueTasks} Overdue Tasks
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Some tasks need immediate attention
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Task Completion Rate</span>
                  <span>{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.completedTasks / stats.totalTasks) * 100} 
                  className="h-2" 
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Active Farm Plans</span>
                  <span>{stats.activeFarmPlans} of {stats.totalFarmPlans}</span>
                </div>
                <Progress 
                  value={(stats.activeFarmPlans / Math.max(stats.totalFarmPlans, 1)) * 100} 
                  className="h-2" 
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{stats.completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Tasks Done</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{stats.forumPosts}</div>
                  <div className="text-xs text-muted-foreground">Forum Posts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}