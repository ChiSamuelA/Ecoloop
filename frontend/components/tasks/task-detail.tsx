"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Edit3,
  Save,
  X,
  Loader2,
  MessageSquare,
  Image as ImageIcon
} from "lucide-react"
import { type DailyTask } from "@/lib/tasks"
import { tasksApi } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface TaskDetailProps {
  task: DailyTask
  onBack: () => void
  onTaskUpdate?: (updatedTask: DailyTask) => void
  onTaskComplete?: (taskId: number) => void
}

export function TaskDetail({ task, onBack, onTaskUpdate, onTaskComplete }: TaskDetailProps) {
  const [currentTask, setCurrentTask] = useState<DailyTask>(task)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(task.notes || "")
  const [completingTask, setCompletingTask] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [updatingNotes, setUpdatingNotes] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setCurrentTask(task)
    setNotesValue(task.notes || "")
  }, [task])

  const handleCompleteTask = async () => {
    setCompletingTask(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.completeTask(currentTask.id, notesValue, token)
      
      if (response.success) {
        const updatedTask = { ...currentTask, ...response.data.task }
        setCurrentTask(updatedTask)
        onTaskUpdate?.(updatedTask)
        onTaskComplete?.(currentTask.id)
        
        toast({
          title: "Task Completed",
          description: "Task marked as completed successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
    } finally {
      setCompletingTask(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.uploadTaskPhoto(currentTask.id, file, token)
      
      if (response.success) {
        const updatedTask = { ...currentTask, ...response.data.task }
        setCurrentTask(updatedTask)
        onTaskUpdate?.(updatedTask)
        
        toast({
          title: "Photo Uploaded",
          description: "Task photo uploaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleUpdateNotes = async () => {
    if (notesValue.trim() === (currentTask.notes || "").trim()) {
      setEditingNotes(false)
      return
    }

    setUpdatingNotes(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await tasksApi.updateTaskNotes(currentTask.id, notesValue, token)
      
      if (response.success) {
        const updatedTask = { ...currentTask, ...response.data.task }
        setCurrentTask(updatedTask)
        onTaskUpdate?.(updatedTask)
        setEditingNotes(false)
        
        toast({
          title: "Notes Updated",
          description: "Task notes updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notes",
        variant: "destructive",
      })
    } finally {
      setUpdatingNotes(false)
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tasks</span>
        </Button>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getCategoryIcon(currentTask.category)}</span>
                <Badge className={getCategoryColor(currentTask.category)}>
                  {currentTask.category}
                </Badge>
                {currentTask.is_critical && (
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Critical</span>
                  </Badge>
                )}
                {currentTask.completed && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              
              <CardTitle className={`text-2xl ${currentTask.completed ? 'line-through text-muted-foreground' : ''}`}>
                {currentTask.task_title}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {currentTask.task_description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Task Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Scheduled Date:</span>
              <span className="text-sm">{new Date(currentTask.scheduled_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Day Number:</span>
              <span className="text-sm">Day {currentTask.day_number}</span>
            </div>
            {currentTask.estimated_duration_minutes && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Duration:</span>
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{currentTask.estimated_duration_minutes} minutes</span>
                </div>
              </div>
            )}
            {currentTask.completion_date && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Completed:</span>
                <span className="text-sm text-green-600">{formatDateTime(currentTask.completion_date)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={currentTask.completed ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                {currentTask.completed ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Priority:</span>
              <Badge variant={currentTask.is_critical ? "destructive" : "secondary"}>
                {currentTask.is_critical ? "Critical" : "Normal"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Category:</span>
              <span className="text-sm capitalize">{currentTask.category}</span>
            </div>
            {currentTask.photo_url && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Documentation:</span>
                <div className="flex items-center space-x-1 text-sm">
                  <ImageIcon className="h-4 w-4" />
                  <span>Photo attached</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Photo */}
      {currentTask.photo_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Task Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentTask.photo_url}`}
                alt="Task completion photo"
                className="max-w-full h-auto max-h-96 rounded-lg border shadow-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Notes</span>
            </CardTitle>
            {!currentTask.completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingNotes(!editingNotes)}
              >
                {editingNotes ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Task Notes</Label>
                <Textarea
                  id="notes"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add notes about this task..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateNotes}
                  disabled={updatingNotes}
                  size="sm"
                >
                  {updatingNotes ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingNotes(false)
                    setNotesValue(currentTask.notes || "")
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {currentTask.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {currentTask.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No notes added yet. {!currentTask.completed && "Click edit to add notes."}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {!currentTask.completed && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage this task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Complete Task */}
              <Button
                onClick={handleCompleteTask}
                disabled={completingTask}
                className="flex-1"
              >
                {completingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>

              {/* Photo Upload */}
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(file)
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingPhoto}
                />
                <Button
                  variant="outline"
                  disabled={uploadingPhoto}
                  className="w-full"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      {currentTask.photo_url ? "Update Photo" : "Add Photo"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}