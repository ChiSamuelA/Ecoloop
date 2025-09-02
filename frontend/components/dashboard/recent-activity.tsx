import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, CheckCircle, MessageSquare, BookOpen, Brain } from "lucide-react"

interface ActivityItem {
  id: string
  type: "task" | "forum" | "training" | "planning"
  title: string
  description: string
  timestamp: string
  status?: "completed" | "pending" | "new"
  user?: {
    name: string
    avatar?: string
  }
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "task",
    title: "Morning Feed Completed",
    description: "Fed 150 chickens with layer feed",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: "2",
    type: "planning",
    title: "New Farm Plan Generated",
    description: "AI recommended setup for 200 broiler chickens",
    timestamp: "4 hours ago",
    status: "new",
  },
  {
    id: "3",
    type: "forum",
    title: "Question Answered",
    description: "Helped with disease prevention query",
    timestamp: "6 hours ago",
    user: {
      name: "Marie Kouam",
      avatar: "",
    },
  },
  {
    id: "4",
    type: "training",
    title: "Course Progress",
    description: 'Completed "Poultry Health Management" lesson 3',
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    id: "5",
    type: "task",
    title: "Coop Cleaning",
    description: "Weekly deep cleaning scheduled for tomorrow",
    timestamp: "1 day ago",
    status: "pending",
  },
]

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "task":
      return <Calendar className="h-4 w-4" />
    case "forum":
      return <MessageSquare className="h-4 w-4" />
    case "training":
      return <BookOpen className="h-4 w-4" />
    case "planning":
      return <Brain className="h-4 w-4" />
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

function getStatusBadge(status?: ActivityItem["status"]) {
  if (!status) return null

  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      )
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "new":
      return <Badge className="bg-primary">New</Badge>
    default:
      return null
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest farm management activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  {activity.user && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                          <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
