"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, CheckCircle2, XCircle } from "lucide-react"
import { trainingApi } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface QuizComponentProps {
  courseId: number
  courseTitle: string
  onBack: () => void
  onComplete: (score: number, passed: boolean) => void
}

// Sample quiz questions - in a real app, these would come from the backend
const sampleQuestions = [
  {
    question: "Quelle est la température optimale pour les poussins pendant la première semaine?",
    options: ["25-27°C", "32-34°C", "28-30°C", "35-37°C"],
    correct: 1
  },
  {
    question: "Combien de fois par jour faut-il nourrir les poulets de chair?",
    options: ["1 fois", "2 fois", "3 fois", "4 fois"],
    correct: 2
  },
  {
    question: "Quel est le taux de protéines recommandé pour l'aliment démarrage?",
    options: ["16-18%", "20-22%", "14-16%", "24-26%"],
    correct: 1
  },
  {
    question: "À quel âge peut-on commencer la vaccination des poulets?",
    options: ["Dès l'éclosion", "1 semaine", "2 semaines", "1 mois"],
    correct: 0
  },
  {
    question: "Quelle est la densité optimale pour des poulets de chair?",
    options: ["5-7 poulets/m²", "8-10 poulets/m²", "12-15 poulets/m²", "15-20 poulets/m²"],
    correct: 1
  }
]

export function QuizComponent({ courseId, courseTitle, onBack, onComplete }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value)
  }

  const handleNextQuestion = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    setSelectedAnswer("")

    if (currentQuestion < sampleQuestions.length - 1) {
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

      const response = await trainingApi.submitQuiz(courseId, finalAnswers, token)
      
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

  const calculateLocalScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (parseInt(answer) === sampleQuestions[index].correct) {
        correct++
      }
    })
    return Math.round((correct / sampleQuestions.length) * 100)
  }

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
              You answered {Math.round(score / 20)} out of {sampleQuestions.length} questions correctly
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

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100

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
              {currentQuestion + 1} of {sampleQuestions.length}
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
            {sampleQuestions[currentQuestion].question}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {sampleQuestions[currentQuestion].options.map((option, index) => (
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
          {submitting ? "Submitting..." : 
           currentQuestion === sampleQuestions.length - 1 ? "Submit Quiz" : "Next"}
        </Button>
      </div>
    </div>
  )
}