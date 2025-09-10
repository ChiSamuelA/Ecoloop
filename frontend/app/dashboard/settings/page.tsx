"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
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
      <Card className="bg-gradient-to-br from-purple-50 via-background to-purple-100 border-purple-200">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-16 w-16 text-purple-600" />
            </div>
            
            <Badge variant="secondary" className="px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Coming Soon
            </Badge>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Account Settings
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
                Customize your Éco Loop experience. Manage your profile, 
                notifications, and preferences.
              </p>
              
              <div className="text-muted-foreground">
                We're working on comprehensive settings to help you 
                personalize your farming platform.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Update your personal information, contact details, and farming preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Configure alerts for tasks, training updates, and community activities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Manage your data privacy settings and account security preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}