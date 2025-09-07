"use client"

import { useState } from "react"
import { PlanningWizard } from "@/components/farm-planning/planning-wizard"
import { PlanResults } from "@/components/farm-planning/plan-results"
import { PlanList } from "@/components/farm-planning/plan-list"
import { PlanSaveDialog } from "@/components/farm-planning/plan-save-dialog"
import { PlanDeleteDialog } from "@/components/farm-planning/plan-delete-dialog"
import { PlanEditDialog } from "@/components/farm-planning/plan-edit-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { 
  farmPlanningApi, 
  type FarmCalculationInput, 
  type FarmPlanResponse 
} from "@/lib/farm-planning"
import { tokenStorage } from "@/lib/auth"
import { Brain, ArrowLeft, Sparkles, List } from "lucide-react"
import { PlanDetail } from "@/components/farm-planning/plan-detail"

type ViewState = "intro" | "list" | "wizard" | "results" | "detail"

export default function FarmPlanningPage() {
  const [view, setView] = useState<ViewState>("intro")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [planToEdit, setPlanToEdit] = useState(null)
  const [currentRecommendations, setCurrentRecommendations] = useState<FarmPlanResponse | null>(null)
  const [currentCalculationData, setCurrentCalculationData] = useState<FarmCalculationInput | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleStartWizard = () => {
    setView("wizard")
  }

  const handleViewPlans = () => {
    setView("list")
  }

  const handleWizardComplete = async (formData: FarmCalculationInput) => {
    setIsLoading(true)
    setCurrentCalculationData(formData)
    
    try {
      const token = tokenStorage.get()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await farmPlanningApi.calculateRecommendations(formData, token)
      
      if (response.success) {
        setCurrentRecommendations(response)
        setView("results")
        toast({
          title: "Recommendations Generated!",
          description: "Your AI-powered farm analysis is ready.",
        })
      }
    } catch (error) {
      console.error("Failed to generate recommendations:", error)
      let errorMessage = "Unable to generate recommendations. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePlan = () => {
    setShowSaveDialog(true)
  }

  const handleSaveSuccess = (savedPlan: any) => {
    // Optionally navigate to plan list to show the saved plan
    setView("list")
  }

  const handleViewPlan = async (id: number) => {
    try {
      const token = tokenStorage.get()
      if (!token) {
        throw new Error("Authentication required")
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/farm-plans/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      if (!response.ok) {
        throw new Error("Failed to fetch plan details")
      }
  
      const planData = await response.json()
      setSelectedPlanData(planData)
      setView("detail")
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load plan details",
        variant: "destructive",
      })
    }
  }

  const handleEditPlan = (id: number) => {
    if (view === "detail" && selectedPlanData) {
      // Edit from detail view
      setPlanToEdit(selectedPlanData.data.farm_plan)
      setShowEditDialog(true)
    } else {
      // Edit from list view - need to fetch plan data
      // For now, show a message
      toast({
        title: "Edit Plan",
        description: "Please view plan details first to edit",
      })
    }
  }

  const handleDeletePlan = (plan: any) => {
    setPlanToDelete(plan)
    setShowDeleteDialog(true)
  }

  const handleDeleteSuccess = (deletedId: number) => {
    toast({
      title: "Plan Deleted",
      description: "Farm plan has been permanently deleted.",
    })
    // The PlanList component will refresh automatically
  }

  const handleBackToIntro = () => {
    setView("intro")
    setCurrentRecommendations(null)
    setCurrentCalculationData(null)
  }

  const handleStartNewPlan = () => {
    setCurrentRecommendations(null)
    setCurrentCalculationData(null)
    setView("wizard")
  }

  // View: Wizard
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

  // View: Results
  if (view === "results" && currentRecommendations) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
        <PlanResults
          response={currentRecommendations}
          onSavePlan={handleSavePlan}
          onStartNewPlan={handleStartNewPlan}
        />
        
        {/* Save Dialog */}
        {currentCalculationData && (
          <PlanSaveDialog
            open={showSaveDialog}
            onClose={() => setShowSaveDialog(false)}
            calculationData={currentCalculationData}
            recommendations={currentRecommendations.data}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </div>
    )
  }

  // View: Plan List
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToIntro} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <PlanList
          onCreateNew={handleStartWizard}
          onViewPlan={handleViewPlan}
          onEditPlan={handleEditPlan}
          onDeletePlan={handleDeletePlan}
        />
        
        {/* Delete Dialog */}
        <PlanDeleteDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setPlanToDelete(null)
          }}
          plan={planToDelete}
          onDeleteSuccess={handleDeleteSuccess}
        />

        {/* Edit Dialog */}
        <PlanEditDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setPlanToEdit(null)
          }}
          plan={planToEdit}
          onUpdateSuccess={(updatedPlan) => {
            // Refresh the current view data
            if (selectedPlanData) {
              handleViewPlan(updatedPlan.id)
            }
            toast({
              title: "Plan Updated",
              description: "Changes saved successfully",
            })
          }}
        />
      </div>
    )
  }

  // View: Plan Detail
  if (view === "detail" && selectedPlanData) {
    return (
      <PlanDetail
        planData={selectedPlanData}
        onBack={() => setView("list")}
        onEdit={() => handleEditPlan(
          selectedPlanData.data.farm_plan.id
        )}
      />
    )
  }

  // View: Intro (Default)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Farm Planning</h1>
        <p className="text-muted-foreground mt-2">
          Get AI-powered recommendations for your poultry farm setup based on your budget, space, and experience.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Plan */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 hover:shadow-md transition-shadow cursor-pointer" onClick={handleStartWizard}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Create New Farm Plan</h3>
                <p className="text-muted-foreground mb-4">
                  Get AI-powered recommendations based on your budget, space, and experience level.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Start Planning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Existing Plans */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewPlans}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <List className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">View My Plans</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your existing farm plans, track progress, and view recommendations.
                </p>
                <Button variant="outline">
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              Advanced algorithms calculate the optimal number of chickens and setup configuration
              based on your specific constraints.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Cameroon Market Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Recommendations tailored to Cameroon's market conditions, including regional pricing
              and demand patterns.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Financial Projections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get detailed ROI analysis, profit projections, and break-even calculations
              for informed decision-making.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}