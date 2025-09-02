"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { FarmPlanInput } from "@/lib/farm-planning"

interface PlanningWizardProps {
  onComplete: (data: FarmPlanInput) => void
  isLoading?: boolean
}

const steps = [
  { id: 1, title: "Farm Type", description: "What type of poultry farm do you want to start?" },
  { id: 2, title: "Budget & Space", description: "Tell us about your available resources" },
  { id: 3, title: "Experience & Location", description: "Your background and farm location" },
  { id: 4, title: "Goals & Timeline", description: "What are your objectives and timeline?" },
]

export function PlanningWizard({ onComplete, isLoading = false }: PlanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FarmPlanInput>>({
    objectives: [],
  })

  const updateFormData = (updates: Partial<FarmPlanInput>) => {
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
      onComplete(formData as FarmPlanInput)
    }
  }

  const isFormValid = () => {
    return (
      formData.farmType &&
      formData.budget &&
      formData.spaceSize &&
      formData.spaceUnit &&
      formData.experience &&
      formData.location &&
      formData.timeline &&
      formData.objectives &&
      formData.objectives.length > 0
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.farmType
      case 2:
        return formData.budget && formData.spaceSize && formData.spaceUnit
      case 3:
        return formData.experience && formData.location
      case 4:
        return formData.timeline && formData.objectives && formData.objectives.length > 0
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
                <Label className="text-base font-medium">What type of poultry farm interests you?</Label>
                <RadioGroup
                  value={formData.farmType}
                  onValueChange={(value) => updateFormData({ farmType: value as FarmPlanInput["farmType"] })}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="layers" id="layers" />
                    <div className="flex-1">
                      <Label htmlFor="layers" className="font-medium">
                        Layer Farm (Egg Production)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Focus on egg-laying chickens for consistent income
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="broilers" id="broilers" />
                    <div className="flex-1">
                      <Label htmlFor="broilers" className="font-medium">
                        Broiler Farm (Meat Production)
                      </Label>
                      <p className="text-sm text-muted-foreground">Raise chickens for meat with faster turnover</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <div className="flex-1">
                      <Label htmlFor="mixed" className="font-medium">
                        Mixed Farm (Eggs & Meat)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Combination of layers and broilers for diversified income
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="budget" className="text-base font-medium">
                  Available Budget (CFA Francs)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 2000000"
                  value={formData.budget || ""}
                  onChange={(e) => updateFormData({ budget: Number(e.target.value) })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include setup costs, initial feed, and operating capital
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spaceSize" className="text-base font-medium">
                    Available Space
                  </Label>
                  <Input
                    id="spaceSize"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.spaceSize || ""}
                    onChange={(e) => updateFormData({ spaceSize: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-base font-medium">Unit</Label>
                  <Select
                    value={formData.spaceUnit}
                    onValueChange={(value) => updateFormData({ spaceUnit: value as FarmPlanInput["spaceUnit"] })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqm">Square Meters</SelectItem>
                      <SelectItem value="hectares">Hectares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Your Experience Level</Label>
                <RadioGroup
                  value={formData.experience}
                  onValueChange={(value) => updateFormData({ experience: value as FarmPlanInput["experience"] })}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner - New to poultry farming</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate - Some farming experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced - Experienced farmer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="location" className="text-base font-medium">
                  Farm Location
                </Label>
                <Select value={formData.location} onValueChange={(value) => updateFormData({ location: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centre">Centre Region (Yaoundé)</SelectItem>
                    <SelectItem value="littoral">Littoral Region (Douala)</SelectItem>
                    <SelectItem value="west">West Region (Bafoussam)</SelectItem>
                    <SelectItem value="northwest">Northwest Region (Bamenda)</SelectItem>
                    <SelectItem value="southwest">Southwest Region (Buea)</SelectItem>
                    <SelectItem value="adamawa">Adamawa Region (Ngaoundéré)</SelectItem>
                    <SelectItem value="north">North Region (Garoua)</SelectItem>
                    <SelectItem value="far-north">Far North Region (Maroua)</SelectItem>
                    <SelectItem value="east">East Region (Bertoua)</SelectItem>
                    <SelectItem value="south">South Region (Ebolowa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Primary Objectives (Select all that apply)</Label>
                <div className="mt-3 space-y-3">
                  {[
                    { id: "income", label: "Generate steady income" },
                    { id: "food-security", label: "Improve family food security" },
                    { id: "business-growth", label: "Build a scalable business" },
                    { id: "employment", label: "Create local employment" },
                    { id: "sustainability", label: "Sustainable farming practices" },
                    { id: "export", label: "Export to regional markets" },
                  ].map((objective) => (
                    <div key={objective.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={objective.id}
                        checked={formData.objectives?.includes(objective.id) || false}
                        onCheckedChange={(checked) => {
                          const currentObjectives = formData.objectives || []
                          if (checked) {
                            updateFormData({ objectives: [...currentObjectives, objective.id] })
                          } else {
                            updateFormData({
                              objectives: currentObjectives.filter((obj) => obj !== objective.id),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={objective.id}>{objective.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="timeline" className="text-base font-medium">
                  Timeline to Profitability (months)
                </Label>
                <Select
                  value={formData.timeline?.toString()}
                  onValueChange={(value) => updateFormData({ timeline: Number(value) })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months - Quick returns</SelectItem>
                    <SelectItem value="6">6 months - Balanced approach</SelectItem>
                    <SelectItem value="12">12 months - Long-term growth</SelectItem>
                    <SelectItem value="24">24 months - Maximum optimization</SelectItem>
                  </SelectContent>
                </Select>
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
                <span>Generating Plan...</span>
              </>
            ) : (
              <span>Generate Farm Plan</span>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
