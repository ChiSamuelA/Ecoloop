"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { FarmPlanRecommendation } from "@/lib/farm-planning"
import {
  TrendingUp,
  DollarSign,
  Target,
  Home,
  Utensils,
  Shield,
  Wrench,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
} from "lucide-react"

interface PlanResultsProps {
  plan: FarmPlanRecommendation
  alternatives?: FarmPlanRecommendation[]
  onSelectAlternative?: (plan: FarmPlanRecommendation) => void
  onSavePlan?: (plan: FarmPlanRecommendation) => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount)
}

function PlanCard({
  plan,
  isAlternative = false,
  onSelect,
}: {
  plan: FarmPlanRecommendation
  isAlternative?: boolean
  onSelect?: () => void
}) {
  const monthlyProfit = plan.projectedMonthlyRevenue - plan.monthlyOperatingCost
  const breakEvenMonths = Math.ceil(plan.setupCost / monthlyProfit)

  return (
    <Card className={`${isAlternative ? "border-muted" : "border-primary"} relative`}>
      {!isAlternative && (
        <div className="absolute -top-3 left-4">
          <Badge className="bg-primary">Recommended</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.breed}</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{plan.chickenCount}</div>
            <div className="text-sm text-muted-foreground">chickens</div>
          </div>
        </div>
        <CardDescription>
          Profitability Score: {plan.profitabilityScore}/10 • ROI: {plan.roi}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Setup Cost</span>
            </div>
            <div className="text-lg font-bold">{formatCurrency(plan.setupCost)}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Monthly Profit</span>
            </div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(monthlyProfit)}</div>
          </div>
        </div>

        {/* ROI Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ROI Progress</span>
            <span className="text-sm text-muted-foreground">{plan.roi}%</span>
          </div>
          <Progress value={Math.min(plan.roi, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Break-even in {breakEvenMonths} months</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Monthly Revenue:</span>
            <div className="font-medium">{formatCurrency(plan.projectedMonthlyRevenue)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Operating Costs:</span>
            <div className="font-medium">{formatCurrency(plan.monthlyOperatingCost)}</div>
          </div>
        </div>

        {isAlternative && onSelect && (
          <Button variant="outline" onClick={onSelect} className="w-full bg-transparent">
            Select This Plan
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function PlanResults({ plan, alternatives, onSelectAlternative, onSavePlan }: PlanResultsProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your AI-Generated Farm Plan</h2>
        <p className="text-muted-foreground">
          Based on your inputs, here's our recommended poultry farm setup for optimal profitability
        </p>
      </div>

      {/* Main Plan */}
      <PlanCard plan={plan} />

      {/* Detailed Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Housing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Home className="h-5 w-5" />
              <span>Housing System</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{plan.recommendations.housing}</p>
          </CardContent>
        </Card>

        {/* Feeding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="h-5 w-5" />
              <span>Feeding Program</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{plan.recommendations.feeding}</p>
          </CardContent>
        </Card>

        {/* Healthcare */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Healthcare Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{plan.recommendations.healthcare}</p>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Required Equipment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {plan.recommendations.equipment.map((item, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Risks and Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Potential Risks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.risks.map((risk, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <TrendingDown className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span>Market Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.marketInsights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Alternative Plans */}
      {alternatives && alternatives.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">Alternative Plans</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {alternatives.map((altPlan) => (
              <PlanCard key={altPlan.id} plan={altPlan} isAlternative onSelect={() => onSelectAlternative?.(altPlan)} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => onSavePlan?.(plan)}>
          Save This Plan
        </Button>
        <Button variant="outline" size="lg">
          Download PDF Report
        </Button>
        <Button variant="outline" size="lg">
          Schedule Consultation
        </Button>
      </div>
    </div>
  )
}
