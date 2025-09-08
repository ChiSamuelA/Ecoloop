"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, DollarSign, TrendingUp, Calendar, Target, CheckCircle, Clock } from "lucide-react"
import { PlanTasks } from "./plan-tasks"
import { useState } from "react"
import { toast } from "../ui/use-toast"
import { tokenStorage } from "@/lib/auth"

interface PlanDetailProps {
  planData: any
  onBack: () => void
  onEdit?: () => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function PlanDetail({ planData, onBack, onEdit }: PlanDetailProps) {
  const { farm_plan, task_statistics, recommendations } = planData.data
  const [updatingStatus, setUpdatingStatus] = useState(false)

    const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
        const token = tokenStorage.get()
        if (!token) throw new Error("Authentication required")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/farm-plans/${farm_plan.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) throw new Error("Status update failed")

        toast({
        title: "Status Updated",
        description: `Plan status changed to ${newStatus}`,
        })
        
        // Refresh the plan data
        window.location.reload() // Simple refresh for now
    } catch (error) {
        toast({
        title: "Update Failed",
        description: "Failed to update plan status",
        variant: "destructive",
        })
    } finally {
        setUpdatingStatus(false)
    }
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Plans</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(farm_plan.status)}>
            {farm_plan.status}
          </Badge>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Plan
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(farm_plan.status)}>
                {farm_plan.status}
            </Badge>
            {farm_plan.status === 'active' && (
                <Button variant="outline" size="sm" onClick={() => updateStatus('completed')} disabled={updatingStatus}>
                Mark Complete
                </Button>
            )}
            {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                Edit Plan
                </Button>
            )}
        </div>
      </div>

      {/* Plan Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{farm_plan.plan_name}</h1>
        <p className="text-muted-foreground mt-2">
          Created on {new Date(farm_plan.created_at).toLocaleDateString()} • {farm_plan.duration_days} day cycle
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>Chickens</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farm_plan.nb_poulets_recommande}</div>
            <p className="text-xs text-muted-foreground mt-1">Recommended count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(farm_plan.budget)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Target className="h-4 w-4" />
              <span>Space</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farm_plan.espace_m2}m²</div>
            <p className="text-xs text-muted-foreground mt-1">Available space</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Duration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farm_plan.duration_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Days planned</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Task Progress</span>
          </CardTitle>
          <CardDescription>Your farming activities progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{task_statistics.completed_tasks}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{task_statistics.total_tasks - task_statistics.completed_tasks}</div>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{task_statistics.total_tasks}</div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{task_statistics.progress_percentage}%</span>
            </div>
            <Progress value={task_statistics.progress_percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Financial Recommendations */}
      {recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Investment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Investment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Investment:</span>
                <span className="font-medium">{formatCurrency(recommendations.summary.investment_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expected Profit:</span>
                <span className="font-medium text-green-600">{formatCurrency(recommendations.summary.profit_estime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ROI:</span>
                <span className="font-medium text-blue-600">{recommendations.summary.roi_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cycle Duration:</span>
                <span className="font-medium">{recommendations.summary.duree_cycle}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chicks:</span>
                <span className="font-medium">{formatCurrency(recommendations.cost_breakdown.poussins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Feed:</span>
                <span className="font-medium">{formatCurrency(recommendations.cost_breakdown.alimentation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Medicine:</span>
                <span className="font-medium">{formatCurrency(recommendations.cost_breakdown.medicaments)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Miscellaneous:</span>
                <span className="font-medium">{formatCurrency(recommendations.cost_breakdown.divers)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Management */}
      <PlanTasks farmPlanId={farm_plan.id} />

      {/* Notes */}
      {farm_plan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{farm_plan.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}