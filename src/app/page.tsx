import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">AI Toolbox</div>
          <div className="hidden md:flex space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground">
              About
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            All Your AI Tools in <span className="text-primary">One Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Access translation, OCR, image generation, professional headshots, and more.
            Pay monthly or per use with flexible credit system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Tools</h2>
            <p className="text-muted-foreground">Everything you need in one place</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">🌐</div>
                <CardTitle>Translation</CardTitle>
                <CardDescription>
                  Translate text between 100+ languages instantly
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">📄</div>
                <CardTitle>OCR</CardTitle>
                <CardDescription>
                  Extract text from images and documents with high accuracy
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">🎨</div>
                <CardTitle>Image Generation</CardTitle>
                <CardDescription>
                  Create stunning AI-generated images from text descriptions
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">📸</div>
                <CardTitle>Professional Headshots</CardTitle>
                <CardDescription>
                  Transform your photos into professional headshots
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">💼</div>
                <CardTitle>LinkedIn Recommendations</CardTitle>
                <CardDescription>
                  Generate professional recommendations and content
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">✨</div>
                <CardTitle>And More...</CardTitle>
                <CardDescription>
                  New AI tools added regularly to expand your capabilities
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Flexible Pricing</h2>
            <p className="text-muted-foreground">Choose the plan that works for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 100 credits/month
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Access to all tools
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Basic support
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">Get Started</Button>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Most popular</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 1,000 credits/month
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> All tools unlocked
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Priority processing
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> API access
                  </li>
                </ul>
                <Button className="w-full mt-6">Start Pro Trial</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 5,000 credits/month
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> All Pro features
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Custom AI models
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Priority support
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Need more credits? Purchase additional credits anytime starting at $10 for 500 credits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-primary mb-4">AI Toolbox</div>
              <p className="text-sm text-muted-foreground">
                Your all-in-one AI platform for productivity and creativity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#">Privacy Policy</Link></li>
                <li><Link href="#">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 AI Toolbox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
