import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { TimelineSection } from "@/components/timeline-section"
import { HobbiesSection } from "@/components/hobbies-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <TimelineSection />
      <HobbiesSection />
      <Footer />
    </main>
  )
}
