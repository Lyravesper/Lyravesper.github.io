import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Palette, Globe, FileText, Camera, type LucideIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Project = {
  title: string
  description: string
  icon: LucideIcon
  tools: string[]
  skills: string[]
  /** Optional illustration. Omit to keep the card text-only. */
  image?: string
  /** Optional detail-page slug (see content/projets.ts). Omit to keep the card non-clickable. */
  slug?: string
}

const projects: Project[] = [
  {
    title: "Communication Visuelle",
    description:
      "Conception d'affiches, flyers, programmes et cartons d'invitation pour les événements culturels du Pôle culturel de Lure. Création d'une identité visuelle cohérente pour l'ensemble des supports de communication.",
    icon: Palette,
    tools: ["Adobe Illustrator", "Adobe Photoshop", "InDesign"],
    skills: ["Design graphique", "Mise en page", "Identité visuelle"],
  },
  {
    title: "Site Internet & Réseaux Sociaux",
    description:
      "Mise à jour et gestion du site internet avec WordPress. Animation des réseaux sociaux pour promouvoir les événements et créer une communauté engagée autour des activités culturelles.",
    icon: Globe,
    tools: ["WordPress", "Réseaux sociaux", "Outils analytics"],
    skills: ["Rédaction web", "Community management", "SEO"],
  },
  {
    title: "Montage Vidéo",
    description:
      "Réalisation de montages vidéo pour promouvoir les événements culturels, capturer les moments forts des expositions et créer du contenu engageant pour les supports numériques.",
    icon: Camera,
    tools: ["Adobe Premiere CC", "Logiciels de montage"],
    skills: ["Montage", "Storytelling visuel", "Post-production"],
    image: "/assets/r3.jpg",
    slug: "montage-video",
  },
  {
    title: "Supports Documentaires",
    description:
      "Création de bibliographies thématiques, comptes-rendus de réunion, statistiques et bilans d'activité. Rédaction de contenus pour les expositions et les supports d'accompagnement.",
    icon: FileText,
    tools: ["Microsoft Office", "Open Office", "SIGB Decalog"],
    skills: ["Rédaction", "Documentation", "Analyse"],
    image: "/assets/r2.jpg",
  },
]

export function ProjectsSection() {
  return (
    <section id="projets" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mes Projets
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Découvrez les différents domaines dans lesquels j'interviens au
            quotidien, alliant créativité et communication culturelle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((project) => {
            const card = (
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <project.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {project.title}
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.image && (
                    <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={project.image}
                        alt={`Illustration : ${project.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {project.tools.map((tool) => (
                        <Badge
                          key={tool}
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs font-medium border-primary/30 text-primary"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            if (!project.slug) {
              return <div key={project.title}>{card}</div>
            }

            return (
              <Link key={project.title} href={`/projets/${project.slug}`} className="block h-full">
                {card}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
