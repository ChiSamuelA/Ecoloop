"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Edit } from "lucide-react"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface PlanEditDialogProps {
  open: boolean
  onClose: () => void
  plan: {
    id: number
    plan_name: string
    budget: number
    espace_m2: number
    experience_level: string
    duration_days: number
    nb_poulets_recommande: number
    notes?: string
    status: string
  } | null
  onUpdateSuccess: (updatedPlan: any) => void
}

export function PlanEditDialog({ 
  open, 
  onClose, 
  plan, 
  onUpdateSuccess 
}: PlanEditDialogProps) {
  const [formData, setFormData] = useState({
    plan_name: "",
    notes: "",
    status: "active"
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name || "",
        notes: plan.notes || "",
        status: plan.status || "active"
      })
    }
  }, [plan])

  const handleSave = async () => {
    if (!plan || !formData.plan_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Plan name is required",
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/farm-plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_name: formData.plan_name.trim(),
          notes: formData.notes.trim() || undefined,
          status: formData.status
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Update failed" }))
        throw new Error(error.message || "Update failed")
      }

      const result = await response.json()
      
      toast({
        title: "Plan Updated",
        description: "Your farm plan has been successfully updated",
      })
      
      onUpdateSuccess(result.data?.farm_plan || result.data)
      onClose()
    } catch (error: any) {
      console.error("Update plan error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update farm plan",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name || "",
        notes: plan.notes || "",
        status: plan.status || "active"
      })
    }
    onClose()
  }

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Farm Plan</span>
          </DialogTitle>
          <DialogDescription>
            Update your farm plan details and status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Read-only Plan Info */}
          <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Chickens:</span>
                <span className="font-medium ml-2">{plan.nb_poulets_recommande || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium ml-2">{plan.duration_days || 0} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-medium ml-2">{(plan.budget || 0).toLocaleString()} FCFA</span>
              </div>
              <div>
                <span className="text-muted-foreground">Space:</span>
                <span className="font-medium ml-2">{plan.espace_m2 || 0}m²</span>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                value={formData.plan_name}
                onChange={(e) => setFormData(prev => ({ ...prev, plan_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                rows={3}
                placeholder="Add notes about this plan..."
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
            disabled={saving || !formData.plan_name.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Update Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}