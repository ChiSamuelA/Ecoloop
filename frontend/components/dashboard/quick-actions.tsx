import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Calendar, BookOpen, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    title: "Create Farm Plan",
    description: "Get AI recommendations for your next farm setup",
    icon: <Brain className="h-5 w-5" />,
    href: "/dashboard/farm-planning",
    color: "bg-blue-500",
  },
  {
    title: "Add Task",
    description: "Schedule a new farm management task",
    icon: <Calendar className="h-5 w-5" />,
    href: "/dashboard/tasks",
    color: "bg-green-500",
  },
  {
    title: "Start Learning",
    description: "Continue your poultry farming education",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/dashboard/training",
    color: "bg-purple-500",
  },
  {
    title: "Join Discussion",
    description: "Connect with the farming community",
    icon: <Users className="h-5 w-5" />,
    href: "/dashboard/forum",
    color: "bg-orange-500",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump to your most common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
