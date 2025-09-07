"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PlanCardProps {
  plan: {
    id: number
    plan_name: string
    nb_poulets_recommande: number
    budget: number
    duration_days: number
    status: string
    created_at: string
    progress_percentage: number
  }
  onView: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function PlanCard({ plan, onView, onEdit, onDelete }: PlanCardProps) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'paused':
        return 'Paused'
      default:
        return status
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
            <CardDescription>
              {plan.nb_poulets_recommande} chickens • {plan.duration_days} days cycle
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(plan.status)}>
              {getStatusText(plan.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(plan.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(plan.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(plan.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <div className="font-medium">{formatCurrency(plan.budget)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <div className="font-medium">
              {new Date(plan.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {plan.status === 'active' && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{plan.progress_percentage}%</span>
            </div>
            <Progress value={plan.progress_percentage} className="h-2" />
          </div>
        )}
        
        <Button 
          onClick={() => onView(plan.id)}
          className="w-full"
          variant="outline"
        >
          View Plan Details
        </Button>
      </CardContent>
    </Card>
  )
}