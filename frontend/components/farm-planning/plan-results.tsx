"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { FarmPlanResponse } from "@/lib/farm-planning"
import {
  TrendingUp,
  DollarSign,
  Target,
  PiggyBank,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
} from "lucide-react"

interface PlanResultsProps {
  response: FarmPlanResponse
  onSavePlan?: (planData: any) => void
  onStartNewPlan?: () => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function PlanResults({ response, onSavePlan, onStartNewPlan }: PlanResultsProps) {
  const { data } = response

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your AI Farm Recommendations</h2>
        <p className="text-muted-foreground">
          Based on your inputs, here's our intelligent analysis for optimal profitability
        </p>
      </div>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>Recommended Chickens</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.summary.nb_poulets_optimal}</div>
            <p className="text-xs text-muted-foreground mt-1">Optimized for your space & budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Total Investment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.investment_total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Initial setup cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Expected Profit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.profit_estime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Net profit after {data.summary.duree_cycle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span>ROI</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.summary.roi_percentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Status */}
      <Card className={`border-2 ${data.summary.rentable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            {data.summary.rentable ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {data.summary.rentable ? 'Profitable Business Opportunity' : 'Limited Profitability'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.summary.rentable 
                  ? 'This farm setup shows strong potential for profitability based on current market conditions.'
                  : 'Consider adjusting your budget or space to improve profitability.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Cost Breakdown</span>
            </CardTitle>
            <CardDescription>Detailed investment analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Chicks (Poussins)</span>
                <span className="font-medium">{formatCurrency(data.cost_breakdown.poussins)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feed (Alimentation)</span>
                <span className="font-medium">{formatCurrency(data.cost_breakdown.alimentation)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medicine (Médicaments)</span>
                <span className="font-medium">{formatCurrency(data.cost_breakdown.medicaments)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Miscellaneous (Divers)</span>
                <span className="font-medium">{formatCurrency(data.cost_breakdown.divers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Safety Buffer</span>
                <span className="font-medium">{formatCurrency(data.cost_breakdown.buffer_mortalite)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center font-bold">
                <span>Total Cost</span>
                <span>{formatCurrency(data.cost_breakdown.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profitability Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5" />
              <span>Profitability Analysis</span>
            </CardTitle>
            <CardDescription>Revenue and profit projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Surviving Chickens</span>
                <span className="font-medium">{data.profitability.poulets_survivants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Revenue</span>
                <span className="font-medium">{formatCurrency(data.profitability.chiffre_affaires)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Net Profit</span>
                <span className="font-medium text-green-600">{formatCurrency(data.profitability.benefice_net)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Profit per Chicken</span>
                <span className="font-medium">{formatCurrency(data.profitability.benefice_par_poulet)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Break-even Point</span>
                <span className="font-medium">{data.profitability.seuil_rentabilite} chickens</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>AI Recommendations</span>
            </CardTitle>
            <CardDescription>Personalized advice for your farm</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Limiting Factors */}
      {data.limiting_factors && data.limiting_factors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Optimization Opportunities</span>
            </CardTitle>
            <CardDescription>Factors limiting your farm size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.limiting_factors.map((factor, index) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{factor.factor}</span>
                    <Badge variant="outline">{factor.current}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90" 
          onClick={() => onSavePlan && onSavePlan(data)}
        >
          Save This Plan
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={onStartNewPlan}
        >
          Create Another Plan
        </Button>
        <Button variant="outline" size="lg">
          Download Report
        </Button>
      </div>
    </div>
  )
}