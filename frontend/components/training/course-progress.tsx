"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  PlayCircle, 
  RotateCcw,
  Save,
  Target,
  BarChart3,
  MessageSquare
} from "lucide-react"
import { trainingApi, type Formation } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface CourseProgressProps {
  courseId: number
  course?: Formation
  onProgressUpdate?: (newProgress: number) => void
  onComplete?: () => void
  showTimeline?: boolean
  allowManualUpdate?: boolean
}

interface ProgressEntry {
  date: string
  percentage: number
  notes?: string
  action: 'started' | 'progress_update' | 'completed' | 'quiz_taken'
}

export function CourseProgress({ 
  courseId, 
  course,
  onProgressUpdate,
  onComplete,
  showTimeline = true,
  allowManualUpdate = true
}: CourseProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(course?.progress_percentage || 0)
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([])
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (course) {
      setCurrentProgress(course.progress_percentage || 0)
      generateProgressHistory()
    }
  }, [course])

  const generateProgressHistory = () => {
    // Mock progress history - in real app, this would come from backend
    const history: ProgressEntry[] = []
    
    if (course?.started_at) {
      history.push({
        date: course.started_at,
        percentage: 0,
        notes: "Course started",
        action: 'started'
      })
    }

    // Add some mock progress updates
    if (course?.progress_percentage && course.progress_percentage > 0) {
      history.push({
        date: new Date().toISOString(),
        percentage: course.progress_percentage,
        notes: "Progress updated",
        action: 'progress_update'
      })
    }

    if (course?.completed_at) {
      history.push({
        date: course.completed_at,
        percentage: 100,
        notes: course.quiz_score ? `Completed with quiz score: ${course.quiz_score}%` : "Course completed",
        action: 'completed'
      })
    }

    setProgressHistory(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const updateProgress = async (percentage: number, customNotes?: string) => {
    setIsUpdating(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const progressNotes = customNotes || notes || `Progress updated to ${percentage}%`
      
      await trainingApi.updateProgress(courseId, percentage, progressNotes, token)
      
      setCurrentProgress(percentage)
      onProgressUpdate?.(percentage)
      setNotes("")
      
      // Add to history
      const newEntry: ProgressEntry = {
        date: new Date().toISOString(),
        percentage,
        notes: progressNotes,
        action: 'progress_update'
      }
      setProgressHistory(prev => [newEntry, ...prev])
      
      toast({
        title: "Progress Updated",
        description: `Course progress set to ${percentage}%`,
      })

      if (percentage === 100 && onComplete) {
        onComplete()
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const resetProgress = async () => {
    await updateProgress(0, "Progress reset")
  }

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 50) return "text-orange-600"
    if (percentage >= 25) return "text-yellow-600"
    return "text-gray-600"
  }

  const getProgressBadge = (percentage: number) => {
    if (percentage === 100) return { label: "Completed", color: "bg-green-100 text-green-800" }
    if (percentage >= 75) return { label: "Almost Done", color: "bg-blue-100 text-blue-800" }
    if (percentage >= 50) return { label: "Halfway", color: "bg-orange-100 text-orange-800" }
    if (percentage >= 25) return { label: "Getting Started", color: "bg-yellow-100 text-yellow-800" }
    if (percentage > 0) return { label: "Just Started", color: "bg-gray-100 text-gray-800" }
    return { label: "Not Started", color: "bg-gray-100 text-gray-800" }
  }

  const getTimeEstimate = () => {
    if (!course?.duree_minutes) return null
    
    const remainingPercentage = (100 - currentProgress) / 100
    const remainingMinutes = Math.round(course.duree_minutes * remainingPercentage)
    
    if (remainingMinutes === 0) return "Complete!"
    if (remainingMinutes < 60) return `~${remainingMinutes} min remaining`
    
    const hours = Math.floor(remainingMinutes / 60)
    const mins = remainingMinutes % 60
    return `~${hours}h ${mins}m remaining`
  }

  const progressBadge = getProgressBadge(currentProgress)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-100 animate-pulse rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Course Progress</span>
            </div>
            <Badge className={progressBadge.color}>
              {progressBadge.label}
            </Badge>
          </CardTitle>
          <CardDescription>
            Track your learning progress and milestones
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Visualization */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className={`text-2xl font-bold ${getProgressColor(currentProgress)}`}>
                {currentProgress}%
              </span>
            </div>
            <Progress value={currentProgress} className="h-3" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Started</span>
              <span>In Progress</span>
              <span>Completed</span>
            </div>
          </div>

          {/* Time Estimate */}
          {course?.duree_minutes && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{getTimeEstimate()}</span>
            </div>
          )}

          {/* Quick Progress Actions */}
          {allowManualUpdate && currentProgress < 100 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Progress Update</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateProgress(25)}
                  disabled={isUpdating || currentProgress >= 25}
                >
                  25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateProgress(50)}
                  disabled={isUpdating || currentProgress >= 50}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateProgress(75)}
                  disabled={isUpdating || currentProgress >= 75}
                >
                  75%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateProgress(100)}
                  disabled={isUpdating}
                >
                  Complete
                </Button>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {allowManualUpdate && (
            <div className="space-y-2">
              <Label htmlFor="progress-notes">Add Progress Notes (Optional)</Label>
              <Textarea
                id="progress-notes"
                placeholder="Add notes about your progress, challenges, or insights..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => updateProgress(currentProgress, notes)}
                  disabled={isUpdating || !notes.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
                {currentProgress > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetProgress}
                    disabled={isUpdating}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progress Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {progressHistory.filter(p => p.action === 'progress_update').length}
              </div>
              <div className="text-sm text-muted-foreground">Updates Made</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {course?.started_at ? Math.ceil((Date.now() - new Date(course.started_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Days Since Start</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {course?.quiz_score || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Quiz Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      {showTimeline && progressHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Progress Timeline</span>
            </CardTitle>
            <CardDescription>
              Your learning journey for this course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressHistory.map((entry, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {entry.action === 'started' && <PlayCircle className="h-5 w-5 text-blue-500" />}
                    {entry.action === 'progress_update' && <TrendingUp className="h-5 w-5 text-orange-500" />}
                    {entry.action === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {entry.action === 'quiz_taken' && <Target className="h-5 w-5 text-purple-500" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        Progress: {entry.percentage}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {entry.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                    </div>
                    
                    {entry.notes && (
                      <div className="flex items-start space-x-2 mt-2 p-2 bg-muted rounded">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm text-muted-foreground">{entry.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}