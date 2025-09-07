"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { farmPlanningApi } from "@/lib/farm-planning"
import { tokenStorage } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface PlanDeleteDialogProps {
  open: boolean
  onClose: () => void
  plan: {
    id: number
    plan_name: string
    nb_poulets_recommande: number
  } | null
  onDeleteSuccess: (deletedId: number) => void
}

export function PlanDeleteDialog({ 
  open, 
  onClose, 
  plan, 
  onDeleteSuccess 
}: PlanDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!plan) return

    setDeleting(true)
    try {
      const token = tokenStorage.get()
      if (!token) {
        throw new Error("Authentication required")
      }

      // Make DELETE request to your backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/farm-plans/${plan.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Delete failed" }))
        throw new Error(error.message || "Delete failed")
      }

      toast({
        title: "Plan Deleted",
        description: `"${plan.plan_name}" has been permanently deleted`,
      })
      
      onDeleteSuccess(plan.id)
      onClose()
    } catch (error) {
      console.error("Delete plan error:", error)
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete farm plan",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete Farm Plan</span>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your farm plan and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-red-800">
                  You are about to delete "{plan.plan_name}"
                </p>
                <p className="text-sm text-red-600">
                  This plan contains {plan.nb_poulets_recommande} chicken recommendations and any associated tasks will also be deleted.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}