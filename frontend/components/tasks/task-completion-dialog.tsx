"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Camera, 
  AlertCircle, 
  Loader2,
  Clock,
  MessageSquare
} from "lucide-react"
import { type DailyTask } from "@/lib/tasks"
import { tasksApi } from "@/lib/tasks"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface TaskCompletionDialogProps {
  open: boolean
  onClose: () => void
  task: DailyTask | null
  onTaskComplete?: (taskId: number) => void
}

export function TaskCompletionDialog({ 
  open, 
  onClose, 
  task, 
  onTaskComplete 
}: TaskCompletionDialogProps) {
  const [notes, setNotes] = useState("")
  const [completingTask, setCompletingTask] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleClose = () => {
    setNotes("")
    setPhotoFile(null)
    setPhotoPreview(null)
    onClose()
  }

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoUpload = async (taskId: number) => {
    if (!photoFile) return

    setUploadingPhoto(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      await tasksApi.uploadTaskPhoto(taskId, photoFile, token)
      
      toast({
        title: "Photo Uploaded",
        description: "Task photo uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo",
        variant: "destructive",
      })
      throw error // Re-throw to handle in complete function
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!task) return

    setCompletingTask(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      // Upload photo first if selected
      if (photoFile) {
        await handlePhotoUpload(task.id)
      }

      // Complete the task
      await tasksApi.completeTask(task.id, notes, token)
      
      toast({
        title: "Task Completed",
        description: "Task marked as completed successfully",
      })
      
      onTaskComplete?.(task.id)
      handleClose()
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

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Complete Task</span>
          </DialogTitle>
          <DialogDescription>
            Mark this task as completed and add any notes or photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getCategoryIcon(task.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getCategoryColor(task.category)}>
                    {task.category}
                  </Badge>
                  {task.is_critical && (
                    <Badge variant="destructive" className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Critical</span>
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{task.task_title}</h3>
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

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="completion-notes" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Completion Notes (Optional)</span>
            </Label>
            <Textarea
              id="completion-notes"
              placeholder="Add any notes about task completion, observations, or issues..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Photo Section */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Add Photo (Optional)</span>
            </Label>
            
            {photoPreview ? (
              <div className="space-y-2">
                <img 
                  src={photoPreview}
                  alt="Task completion preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                >
                  Remove Photo
                </Button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoSelect(file)
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={completingTask}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTask}
              disabled={completingTask || uploadingPhoto}
              className="flex-1"
            >
              {completingTask ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {uploadingPhoto ? "Uploading..." : "Completing..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}