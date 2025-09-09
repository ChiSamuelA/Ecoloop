"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, BookOpen, PlayCircle, CheckCircle2, Award, Users } from "lucide-react"
import { trainingApi, type Formation } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface CourseDetailProps {
  courseId: number
  onBack: () => void
  onStartQuiz: (courseId: number) => void
}

export function CourseDetail({ courseId, onBack, onStartQuiz }: CourseDetailProps) {
  const [course, setCourse] = useState<Formation | null>(null)
  const [relatedCourses, setRelatedCourses] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingProgress, setUpdatingProgress] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourseDetail()
  }, [courseId])

  const fetchCourseDetail = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await trainingApi.getFormation(courseId, token)
      if (response.success) {
        setCourse(response.data.formation)
        setRelatedCourses(response.data.related_formations)
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error)
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startCourse = async () => {
    if (!course) return
    
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      await trainingApi.startFormation(course.id, token)
      toast({
        title: "Course Started",
        description: "You can now begin learning!",
      })
      
      fetchCourseDetail() // Refresh to update status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start course",
        variant: "destructive",
      })
    }
  }

  const updateProgress = async (percentage: number) => {
    if (!course) return
    
    setUpdatingProgress(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      await trainingApi.updateProgress(course.id, percentage, "Progress updated via course view", token)
      
      toast({
        title: "Progress Updated",
        description: `Course progress set to ${percentage}%`,
      })
      
      fetchCourseDetail() // Refresh
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    } finally {
      setUpdatingProgress(false)
    }
  }

  const completeAndStartQuiz = () => {
    if (!course) return
    
    if (course.progress_percentage !== 100) {
      updateProgress(100).then(() => {
        onStartQuiz(course.id)
      })
    } else {
      onStartQuiz(course.id)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-32" />
        <div className="h-64 bg-gray-100 animate-pulse rounded" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Course not found</h3>
        <Button onClick={onBack}>Back to Catalog</Button>
      </div>
    )
  }

  const getStatusBadge = () => {
    switch (course.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><PlayCircle className="h-3 w-3 mr-1" />In Progress</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800"><BookOpen className="h-3 w-3 mr-1" />Not Started</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'phases': 'bg-purple-100 text-purple-800',
      'souches': 'bg-orange-100 text-orange-800',
      'vaccins': 'bg-red-100 text-red-800',
      'alimentation': 'bg-green-100 text-green-800',
      'equipement': 'bg-blue-100 text-blue-800',
      'sante': 'bg-pink-100 text-pink-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Button>
      </div>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge className={getCategoryColor(course.categorie)}>
                {course.categorie}
              </Badge>
              {getStatusBadge()}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {course.duree_minutes} minutes
            </div>
          </div>
          
          <CardTitle className="text-2xl">{course.titre}</CardTitle>
          <CardDescription className="text-base">{course.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Progress Section */}
          {course.status !== 'not_started' && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Course Progress</span>
                <span>{course.progress_percentage || 0}%</span>
              </div>
              <Progress value={course.progress_percentage || 0} className="h-2 mb-3" />
              
              {course.status === 'in_progress' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateProgress(25)}
                    disabled={updatingProgress}
                  >
                    25%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateProgress(50)}
                    disabled={updatingProgress}
                  >
                    50%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateProgress(75)}
                    disabled={updatingProgress}
                  >
                    75%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateProgress(100)}
                    disabled={updatingProgress}
                  >
                    100%
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {course.status === 'not_started' && (
              <Button onClick={startCourse} className="bg-primary">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            )}
            
            {course.status === 'in_progress' && (
              <Button onClick={completeAndStartQuiz} className="bg-primary">
                <Award className="h-4 w-4 mr-2" />
                Take Quiz
              </Button>
            )}
            
            {course.status === 'completed' && (
              <div className="flex gap-2">
                <Button onClick={() => onStartQuiz(course.id)} variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                {course.quiz_score && (
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    Quiz Score: {course.quiz_score}%
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          {course.contenu_text ? (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground">
                {course.contenu_text}
              </div>
            </div>
          ) : course.contenu_url ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">External content available</p>
              <Button 
                onClick={() => window.open(course.contenu_url, '_blank')}
                variant="outline"
              >
                Open Content
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Course content will be available soon</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Related Courses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedCourses.map((related) => (
                <div key={related.id} className="p-3 border border-border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">{related.titre}</h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {related.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {related.duree_minutes} min
                    </div>
                    <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                      View
                    </Button>
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