"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CreateTaskInput, Task } from "@/lib/tasks"
import { Loader2, Calendar, Repeat } from "lucide-react"

interface TaskFormProps {
  task?: Task
  onSubmit: (data: CreateTaskInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TaskForm({ task, onSubmit, onCancel, isLoading = false }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || "other",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate || new Date().toISOString().split("T")[0],
    dueTime: task?.dueTime || "",
    estimatedDuration: task?.estimatedDuration || 30,
    recurring: task?.recurring || undefined,
  })

  const [isRecurring, setIsRecurring] = useState(!!task?.recurring)

  const updateFormData = (updates: Partial<CreateTaskInput>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = { ...formData }
    if (!isRecurring) {
      delete submitData.recurring
    }
    onSubmit(submitData)
  }

  const isFormValid = () => {
    return formData.title && formData.description && formData.dueDate && formData.estimatedDuration > 0
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? "Edit Task" : "Create New Task"}</CardTitle>
        <CardDescription>
          {task ? "Update task details and settings" : "Add a new task to your farm management schedule"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g., Morning Feed - Layer Chickens"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Detailed description of the task..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData({ category: value as Task["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">🥗 Feeding</SelectItem>
                    <SelectItem value="cleaning">🧹 Cleaning</SelectItem>
                    <SelectItem value="health">🏥 Health Check</SelectItem>
                    <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                    <SelectItem value="monitoring">👁️ Monitoring</SelectItem>
                    <SelectItem value="other">📋 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateFormData({ priority: value as Task["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Scheduling */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Scheduling</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateFormData({ dueDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dueTime">Due Time (Optional)</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => updateFormData({ dueTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.estimatedDuration}
                  onChange={(e) => updateFormData({ estimatedDuration: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Repeat className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Recurring Task</h3>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={formData.recurring?.frequency || "daily"}
                    onValueChange={(value) =>
                      updateFormData({
                        recurring: {
                          ...formData.recurring,
                          frequency: value as "daily" | "weekly" | "monthly",
                          interval: formData.recurring?.interval || 1,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Interval</Label>
                  <Select
                    value={formData.recurring?.interval?.toString() || "1"}
                    onValueChange={(value) =>
                      updateFormData({
                        recurring: {
                          ...formData.recurring,
                          frequency: formData.recurring?.frequency || "daily",
                          interval: Number(value),
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every</SelectItem>
                      <SelectItem value="2">Every 2nd</SelectItem>
                      <SelectItem value="3">Every 3rd</SelectItem>
                      <SelectItem value="4">Every 4th</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid() || isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {task ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{task ? "Update Task" : "Create Task"}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
