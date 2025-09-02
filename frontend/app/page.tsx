import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar, BookOpen, Users, ChevronRight, Zap, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">É</span>
              </div>
              <span className="text-xl font-bold text-foreground">Éco Loop</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#training" className="text-muted-foreground hover:text-foreground transition-colors">
                Training
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Farm Management
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Revolutionizing Poultry Farming in
              <span className="text-primary"> Cameroon</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Éco Loop combines artificial intelligence with local expertise to help Cameroon farmers optimize their
              poultry operations, increase productivity, and maximize profits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
                <Link href="/register">
                  Start Your Farm Journey
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-muted-foreground">Active Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">85%</div>
                <div className="text-muted-foreground">Productivity Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-muted-foreground">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Intelligent Farm Management Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to run a successful poultry farm in Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Recommendations</CardTitle>
                <CardDescription>
                  Get personalized advice on chicken breeds, feeding schedules, and optimal farm conditions based on
                  your budget and space.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Task Management</CardTitle>
                <CardDescription>
                  Daily task calendars with photo uploads, completion tracking, and automated reminders for feeding,
                  cleaning, and health checks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Training Center</CardTitle>
                <CardDescription>
                  Access comprehensive courses on poultry farming techniques, disease prevention, and business
                  management with progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Community Forum</CardTitle>
                <CardDescription>
                  Connect with fellow farmers, share experiences, ask questions, and learn from the Cameroon poultry
                  farming community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Smart Farm Planning with AI</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Optimal Chicken Count</h4>
                    <p className="text-muted-foreground">
                      AI calculates the perfect number of chickens based on your available space and budget
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Profitability Analysis</h4>
                    <p className="text-muted-foreground">
                      Get detailed ROI projections and profit estimates for your farm setup
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Local Market Insights</h4>
                    <p className="text-muted-foreground">
                      Recommendations tailored specifically for Cameroon's poultry market conditions
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">AI-Powered Insights</h4>
              <p className="text-muted-foreground">
                Our intelligent system analyzes thousands of successful farms to provide you with the best
                recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section id="training" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Learn from the Best</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access expert training programs designed specifically for Cameroon poultry farmers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>Comprehensive Courses</span>
                  </CardTitle>
                  <CardDescription>
                    From basic poultry care to advanced business management, our courses cover everything you need to
                    succeed.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Progress Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor your learning journey with detailed progress bars and achievement badges.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Expert Instructors</span>
                  </CardTitle>
                  <CardDescription>
                    Learn from experienced Cameroon poultry farmers and agricultural experts.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">Popular Courses</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div>
                    <h4 className="font-semibold text-foreground">Poultry Basics for Beginners</h4>
                    <p className="text-sm text-muted-foreground">12 lessons • 3 hours</p>
                  </div>
                  <Badge variant="secondary">Popular</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div>
                    <h4 className="font-semibold text-foreground">Disease Prevention & Health</h4>
                    <p className="text-sm text-muted-foreground">8 lessons • 2 hours</p>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div>
                    <h4 className="font-semibold text-foreground">Farm Business Management</h4>
                    <p className="text-sm text-muted-foreground">15 lessons • 4 hours</p>
                  </div>
                  <Badge variant="secondary">Advanced</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Empowering Cameroon Farmers</h2>
            <p className="text-xl text-muted-foreground mb-12 text-pretty">
              Éco Loop was created specifically for the unique challenges and opportunities of poultry farming in
              Cameroon. Our platform combines cutting-edge AI technology with deep understanding of local farming
              conditions, market dynamics, and cultural practices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Local Expertise</h3>
                <p className="text-muted-foreground">
                  Built by farmers, for farmers, with deep knowledge of Cameroon's agricultural landscape
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI Innovation</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms provide personalized recommendations for optimal farm performance
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Community Focus</h3>
                <p className="text-muted-foreground">
                  Connecting farmers across Cameroon to share knowledge and support each other's success
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Transform Your Farm?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of successful farmers already using Éco Loop to optimize their poultry operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
                <Link href="/register">
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">É</span>
                </div>
                <span className="text-xl font-bold text-foreground">Éco Loop</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Revolutionizing poultry farming in Cameroon through intelligent AI-powered farm management solutions.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  Facebook
                </Button>
                <Button variant="ghost" size="sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm">
                  LinkedIn
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Training
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Éco Loop. All rights reserved. Made with ❤️ for Cameroon farmers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
