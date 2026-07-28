import { Briefcase, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const experiences = [
  {
    type: "work",
    title: "Médiatrice Culturelle",
    organization: "Pôle culturel de la ville de Lure",
    period: "2015 - Présent",
    description:
      "Référente communication imprimée et web, organisation d'événements culturels, gestion des réseaux sociaux et montage vidéo.",
  },
  {
    type: "work",
    title: "Agent de Bibliothèque",
    organization: "Pôle culturel de la ville de Lure",
    period: "2009 - 2015",
    description:
      "Accueil des usagers, prêts-retours, club lecture adultes, réalisation de bibliographies thématiques.",
  },
]

const formations = [
  {
    type: "education",
    title: "Logiciel InDesign initiation",
    organization: "Formation professionnelle",
    period: "2023",
    description: "Maîtrise des outils de mise en page et design éditorial.",
  },
  {
    type: "education",
    title: "Mise à jour de site internet avec WordPress",
    organization: "Formation professionnelle",
    period: "2023",
    description: "Gestion et mise à jour de contenus web.",
  },
  {
    type: "education",
    title: "Rédiger pour le web",
    organization: "Formation professionnelle",
    period: "2020",
    description: "Techniques de rédaction adaptées au numérique.",
  },
  {
    type: "education",
    title: "Logiciel Photoshop & Illustrator",
    organization: "Formation professionnelle",
    period: "2016 - 2017",
    description: "Création graphique et retouche d'images.",
  },
  {
    type: "education",
    title: "Titre d'auxiliaire de bibliothèque",
    organization: "Formation ABF - Besançon",
    period: "2011",
    description: "Mention bien - Formation certifiante en bibliothéconomie.",
  },
]

export function TimelineSection() {
  return (
    <section id="parcours" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mon Parcours
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Plus de 15 ans d'expérience dans le secteur culturel, enrichis par
            des formations continues en communication et design.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experiences */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              Expériences Professionnelles
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              {experiences.map((item, index) => (
                <TimelineItem key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Formations */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <GraduationCap className="h-5 w-5" />
              </div>
              Formations
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              {formations.map((item, index) => (
                <TimelineItem key={index} item={item} isEducation />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelineItem({
  item,
  isEducation = false,
}: {
  item: {
    title: string
    organization: string
    period: string
    description: string
  }
  isEducation?: boolean
}) {
  return (
    <div className="relative pl-8">
      <div
        className={cn(
          "absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center",
          isEducation ? "border-accent" : "border-primary"
        )}
      >
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isEducation ? "bg-accent" : "bg-primary"
          )}
        />
      </div>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 className="font-semibold text-foreground">{item.title}</h4>
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              isEducation
                ? "bg-accent/10 text-accent"
                : "bg-primary/10 text-primary"
            )}
          >
            {item.period}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{item.organization}</p>
        <p className="text-sm text-muted-foreground/80">{item.description}</p>
      </div>
    </div>
  )
}
