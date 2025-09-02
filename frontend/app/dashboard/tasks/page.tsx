"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskForm } from "@/components/tasks/task-form"
import { CompleteTaskDialog } from "@/components/tasks/complete-task-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Task, CreateTaskInput, CompleteTaskInput } from "@/lib/tasks"
import { mockTasks } from "@/lib/tasks"
import { Plus, Search, Calendar, CheckCircle, Clock, AlertCircle, Target } from "lucide-react"
import { isToday, isTomorrow } from "date-fns"

type ViewMode = "list" | "create" | "edit"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockTasks)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const { user } = useAuth()
  const { toast } = useToast()

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate)
        switch (dateFilter) {
          case "today":
            return isToday(taskDate)
          case "tomorrow":
            return isTomorrow(taskDate)
          case "overdue":
            return taskDate < today && task.status !== "completed"
          default:
            return true
        }
      })
    }

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, statusFilter, categoryFilter, dateFilter])

  const handleCreateTask = async (data: CreateTaskInput) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...data,
        status: "pending",
        assignedTo: user?.id,
      }

      setTasks((prev) => [...prev, newTask])
      setViewMode("list")
      toast({
        title: "Task Created",
        description: "Your new task has been added to the schedule.",
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Unable to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!editingTask) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...data,
              }
            : task,
        ),
      )

      setEditingTask(null)
      setViewMode("list")
      toast({
        title: "Task Updated",
        description: "Task details have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string, data: CompleteTaskInput) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
                completedBy: user?.id,
                notes: data.notes,
                // In real app, photos would be uploaded and URLs returned
                photos: data.photos
                  ? data.photos.map((_, index) => ({
                      id: `photo-${Date.now()}-${index}`,
                      url: `/placeholder.svg?height=200&width=300&query=task completion photo`,
                      uploadedAt: new Date().toISOString(),
                    }))
                  : undefined,
              }
            : task,
        ),
      )

      setCompletingTask(null)
      toast({
        title: "Task Completed",
        description: "Great job! Task has been marked as completed.",
      })
    } catch (error) {
      toast({
        title: "Completion Failed",
        description: "Unable to complete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "in-progress" as const } : t)))
    toast({
      title: "Task Started",
      description: `Started working on "${task.title}"`,
    })
  }

  const handlePauseTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "pending" as const } : t)))
    toast({
      title: "Task Paused",
      description: `Paused "${task.title}"`,
    })
  }

  const handleDeleteTask = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    toast({
      title: "Task Deleted",
      description: "Task has been removed from your schedule.",
    })
  }

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    today: tasks.filter((t) => isToday(new Date(t.dueDate))).length,
  }

  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setViewMode("list")}>
            ← Back to Tasks
          </Button>
        </div>
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setViewMode("list")} isLoading={isLoading} />
      </div>
    )
  }

  if (viewMode === "edit" && editingTask) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setViewMode("list")}>
            ← Back to Tasks
          </Button>
        </div>
        <TaskForm
          task={editingTask}
          onSubmit={handleUpdateTask}
          onCancel={() => setViewMode("list")}
          isLoading={isLoading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-2">Manage your daily farm activities and track progress</p>
        </div>
        <Button onClick={() => setViewMode("create")} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Due Today</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-primary">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="feeding">Feeding</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={(task) => setCompletingTask(task)}
            onEdit={(task) => {
              setEditingTask(task)
              setViewMode("edit")
            }}
            onDelete={handleDeleteTask}
            onStart={handleStartTask}
            onPause={handlePauseTask}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters to see more tasks."
                : "Get started by creating your first task."}
            </p>
            <Button onClick={() => setViewMode("create")} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Complete Task Dialog */}
      <CompleteTaskDialog
        task={completingTask}
        open={!!completingTask}
        onOpenChange={(open) => !open && setCompletingTask(null)}
        onComplete={handleCompleteTask}
        isLoading={isLoading}
      />
    </div>
  )
}
