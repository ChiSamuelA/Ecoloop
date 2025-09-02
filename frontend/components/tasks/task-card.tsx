"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/tasks"
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Camera, MoreHorizontal, Play, Pause } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onComplete?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStart?: (task: Task) => void
  onPause?: (task: Task) => void
}

function getCategoryIcon(category: Task["category"]) {
  switch (category) {
    case "feeding":
      return "🥗"
    case "cleaning":
      return "🧹"
    case "health":
      return "🏥"
    case "maintenance":
      return "🔧"
    case "monitoring":
      return "👁️"
    default:
      return "📋"
  }
}

function getPriorityColor(priority: Task["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getStatusColor(status: Task["status"]) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in-progress":
      return "bg-blue-100 text-blue-800"
    case "overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusIcon(status: Task["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "in-progress":
      return <Play className="h-4 w-4 text-blue-600" />
    case "overdue":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <Circle className="h-4 w-4 text-gray-600" />
  }
}

export function TaskCard({ task, onComplete, onEdit, onDelete, onStart, onPause }: TaskCardProps) {
  const dueDateTime = task.dueTime ? `${task.dueDate}T${task.dueTime}` : task.dueDate
  const isOverdue = task.status !== "completed" && new Date(dueDateTime) < new Date()

  return (
    <Card className={`${isOverdue ? "border-red-200 bg-red-50/50" : ""} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{getCategoryIcon(task.category)}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status === "pending" && onStart && (
                <DropdownMenuItem onClick={() => onStart(task)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Task
                </DropdownMenuItem>
              )}
              {task.status === "in-progress" && onPause && (
                <DropdownMenuItem onClick={() => onPause(task)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Task
                </DropdownMenuItem>
              )}
              {onEdit && <DropdownMenuItem onClick={() => onEdit(task)}>Edit Task</DropdownMenuItem>}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-600">
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(task.dueDate), "MMM d")}</span>
            </div>
            {task.dueTime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{task.dueTime}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{task.estimatedDuration}min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(task.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(task.status)}
                <span className="capitalize">{task.status.replace("-", " ")}</span>
              </div>
            </Badge>
            {task.photos && task.photos.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Camera className="h-3 w-3" />
                <span>{task.photos.length}</span>
              </Badge>
            )}
          </div>

          {task.status !== "completed" && onComplete && (
            <Button size="sm" onClick={() => onComplete(task)} className="bg-primary hover:bg-primary/90">
              Complete
            </Button>
          )}
        </div>

        {task.completedAt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Completed {format(new Date(task.completedAt), "MMM d 'at' h:mm a")}</span>
            </div>
            {task.notes && <p className="text-sm text-green-700 mt-2">{task.notes}</p>}
          </div>
        )}

        {task.recurring && (
          <div className="mt-3 text-xs text-muted-foreground">
            Repeats {task.recurring.frequency}
            {task.recurring.interval > 1 && ` every ${task.recurring.interval}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
