"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, PlayCircle, CheckCircle2, Award } from "lucide-react"
import type { Formation } from "@/lib/training"

interface CourseCardProps {
  course: Formation
  onStart: (courseId: number) => void
  onContinue: (courseId: number) => void
  onView: (courseId: number) => void
}

export function CourseCard({ course, onStart, onContinue, onView }: CourseCardProps) {
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

  const getActionButton = () => {
    switch (course.status) {
      case 'completed':
        return (
          <Button variant="outline" onClick={() => onView(course.id)} className="w-full">
            <Award className="h-4 w-4 mr-2" />
            Review Course
          </Button>
        )
      case 'in_progress':
        return (
          <Button onClick={() => onContinue(course.id)} className="w-full bg-primary">
            <PlayCircle className="h-4 w-4 mr-2" />
            Continue Learning
          </Button>
        )
      default:
        return (
          <Button onClick={() => onStart(course.id)} className="w-full bg-primary">
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Course
          </Button>
        )
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
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getCategoryColor(course.categorie)}>
            {course.categorie}
          </Badge>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-lg line-clamp-2">{course.titre}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{course.duree_minutes} minutes</span>
          </div>
          
          {course.status === 'in_progress' && course.progress_percentage !== undefined && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{course.progress_percentage}%</span>
              </div>
              <Progress value={course.progress_percentage} className="h-2" />
            </div>
          )}
          
          {course.status === 'completed' && course.quiz_score !== undefined && (
            <div className="flex items-center text-sm text-green-600">
              <Award className="h-4 w-4 mr-2" />
              <span>Quiz Score: {course.quiz_score}%</span>
            </div>
          )}
        </div>
        
        {getActionButton()}
      </CardContent>
    </Card>
  )
}