import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DetailPageContent } from "@/components/detail-page"
import { projets } from "@/content/projets"

export function generateStaticParams() {
  return Object.keys(projets).map((slug) => ({ slug }))
}

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = projets[slug]
  if (!page) notFound()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
        <Link
          href="/#projets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>
      </div>
      <DetailPageContent page={page} />
      <Footer />
    </main>
  )
}
