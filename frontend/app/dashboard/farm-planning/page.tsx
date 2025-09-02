"use client"

import { useState } from "react"
import { PlanningWizard } from "@/components/farm-planning/planning-wizard"
import { PlanResults } from "@/components/farm-planning/plan-results"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { type FarmPlanInput, type FarmPlanRecommendation, mockFarmPlanResponse } from "@/lib/farm-planning"
import { tokenStorage } from "@/lib/auth"
import { Brain, ArrowLeft, Sparkles } from "lucide-react"

type ViewState = "intro" | "wizard" | "results"

export default function FarmPlanningPage() {
  const [view, setView] = useState<ViewState>("intro")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<FarmPlanRecommendation | null>(null)
  const [alternatives, setAlternatives] = useState<FarmPlanRecommendation[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const handleStartWizard = () => {
    setView("wizard")
  }

  const handleWizardComplete = async (formData: FarmPlanInput) => {
    setIsLoading(true)
    try {
      const token = tokenStorage.get()
      if (!token) {
        throw new Error("Authentication required")
      }

      // For demo purposes, use mock data
      // In production, this would call: const response = await farmPlanningApi.createPlan(formData, token)
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate API call
      const response = mockFarmPlanResponse

      if (response.success) {
        setCurrentPlan(response.plan)
        setAlternatives(response.alternatives || [])
        setView("results")
        toast({
          title: "Farm Plan Generated!",
          description: "Your AI-powered farm plan is ready for review.",
        })
      }
    } catch (error) {
      console.error("Failed to generate farm plan:", error)
      toast({
        title: "Generation Failed",
        description: "Unable to generate your farm plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAlternative = (plan: FarmPlanRecommendation) => {
    setCurrentPlan(plan)
    toast({
      title: "Plan Updated",
      description: "Alternative plan selected as your primary recommendation.",
    })
  }

  const handleSavePlan = async (plan: FarmPlanRecommendation) => {
    try {
      toast({
        title: "Plan Saved",
        description: "Your farm plan has been saved to your dashboard.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save your farm plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBackToIntro = () => {
    setView("intro")
    setCurrentPlan(null)
    setAlternatives([])
  }

  if (view === "wizard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <PlanningWizard onComplete={handleWizardComplete} isLoading={isLoading} />
      </div>
    )
  }

  if (view === "results" && currentPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Create New Plan</span>
          </Button>
        </div>
        <PlanResults
          plan={currentPlan}
          alternatives={alternatives}
          onSelectAlternative={handleSelectAlternative}
          onSavePlan={handleSavePlan}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Farm Planning</h1>
        <p className="text-muted-foreground mt-2">
          Get AI-powered recommendations for your poultry farm setup based on your budget, space, and goals.
        </p>
      </div>

      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">AI-Powered Farm Planning</h2>
              <p className="text-muted-foreground mb-6 max-w-lg">
                Our intelligent system analyzes your budget, available space, experience level, and goals to create a
                personalized farm plan optimized for Cameroon's market conditions.
              </p>
              <Button size="lg" onClick={handleStartWizard} className="bg-primary hover:bg-primary/90 text-lg px-8">
                Start Planning Your Farm
              </Button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-64 h-48 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Brain className="h-24 w-24 text-primary/50" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>AI Optimization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Advanced algorithms calculate the optimal number of chickens, breed selection, and setup configuration
              based on your specific constraints and objectives.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Local Market Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Recommendations are tailored to Cameroon's poultry market conditions, including regional pricing, demand
              patterns, and seasonal variations.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>ROI Projections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get detailed financial projections including setup costs, operating expenses, revenue forecasts, and
              break-even analysis for informed decision-making.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Simple steps to get your personalized farm plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Choose Farm Type</h4>
              <p className="text-sm text-muted-foreground">Select between layers, broilers, or mixed farming</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Input Resources</h4>
              <p className="text-sm text-muted-foreground">Tell us your budget and available space</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Set Goals</h4>
              <p className="text-sm text-muted-foreground">Define your objectives and timeline</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Get Your Plan</h4>
              <p className="text-sm text-muted-foreground">Receive AI-optimized recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
