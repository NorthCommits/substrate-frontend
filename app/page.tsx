"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { LiveStats } from "@/components/landing/LiveStats";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { GraphPreview } from "@/components/landing/GraphPreview";
import { CodeSnippet } from "@/components/landing/CodeSnippet";
import { UseCases } from "@/components/landing/UseCases";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("substrate_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <Hero />
      <SocialProof />
      <LiveStats />
      <Problem />
      <Solution />
      <Features />
      <GraphPreview />
      <CodeSnippet />
      <UseCases />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
