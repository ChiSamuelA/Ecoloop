"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle2, 
  Clock, 
  Camera, 
  AlertCircle, 
  Loader2, 
  Calendar,
  MessageSquare,
  Image
} from "lucide-react"
import { tasksApi, type DailyTask, type TodaysTasksResponse } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface TodaysTasksProps {
  farmPlanId: number
  onTaskComplete?: (taskId: number) => void
}

export function TodaysTasks({ farmPlanId, onTaskComplete }: TodaysTasksProps) {
  const [tasksData, setTasksData] = useState<TodaysTasksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingTask, setCompletingTask] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null)
  const [taskNotes, setTaskNotes] = useState("")
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTodaysTasks()
  }, [farmPlanId])

  const fetchTodaysTasks = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.getTodaysTasks(farmPlanId, token)
      if (response.success) {
        setTasksData(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch today's tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load today's tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: number, notes?: string) => {
    setCompletingTask(taskId)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      await tasksApi.completeTask(taskId, notes || "", token)
      
      toast({
        title: "Task Completed",
        description: "Task marked as completed successfully",
      })
      
      await fetchTodaysTasks() // Refresh tasks
      onTaskComplete?.(taskId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
    } finally {
      setCompletingTask(null)
      setSelectedTask(null)
      setTaskNotes("")
    }
  }

  const handlePhotoUpload = async (taskId: number, file: File) => {
    setUploadingPhoto(taskId)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      await tasksApi.uploadTaskPhoto(taskId, file, token)
      
      toast({
        title: "Photo Uploaded",
        description: "Task photo uploaded successfully",
      })
      
      await fetchTodaysTasks() // Refresh tasks to show photo
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(null)
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
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading today's tasks...</span>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!tasksData || tasksData.tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Tasks Today</h3>
          <p className="text-muted-foreground">
            You have no scheduled tasks for today. Great job staying on top of your farm management!
          </p>
        </CardContent>
      </Card>
    )
  }

  const completionPercentage = tasksData.total_tasks > 0 
    ? Math.round((tasksData.completed_tasks / tasksData.total_tasks) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Today's Tasks</span>
              </CardTitle>
              <CardDescription>
                {tasksData.farm_plan.plan_name} • {new Date(tasksData.date).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {tasksData.completed_tasks}/{tasksData.total_tasks}
              </div>
              <div className="text-sm text-muted-foreground">completed</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Task Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tasksData.total_tasks}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{tasksData.completed_tasks}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{tasksData.pending_tasks}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{tasksData.critical_tasks}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksData.tasks.map((task) => (
          <Card key={task.id} className={`${task.completed ? 'bg-green-50 border-green-200' : task.is_critical ? 'border-red-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getCategoryIcon(task.category)}</span>
                    <Badge className={getCategoryColor(task.category)}>
                      {task.category}
                    </Badge>
                    {task.is_critical && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Critical</span>
                      </Badge>
                    )}
                    {task.completed && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className={`text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.task_title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {task.task_description}
                  </CardDescription>
                  
                  {task.estimated_duration_minutes && (
                    <div className="flex items-center space-x-1 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{task.estimated_duration_minutes} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Task Photo */}
              {task.photo_url && (
                <div className="mb-4">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${task.photo_url}`}
                    alt="Task completion photo"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {/* Task Notes */}
              {task.notes && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Notes:</div>
                      <div className="text-sm text-muted-foreground">{task.notes}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!task.completed && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedTask(task)}
                    disabled={completingTask === task.id}
                    className="flex-1"
                  >
                    {completingTask === task.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                  
                  {/* Photo Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(task.id, file)
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingPhoto === task.id}
                    />
                    <Button
                      variant="outline"
                      disabled={uploadingPhoto === task.id}
                    >
                      {uploadingPhoto === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Completion Dialog */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Complete Task</CardTitle>
              <CardDescription>{selectedTask.task_title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this task completion..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTask(null)
                    setTaskNotes("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCompleteTask(selectedTask.id, taskNotes)}
                  disabled={completingTask === selectedTask.id}
                  className="flex-1"
                >
                  {completingTask === selectedTask.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Completing...
                    </>
                  ) : (
                    "Complete Task"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}