"use client"

import { useState } from "react"
import { CourseCatalog } from "@/components/training/course-catalog"
import { CourseDetail } from "@/components/training/course-detail"
import { QuizComponent } from "@/components/training/quiz-component"
import { ProgressOverview } from "@/components/training/progress-overview"
import { CourseProgress } from "@/components/training/course-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { trainingApi, type Formation } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Brain,
  Target,
  Users,
  Clock
} from "lucide-react"

type ViewState = "intro" | "catalog" | "detail" | "quiz" | "progress-overview" | "course-progress"

export default function TrainingPage() {
  const [view, setView] = useState<ViewState>("intro")
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Formation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleViewCatalog = () => {
    setView("catalog")
  }

  const handleViewProgress = () => {
    setView("progress-overview")
  }

  const handleSelectCourse = async (courseId: number) => {
    setIsLoading(true)
    setSelectedCourseId(courseId)
    
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await trainingApi.getFormation(courseId, token)
      if (response.success) {
        setSelectedCourse(response.data.formation)
        setView("detail")
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error)
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = (courseId: number) => {
    setSelectedCourseId(courseId)
    setView("quiz")
  }

  const handleQuizComplete = (score: number, passed: boolean) => {
    toast({
      title: passed ? "Quiz Passed!" : "Quiz Failed",
      description: `You scored ${score}%. ${passed ? 'Course completed successfully!' : 'Please review the material and try again.'}`,
      variant: passed ? "default" : "destructive",
    })
    
    // Return to course detail to show updated status
    if (selectedCourseId) {
      handleSelectCourse(selectedCourseId)
    }
  }

  const handleViewCourseProgress = () => {
    if (selectedCourse) {
      setView("course-progress")
    }
  }

  const handleProgressUpdate = async (newProgress: number) => {
    // Refresh course data to show updated progress
    if (selectedCourseId) {
      try {
        const token = tokenStorage.get()
        if (!token) return

        const response = await trainingApi.getFormation(selectedCourseId, token)
        if (response.success) {
          setSelectedCourse(response.data.formation)
        }
      } catch (error) {
        console.error("Failed to refresh course data:", error)
      }
    }
  }

  const handleBackToIntro = () => {
    setView("intro")
    setSelectedCourseId(null)
    setSelectedCourse(null)
  }

  const handleBackToCatalog = () => {
    setView("catalog")
  }

  const handleBackToCourse = () => {
    if (selectedCourse) {
      setView("detail")
    } else {
      setView("catalog")
    }
  }

  // View: Course Progress
  if (view === "course-progress" && selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToCourse} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </Button>
        </div>
        <CourseProgress
          courseId={selectedCourse.id}
          course={selectedCourse}
          onProgressUpdate={handleProgressUpdate}
          onComplete={() => {
            toast({
              title: "Course Completed!",
              description: "Congratulations on completing the course!",
            })
            handleBackToCourse()
          }}
        />
      </div>
    )
  }

  // View: Quiz
  if (view === "quiz" && selectedCourseId && selectedCourse) {
    return (
      <div className="space-y-6">
        <QuizComponent
          courseId={selectedCourseId}
          courseTitle={selectedCourse.titre}
          onBack={handleBackToCourse}
          onComplete={handleQuizComplete}
        />
      </div>
    )
  }

  // View: Course Detail
  if (view === "detail" && selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToCatalog} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Catalog</span>
          </Button>
          {selectedCourse.status !== 'not_started' && (
            <Button variant="outline" onClick={handleViewCourseProgress} className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>View Progress</span>
            </Button>
          )}
        </div>
        <CourseDetail
          courseId={selectedCourse.id}
          onBack={handleBackToCatalog}
          onStartQuiz={handleStartQuiz}
        />
      </div>
    )
  }

  // View: Course Catalog
  if (view === "catalog") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <CourseCatalog onSelectCourse={handleSelectCourse} />
      </div>
    )
  }

  // View: Progress Overview
  if (view === "progress-overview") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <ProgressOverview
          onViewCourse={handleSelectCourse}
          onStartLearning={handleViewCatalog}
        />
      </div>
    )
  }

  // View: Intro (Default)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Training Center</h1>
        <p className="text-muted-foreground mt-2">
          Master poultry farming with our comprehensive training modules covering all aspects of successful farming.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-muted-foreground">Courses Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">1,200+</div>
                <div className="text-sm text-muted-foreground">Farmers Trained</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">12hrs</div>
                <div className="text-sm text-muted-foreground">Total Content</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browse Courses */}
        <Card className="bg-gradient-to-br from-blue-50 via-background to-blue-100 border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewCatalog}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Browse Training Courses</h3>
                <p className="text-muted-foreground mb-4">
                  Explore our comprehensive library of poultry farming courses covering phases, breeds, vaccines, nutrition, and equipment.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start Learning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Progress */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewProgress}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">View Learning Progress</h3>
                <p className="text-muted-foreground mb-4">
                  Track your learning journey, view achievements, and see detailed progress across all training modules.
                </p>
                <Button variant="outline">
                  View Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Structured Learning</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Follow carefully designed learning paths from basic poultry farming concepts to advanced techniques and disease management.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Certified Knowledge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Complete quizzes and assessments to validate your understanding and earn certificates for each completed module.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Expert Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Learn from experienced poultry farmers and veterinarians with content tailored specifically for Cameroon's farming conditions.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Learning Categories Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Training Categories</CardTitle>
          <CardDescription>
            Comprehensive training across all aspects of poultry farming
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-800 mb-1">Phases d'élevage</h4>
              <p className="text-sm text-purple-600">Growth stages and management</p>
            </div>
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-1">Souches de poussins</h4>
              <p className="text-sm text-orange-600">Breed selection and characteristics</p>
            </div>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-1">Programmes de vaccination</h4>
              <p className="text-sm text-red-600">Health and disease prevention</p>
            </div>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-1">Alimentation</h4>
              <p className="text-sm text-green-600">Nutrition and feeding strategies</p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-1">Équipements</h4>
              <p className="text-sm text-blue-600">Tools and infrastructure</p>
            </div>
            <div className="p-4 border border-pink-200 rounded-lg bg-pink-50">
              <h4 className="font-medium text-pink-800 mb-1">Santé avicole</h4>
              <p className="text-sm text-pink-600">Health monitoring and care</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}