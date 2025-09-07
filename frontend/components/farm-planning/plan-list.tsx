"use client"

import { useState, useEffect } from "react"
import { PlanCard } from "./plan-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import { farmPlanningApi } from "@/lib/farm-planning"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Plan {
    id: number
    plan_name: string
    nb_poulets_recommande: number
    budget: number
    duration_days: number
    status: string
    created_at: string
    progress_percentage: number
}

interface PlanListProps {
  onCreateNew: () => void
  onViewPlan: (id: number) => void
  onEditPlan: (id: number) => void
  onDeletePlan: (id: number) => void
}

export function PlanList({ onCreateNew, onViewPlan, onEditPlan, onDeletePlan }: PlanListProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    filterPlans()
  }, [plans, searchTerm, statusFilter])

  const fetchPlans = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await farmPlanningApi.getPlans(token)
      if (response.success && response.data && response.data.farm_plans) {
        setPlans(response.data.farm_plans)
      } else {
        setPlans([])
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error)
      toast({
        title: "Error",
        description: "Failed to load farm plans",
        variant: "destructive",
      })
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const filterPlans = () => {
    let filtered = plans

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(plan => plan.status === statusFilter)
    }

    setFilteredPlans(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Farm Plans</h2>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Farm Plans</h2>
          <p className="text-muted-foreground">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Plans Grid */}
      {!Array.isArray(filteredPlans) || filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {plans.length === 0 ? "No farm plans yet" : "No plans match your search"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {plans.length === 0 
              ? "Create your first farm plan to get AI-powered recommendations"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {plans.length === 0 && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            plan && plan.id ? (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={onViewPlan}
                onEdit={onEditPlan}
                onDelete={onDeletePlan}
              />
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}