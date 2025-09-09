"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { trainingApi, type QuizQuestion } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface QuizComponentProps {
  courseId: number
  courseTitle: string
  onBack: () => void
  onComplete: (score: number, passed: boolean) => void
}

export function QuizComponent({ courseId, courseTitle, onBack, onComplete }: QuizComponentProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuizQuestions()
  }, [courseId])

  const fetchQuizQuestions = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await trainingApi.getQuizQuestions(courseId, token)
      
      if (response.success && response.data.questions) {
        setQuestions(response.data.questions)
        setAnswers(new Array(response.data.questions.length).fill(""))
      } else {
        throw new Error("No questions available for this course")
      }
    } catch (error) {
      console.error("Failed to fetch quiz questions:", error)
      setError(error instanceof Error ? error.message : "Failed to load quiz questions")
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value)
  }

  const handleNextQuestion = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    setSelectedAnswer("")

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuiz(newAnswers)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || "")
    }
  }

  const submitQuiz = async (finalAnswers: string[]) => {
    setSubmitting(true)
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      // Convert option indices to letters (0->A, 1->B, 2->C, 3->D)
      const letterAnswers = finalAnswers.map(answer => {
        if (answer === "") return "A" // Default to A for unanswered questions
        const optionIndex = parseInt(answer)
        return String.fromCharCode(65 + optionIndex) // 65 = 'A'
      })

      const response = await trainingApi.submitQuiz(courseId, letterAnswers, token)
      
      if (response.success) {
        setScore(response.data.quiz_score)
        setShowResults(true)
        
        // Complete the formation
        await trainingApi.completeFormation(
          courseId, 
          response.data.quiz_score, 
          "Completed via quiz", 
          token
        )
        
        toast({
          title: response.data.passed ? "Quiz Passed!" : "Quiz Failed",
          description: `You scored ${response.data.quiz_score}%. ${response.data.passed ? 'Congratulations!' : 'Please review the material and try again.'}`,
          variant: response.data.passed ? "default" : "destructive",
        })
        
        onComplete(response.data.quiz_score, response.data.passed)
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading quiz questions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Quiz Not Available</h3>
            <p className="text-muted-foreground mb-4">
              {error || "No quiz questions are available for this course."}
            </p>
            <Button onClick={onBack}>Back to Course</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results state
  if (showResults) {
    const passed = score >= 70
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </Button>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? "Congratulations!" : "Quiz Not Passed"}
            </CardTitle>
            <CardDescription>
              You completed the quiz for "{courseTitle}"
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <div className="text-4xl font-bold mb-2">
                {score}%
              </div>
              <Badge className={passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {passed ? "Passed" : "Failed"} (70% required)
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              You answered {Math.round((score / 100) * questions.length)} out of {questions.length} questions correctly
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack}>
                Back to Course
              </Button>
              {!passed && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQ = questions[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Course</span>
        </Button>
      </div>

      {/* Quiz Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Quiz: {courseTitle}</span>
            </CardTitle>
            <Badge variant="outline">
              {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Question {currentQuestion + 1}
          </CardTitle>
          <CardDescription className="text-base">
            {currentQ.question}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next"
          )}
        </Button>
      </div>
    </div>
  )
}