"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForumPage() {
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center">
        <Button variant="ghost" asChild className="flex items-center space-x-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Main Coming Soon Section */}
      <Card className="bg-gradient-to-br from-blue-50 via-background to-blue-100 border-blue-200">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-16 w-16 text-blue-600" />
              <Users className="h-12 w-12 text-blue-500" />
            </div>
            
            <Badge variant="secondary" className="px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Coming Soon
            </Badge>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Community Forum
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
                Connect with fellow poultry farmers across Cameroon. Share experiences, 
                ask questions, and learn from the community.
              </p>
              
              <div className="text-muted-foreground">
                We're building something amazing for our farming community. 
                Stay tuned for updates!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Discussion Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Ask questions, share solutions, and discuss farming techniques with experienced farmers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Expert Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Get advice from agricultural experts and successful poultry farmers in your region.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Local Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Stay updated on farming events, workshops, and meetups in your area.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}