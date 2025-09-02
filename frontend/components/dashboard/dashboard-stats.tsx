import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar, BookOpen, Target, Users } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down"
  }
  icon: React.ReactNode
  description?: string
}

function StatCard({ title, value, change, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {change.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={change.trend === "up" ? "text-green-500" : "text-red-500"}>{change.value}</span>
            <span>from last month</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Farm Plans"
        value={3}
        change={{ value: "+2", trend: "up" }}
        icon={<Target className="h-4 w-4 text-muted-foreground" />}
        description="AI-optimized farm setups"
      />
      <StatCard
        title="Today's Tasks"
        value={8}
        change={{ value: "-2", trend: "down" }}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        description="Pending farm activities"
      />
      <StatCard
        title="Learning Progress"
        value="67%"
        change={{ value: "+12%", trend: "up" }}
        icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        description="Course completion rate"
      />
      <StatCard
        title="Community Posts"
        value={24}
        change={{ value: "+8", trend: "up" }}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Forum interactions"
      />
    </div>
  )
}
