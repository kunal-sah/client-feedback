import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";
import { authOptions } from "../lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Only redirect to dashboard if user is logged in
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 -z-10" />
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Transform Client Feedback into Growth
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Streamline your monthly client feedback process with our intuitive platform. 
              Collect, analyze, and act on feedback to drive continuous improvement.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild>
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage client feedback
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features to help you collect and analyze feedback effectively
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-background rounded-2xl shadow-sm border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Surveys</h3>
              <p className="text-muted-foreground">
                Create customized surveys with our intuitive builder. Support for multiple question types and conditional logic.
              </p>
            </div>
            <div className="relative p-6 bg-background rounded-2xl shadow-sm border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Get actionable insights with our powerful analytics. Track trends and identify areas for improvement.
              </p>
            </div>
            <div className="relative p-6 bg-background rounded-2xl shadow-sm border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work together seamlessly. Share results, assign tasks, and track progress with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by leading companies
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-muted rounded-2xl">
              <p className="text-lg mb-4">
                "This platform has transformed how we collect and act on client feedback. The insights have been invaluable."
              </p>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">CEO, TechStart</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted rounded-2xl">
              <p className="text-lg mb-4">
                "The analytics dashboard gives us clear visibility into client satisfaction trends. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Director, GrowthLabs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to transform your client feedback process?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of companies already using our platform
          </p>
          <Button size="lg" variant="secondary" className="rounded-full">
            <Link href="/login" className="flex items-center">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 