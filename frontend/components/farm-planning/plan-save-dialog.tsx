"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Save } from "lucide-react"
import { farmPlanningApi, type FarmCalculationInput } from "@/lib/farm-planning"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface PlanSaveDialogProps {
  open: boolean
  onClose: () => void
  calculationData: FarmCalculationInput
  recommendations: any
  onSaveSuccess: (savedPlan: any) => void
}

export function PlanSaveDialog({ 
  open, 
  onClose, 
  calculationData, 
  recommendations, 
  onSaveSuccess 
}: PlanSaveDialogProps) {
  const [planName, setPlanName] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a plan name",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const token = tokenStorage.get()
      if (!token) {
        throw new Error("Authentication required")
      }

      const planData = {
        plan_name: planName.trim(),
        budget: calculationData.budget,
        espace_m2: calculationData.espace_m2,
        experience_level: calculationData.experience_level,
        duration_days: calculationData.duration_days,
        notes: notes.trim() || undefined,
      }

      const response = await farmPlanningApi.createPlan(planData, token)
      
      if (response.success) {
        toast({
          title: "Plan Saved Successfully",
          description: `"${planName}" has been saved to your farm plans`,
        })
        onSaveSuccess(response.data.farm_plan)
        onClose()
        // Reset form
        setPlanName("")
        setNotes("")
      }
    } catch (error) {
      console.error("Save plan error:", error)
      let errorMessage = "Failed to save farm plan"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPlanName("")
    setNotes("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Save Farm Plan</span>
          </DialogTitle>
          <DialogDescription>
            Save your AI-generated farm plan for future reference and task management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan Summary */}
          <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recommended Chickens:</span>
              <span className="font-medium">{recommendations?.summary?.nb_poulets_optimal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investment Required:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("fr-CM", {
                  style: "currency",
                  currency: "XAF",
                  minimumFractionDigits: 0,
                }).format(recommendations?.summary?.investment_total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected ROI:</span>
              <span className="font-medium text-green-600">
                {recommendations?.summary?.roi_percentage}%
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                placeholder="e.g., My First Broiler Farm"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this plan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !planName.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}