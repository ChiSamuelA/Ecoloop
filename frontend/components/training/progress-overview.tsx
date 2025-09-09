"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  Clock,
  CheckCircle2,
  Star
} from "lucide-react"
import { trainingApi, type UserProgress } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface ProgressOverviewProps {
  onViewCourse?: (courseId: number) => void
  onStartLearning?: () => void
}

export function ProgressOverview({ onViewCourse, onStartLearning }: ProgressOverviewProps) {
  const [progressData, setProgressData] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const response = await trainingApi.getUserProgress(token)
      if (response.success) {
        setProgressData(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch progress data:", error)
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Progress Data</h3>
        <p className="text-muted-foreground mb-4">
          Start learning to see your progress statistics
        </p>
        {onStartLearning && (
          <Button onClick={onStartLearning}>
            Start Learning
          </Button>
        )}
      </div>
    )
  }

  const { overall_statistics, category_progress, recent_activity } = progressData

  const getCompletionRate = () => {
    if (overall_statistics.total_formations === 0) return 0
    return Math.round((overall_statistics.completed_formations / overall_statistics.total_formations) * 100)
  }

  const getAchievementLevel = () => {
    const completed = overall_statistics.completed_formations
    if (completed >= 20) return { level: "Expert", color: "text-purple-600", icon: Trophy }
    if (completed >= 10) return { level: "Advanced", color: "text-blue-600", icon: Award }
    if (completed >= 5) return { level: "Intermediate", color: "text-green-600", icon: Target }
    if (completed >= 1) return { level: "Beginner", color: "text-orange-600", icon: Star }
    return { level: "New Learner", color: "text-gray-600", icon: BookOpen }
  }

  const achievement = getAchievementLevel()
  const AchievementIcon = achievement.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Learning Progress</h2>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall_statistics.total_formations}</div>
            <p className="text-xs text-muted-foreground">
              Available for learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overall_statistics.completed_formations}
            </div>
            <p className="text-xs text-muted-foreground">
              {getCompletionRate()}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(overall_statistics.avg_progress || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-500" />
              Avg Quiz Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(overall_statistics.avg_quiz_score || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Quiz performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievement Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AchievementIcon className={`h-5 w-5 ${achievement.color}`} />
              <span>Achievement Level</span>
            </CardTitle>
            <CardDescription>Your current learning status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${achievement.color} mb-2`}>
                {achievement.level}
              </div>
              <p className="text-sm text-muted-foreground">
                {overall_statistics.completed_formations} courses completed
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next level</span>
                <span>{overall_statistics.completed_formations % 5}/5</span>
              </div>
              <Progress 
                value={(overall_statistics.completed_formations % 5) * 20} 
                className="h-2" 
              />
            </div>

            {/* Achievement Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {overall_statistics.completed_formations >= 1 && (
                <Badge className="bg-orange-100 text-orange-800">First Course</Badge>
              )}
              {overall_statistics.completed_formations >= 5 && (
                <Badge className="bg-green-100 text-green-800">Learning Streak</Badge>
              )}
              {overall_statistics.avg_quiz_score >= 90 && (
                <Badge className="bg-purple-100 text-purple-800">High Achiever</Badge>
              )}
              {overall_statistics.completed_formations >= 10 && (
                <Badge className="bg-blue-100 text-blue-800">Knowledge Expert</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress by Category</CardTitle>
            <CardDescription>Your learning progress across different topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category_progress.map((category) => {
                const progressPercentage = category.total_formations > 0 
                  ? (category.completed_formations / category.total_formations) * 100 
                  : 0

                return (
                  <div key={category.categorie} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{category.categorie}</span>
                      <span className="text-muted-foreground">
                        {category.completed_formations}/{category.total_formations}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(progressPercentage)}% complete</span>
                      <span>Avg: {Math.round(category.avg_progress)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Learning Activity</span>
          </CardTitle>
          <CardDescription>Your latest course activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recent_activity.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.completed_at ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{activity.titre}</h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {activity.categorie}
                      </Badge>
                      <span>•</span>
                      <span>
                        Started {new Date(activity.started_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-medium">
                      {activity.progress_percentage}%
                    </div>
                    {activity.quiz_score !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Quiz: {activity.quiz_score}%
                      </div>
                    )}
                  </div>

                  {onViewCourse && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewCourse(index)} // You'll need to pass course ID here
                    >
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}