"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Music, Sparkles, TreePine, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Hobby = {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  iconColor: string
  /** Optional detail-page slug (see content/passions.ts). Omit to keep the card non-clickable. */
  slug?: string
}

const hobbies: Hobby[] = [
  {
    title: "Musique",
    description:
      "La musique m'accompagne au quotidien. Que ce soit pour me concentrer, me détendre ou m'inspirer, elle fait partie intégrante de ma vie. J'aime découvrir de nouveaux artistes et partager mes coups de coeur.",
    icon: Music,
    gradient: "from-primary/20 to-accent/10",
    iconColor: "text-primary",
    slug: "musique",
  },
  {
    title: "Création Artisanale",
    description:
      "Passionnée par le travail manuel, je crée des bijoux et m'adonne au tricot. Ces activités créatives me permettent de m'exprimer et d'offrir des pièces uniques à mes proches.",
    icon: Sparkles,
    gradient: "from-accent/20 to-primary/10",
    iconColor: "text-accent",
  },
  {
    title: "Nature & Photographie",
    description:
      "Les arbres et la nature sont une source d'inspiration infinie. J'aime me promener en forêt et capturer la beauté des paysages à travers la photographie, immortalisant ces moments de sérénité.",
    icon: TreePine,
    gradient: "from-primary/15 to-accent/15",
    iconColor: "text-primary",
  },
]

export function HobbiesSection() {
  return (
    <section id="passions" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mes Passions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Au-delà du travail, voici ce qui nourrit ma créativité et mon
            équilibre au quotidien.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {hobbies.map((hobby) => {
            const card = (
              <Card className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform duration-300",
                      hobby.gradient
                    )}
                  >
                    <hobby.icon className={cn("h-8 w-8", hobby.iconColor)} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground text-center mb-3">
                    {hobby.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {hobby.description}
                  </p>
                </CardContent>
              </Card>
            )

            if (!hobby.slug) {
              return <div key={hobby.title}>{card}</div>
            }

            return (
              <Link key={hobby.title} href={`/passions/${hobby.slug}`} className="block h-full">
                {card}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
