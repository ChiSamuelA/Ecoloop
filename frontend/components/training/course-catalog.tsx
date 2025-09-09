"use client"

import { useState, useEffect } from "react"
import { CourseCard } from "./course-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, BookOpen, Trophy, TrendingUp } from "lucide-react"
import { trainingApi, type Formation, type Category } from "@/lib/training"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface CourseCatalogProps {
  onSelectCourse: (courseId: number) => void
}

export function CourseCatalog({ onSelectCourse }: CourseCatalogProps) {
  const [courses, setCourses] = useState<Formation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [statistics, setStatistics] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, selectedCategory, statusFilter])

  const fetchData = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      const [coursesResponse, categoriesResponse] = await Promise.all([
        trainingApi.getFormations(token),
        trainingApi.getCategories(token)
      ])

      if (coursesResponse.success) {
        setCourses(coursesResponse.data.formations)
        setStatistics(coursesResponse.data.statistics)
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch training data:", error)
      toast({
        title: "Error",
        description: "Failed to load training courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.categorie === selectedCategory)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    setFilteredCourses(filtered)
  }

  const handleStartCourse = async (courseId: number) => {
    try {
      const token = tokenStorage.get()
      if (!token) throw new Error("Authentication required")

      await trainingApi.startFormation(courseId, token)
      toast({
        title: "Course Started",
        description: "You can now begin learning!",
      })
      
      onSelectCourse(courseId)
      fetchData() // Refresh to update status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start course",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_formations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.completed_formations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.in_progress || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overall_progress_percentage || 0}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.categorie} value={cat.categorie}>
                  {cat.categorie} ({cat.formation_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onStart={handleStartCourse}
              onContinue={onSelectCourse}
              onView={onSelectCourse}
            />
          ))}
        </div>
      )}
    </div>
  )
}