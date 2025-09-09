"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { type Category } from "@/lib/training"

interface CategoryFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  categories: Category[]
  totalResults: number
  showAdvanced?: boolean
  onClearAll?: () => void
}

export function CategoryFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  categories,
  totalResults,
  showAdvanced = true,
  onClearAll
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchTerm)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  const hasActiveFilters = () => {
    return searchTerm !== "" || selectedCategory !== "all" || statusFilter !== "all"
  }

  const clearAllFilters = () => {
    setLocalSearch("")
    onSearchChange("")
    onCategoryChange("all")
    onStatusChange("all")
    onClearAll?.()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'phases': 'bg-purple-100 text-purple-800 border-purple-200',
      'souches': 'bg-orange-100 text-orange-800 border-orange-200',
      'vaccins': 'bg-red-100 text-red-800 border-red-200',
      'alimentation': 'bg-green-100 text-green-800 border-green-200',
      'equipement': 'bg-blue-100 text-blue-800 border-blue-200',
      'sante': 'bg-pink-100 text-pink-800 border-pink-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'all': 'All Status',
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Courses</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {totalResults} course{totalResults !== 1 ? 's' : ''} found
            </span>
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1"
              >
                <span className="text-sm">Advanced</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title or description..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocalSearch("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.categorie} value={cat.categorie}>
                    <div className="flex items-center space-x-2">
                      <span className="capitalize">{cat.categorie}</span>
                      <Badge variant="outline" className="text-xs">
                        {cat.formation_count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters() && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Search: "{searchTerm}"</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setLocalSearch("")
                    onSearchChange("")
                  }}
                />
              </Badge>
            )}
            
            {selectedCategory !== "all" && (
              <Badge 
                className={`flex items-center space-x-1 ${getCategoryColor(selectedCategory)}`}
              >
                <span className="capitalize">{selectedCategory}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onCategoryChange("all")}
                />
              </Badge>
            )}
            
            {statusFilter !== "all" && (
              <Badge 
                className={`flex items-center space-x-1 ${getStatusColor(statusFilter)}`}
              >
                <span>{getStatusLabel(statusFilter)}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onStatusChange("all")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && isExpanded && (
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-medium text-sm">Categories Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.categorie}
                  variant={selectedCategory === cat.categorie ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(cat.categorie)}
                  className="justify-between"
                >
                  <span className="capitalize">{cat.categorie}</span>
                  <Badge variant="secondary" className="ml-2">
                    {cat.formation_count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Category Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {categories.reduce((sum, cat) => sum + cat.formation_count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Courses</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(categories.reduce((sum, cat) => sum + cat.avg_duration, 0) / categories.length) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Duration (min)</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}