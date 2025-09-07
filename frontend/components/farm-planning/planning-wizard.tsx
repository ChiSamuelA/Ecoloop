"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { FarmCalculationInput } from "@/lib/farm-planning"

interface PlanningWizardProps {
  onComplete: (data: FarmCalculationInput) => void
  isLoading?: boolean
}

const steps = [
  { id: 1, title: "Budget Available", description: "What's your available budget for this farm?" },
  { id: 2, title: "Space Available", description: "How much space do you have?" },
  { id: 3, title: "Experience Level", description: "What's your farming experience?" },
  { id: 4, title: "Timeline", description: "How long do you plan to raise chickens?" },
]

export function PlanningWizard({ onComplete, isLoading = false }: PlanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FarmCalculationInput>>({})

  const updateFormData = (updates: Partial<FarmCalculationInput>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (isFormValid()) {
      onComplete(formData as FarmCalculationInput)
    }
  }

  const isFormValid = () => {
    return (
      formData.budget &&
      formData.espace_m2 &&
      formData.experience_level &&
      formData.duration_days
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.budget
      case 2:
        return formData.espace_m2
      case 3:
        return formData.experience_level
      case 4:
        return formData.duration_days
      default:
        return false
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Farm Planning Wizard</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-foreground">{steps[currentStep - 1].title}</h3>
          <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="budget" className="text-base font-medium">
                  Available Budget (CFA Francs)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 150000"
                  value={formData.budget || ""}
                  onChange={(e) => updateFormData({ budget: Number(e.target.value) })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include money for chicks, feed, medicine, and equipment
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="espace" className="text-base font-medium">
                  Available Space (Square Meters)
                </Label>
                <Input
                  id="espace"
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.espace_m2 || ""}
                  onChange={(e) => updateFormData({ espace_m2: Number(e.target.value) })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Total area available for your chicken coop
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Your Experience Level</Label>
                <RadioGroup
                  value={formData.experience_level}
                  onValueChange={(value) => updateFormData({ experience_level: value as FarmCalculationInput["experience_level"] })}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="debutant" id="debutant" />
                    <div className="flex-1">
                      <Label htmlFor="debutant" className="font-medium">
                        Débutant (Beginner)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        New to poultry farming, need more guidance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="intermediaire" id="intermediaire" />
                    <div className="flex-1">
                      <Label htmlFor="intermediaire" className="font-medium">
                        Intermédiaire (Intermediate)
                      </Label>
                      <p className="text-sm text-muted-foreground">Some farming experience</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="avance" id="avance" />
                    <div className="flex-1">
                      <Label htmlFor="avance" className="font-medium">
                        Avancé (Advanced)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Experienced farmer, optimize for efficiency
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">How many days will you raise the chickens?</Label>
                <Select
                  value={formData.duration_days?.toString()}
                  onValueChange={(value) => updateFormData({ duration_days: Number(value) })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21">21 days - Quick cycle (broilers)</SelectItem>
                    <SelectItem value="30">30 days - Standard cycle</SelectItem>
                    <SelectItem value="45">45 days - Extended cycle</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Shorter cycles mean faster returns but smaller chickens
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <span>Get AI Recommendations</span>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}