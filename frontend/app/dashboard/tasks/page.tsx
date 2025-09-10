"use client"

import { useState, useEffect } from "react"
import { TaskDashboard } from "@/components/tasks/task-dashboard"
import { TodaysTasks } from "@/components/tasks/todays-tasks"
import { TaskDetail } from "@/components/tasks/task-detail"
import { TaskCalendar } from "@/components/tasks/task-calendar"
import { TaskStatistics } from "@/components/tasks/task-statistics"
import { TaskCompletionDialog } from "@/components/tasks/task-completion-dialog"
import { UpcomingTasks } from "@/components/tasks/upcoming-tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { tasksApi, type DailyTask } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { 
  ArrowLeft, 
  CheckSquare, 
  Calendar, 
  BarChart3,
  Clock,
  Plus,
  Target,
  AlertTriangle,
  Loader2,
  ListChecks,
  TrendingUp
} from "lucide-react"

type ViewState = "intro" | "dashboard" | "today" | "calendar" | "statistics" | "detail"

interface FarmPlan {
  id: number
  plan_name: string
  status: string
  duration_days: number
  nb_poulets_recommande: number
}

export default function TasksPage() {
  const [view, setView] = useState<ViewState>("intro")
  const [selectedFarmPlan, setSelectedFarmPlan] = useState<FarmPlan | null>(null)
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null)
  const [farmPlans, setFarmPlans] = useState<FarmPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [hasExistingTasks, setHasExistingTasks] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<DailyTask | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchFarmPlans()
  }, [])

  useEffect(() => {
    if (selectedFarmPlan) {
      checkForExistingTasks()
    }
  }, [selectedFarmPlan])

  const fetchFarmPlans = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/farm-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      })
  
      if (!response.ok) throw new Error("Failed to fetch farm plans")
      
      const data = await response.json()
      console.log("API Response:", data) // Debug log
      
      // Ensure we always have an array
      let plansArray: FarmPlan[] = []
      
      if (Array.isArray(data)) {
        plansArray = data
      } else if (data && Array.isArray(data.data)) {
        plansArray = data.data
      } else if (data && data.success && Array.isArray(data.data)) {
        plansArray = data.data
      }
      
      setFarmPlans(plansArray)
  
      // Auto-select first active plan if available
      if (plansArray.length > 0) {
        const activePlans = plansArray.filter((plan: FarmPlan) => plan.status === 'active')
        if (activePlans.length > 0) {
          setSelectedFarmPlan(activePlans[0])
        } else {
          // If no active plans, select the first one
          setSelectedFarmPlan(plansArray[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch farm plans:", error)
      // Ensure farmPlans is still an array even on error
      setFarmPlans([])
      toast({
        title: "Error",
        description: "Failed to load farm plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkForExistingTasks = async () => {
    if (!selectedFarmPlan) return

    try {
      const token = tokenStorage.get()
      if (!token) return

      const hasValidTasks = await tasksApi.checkTasksExist(selectedFarmPlan.id, token)
      setHasExistingTasks(hasValidTasks)
    } catch (error) {
      console.error("Failed to check tasks:", error)
      setHasExistingTasks(false)
    }
  }

  const handleFarmPlanChange = (planId: string) => {
    const plan = farmPlans.find(p => p.id.toString() === planId)
    setSelectedFarmPlan(plan || null)
    // Reset view to intro when changing plans
    if (view !== "intro") {
      setView("intro")
    }
  }

  const handleTaskSelect = (task: DailyTask) => {
    setSelectedTask(task)
    setView("detail")
  }

  const handleTaskComplete = (task: DailyTask) => {
    setTaskToComplete(task)
    setShowCompletionDialog(true)
  }

  const handleTaskCompleted = (taskId: number) => {
    // Refresh current view if needed
    checkForExistingTasks()
    toast({
      title: "Task Completed",
      description: "Task has been marked as completed",
    })
  }

  const handleBackToIntro = () => {
    setView("intro")
    setSelectedTask(null)
  }

  const handleViewDashboard = () => setView("dashboard")
  const handleViewTodaysTasks = () => setView("today")
  const handleViewCalendar = () => setView("calendar")
  const handleViewStatistics = () => setView("statistics")

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading farm plans...</span>
        </div>
      </div>
    )
  }

  // No farm plans available
  if (farmPlans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your daily farming tasks and track progress.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 via-background to-blue-100 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Plus className="h-12 w-12 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Create Your First Farm Plan</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You need a farm plan before you can manage tasks. Create one to get AI-powered 
                  daily task recommendations for your poultry farm.
                </p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/farm-planning'}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Farm Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Farm plan selection
  if (!selectedFarmPlan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-2">
            Select a farm plan to manage your daily tasks.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Farm Plan</CardTitle>
            <CardDescription>Choose which farm plan you want to manage tasks for</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleFarmPlanChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a farm plan" />
              </SelectTrigger>
              <SelectContent>
                {farmPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{plan.plan_name}</span>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Task Detail View
  if (view === "detail" && selectedTask) {
    return (
      <div className="space-y-6">
        <TaskDetail
          task={selectedTask}
          onBack={handleBackToIntro}
          onTaskUpdate={(updatedTask) => {
            setSelectedTask(updatedTask)
            checkForExistingTasks()
          }}
          onTaskComplete={handleTaskCompleted}
        />
      </div>
    )
  }

  // Dashboard View
  if (view === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Task Dashboard</h2>
              <p className="text-muted-foreground">{selectedFarmPlan.plan_name}</p>
            </div>
          </div>
          <Select value={selectedFarmPlan.id.toString()} onValueChange={handleFarmPlanChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {farmPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TaskDashboard
          farmPlanId={selectedFarmPlan.id}
          farmPlanName={selectedFarmPlan.plan_name}
          onViewTodaysTasks={handleViewTodaysTasks}
          onViewAllTasks={handleViewCalendar}
          onViewStatistics={handleViewStatistics}
          onGenerateTasks={checkForExistingTasks}
        />
      </div>
    )
  }

  // Today's Tasks View
  if (view === "today") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Today's Tasks</h2>
              <p className="text-muted-foreground">{selectedFarmPlan.plan_name}</p>
            </div>
          </div>
          <Select value={selectedFarmPlan.id.toString()} onValueChange={handleFarmPlanChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {farmPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TodaysTasks
          farmPlanId={selectedFarmPlan.id}
          onTaskComplete={handleTaskCompleted}
        />
      </div>
    )
  }

  // Calendar View
  if (view === "calendar") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Task Calendar</h2>
              <p className="text-muted-foreground">{selectedFarmPlan.plan_name}</p>
            </div>
          </div>
          <Select value={selectedFarmPlan.id.toString()} onValueChange={handleFarmPlanChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {farmPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TaskCalendar
          farmPlanId={selectedFarmPlan.id}
          onTaskSelect={handleTaskSelect}
        />
      </div>
    )
  }

  // Statistics View
  if (view === "statistics") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Task Statistics</h2>
              <p className="text-muted-foreground">{selectedFarmPlan.plan_name}</p>
            </div>
          </div>
          <Select value={selectedFarmPlan.id.toString()} onValueChange={handleFarmPlanChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {farmPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TaskStatistics
          farmPlanId={selectedFarmPlan.id}
          farmPlanName={selectedFarmPlan.plan_name}
        />
      </div>
    )
  }

  // Intro View (Default)
  return (
    <div className="space-y-8">
      {/* Header with farm plan selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your daily farming tasks and track progress for optimal poultry farm operations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Current Plan:</span>
          <Select value={selectedFarmPlan.id.toString()} onValueChange={handleFarmPlanChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {farmPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Farm Plan Info */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{selectedFarmPlan.plan_name}</h3>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={selectedFarmPlan.status === 'active' ? 'default' : 'secondary'}>
                  {selectedFarmPlan.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedFarmPlan.duration_days} days cycle
                </span>
                <span className="text-sm text-muted-foreground">
                  {selectedFarmPlan.nb_poulets_recommande} chickens
                </span>
              </div>
            </div>
            <Target className="h-12 w-12 text-primary/60" />
          </div>
        </CardContent>
      </Card>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dashboard */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDashboard}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <CheckSquare className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-bold text-lg mb-2">Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Overview and quick actions for your farm tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewTodaysTasks}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Clock className="h-10 w-10 text-orange-600" />
              <div>
                <h3 className="font-bold text-lg mb-2">Today's Tasks</h3>
                <p className="text-muted-foreground text-sm">
                  Focus on tasks scheduled for today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewCalendar}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Calendar className="h-10 w-10 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg mb-2">Calendar</h3>
                <p className="text-muted-foreground text-sm">
                  View all tasks in calendar format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewStatistics}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <BarChart3 className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="font-bold text-lg mb-2">Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Track performance and progress insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Preview Widgets */}
      {hasExistingTasks && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingTasks
            farmPlanId={selectedFarmPlan.id}
            onTaskSelect={handleTaskSelect}
            onViewAllTasks={handleViewCalendar}
            maxTasks={5}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common task management actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleViewTodaysTasks} className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                View Today's Tasks
              </Button>
              <Button onClick={handleViewCalendar} variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Open Calendar View
              </Button>
              <Button onClick={handleViewStatistics} variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Performance
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <span>AI-Generated Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automatically generated daily tasks based on your farm plan, 
              experience level, and poultry farming best practices.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Progress Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Monitor completion rates, track overdue tasks, and analyze 
              your farming performance with detailed statistics.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Critical Task Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Priority-based task management with alerts for critical 
              activities that affect chicken health and farm productivity.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Task Completion Dialog */}
      <TaskCompletionDialog
        open={showCompletionDialog}
        onClose={() => {
          setShowCompletionDialog(false)
          setTaskToComplete(null)
        }}
        task={taskToComplete}
        onTaskComplete={handleTaskCompleted}
      />
    </div>
  )
}