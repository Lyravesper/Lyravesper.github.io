import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import fs from "fs"
import path from "path"

const AVATAR_DIR = path.join(process.cwd(), "public", "avatar")
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]

function getAvatarSrc() {
  try {
    const [file] = fs
      .readdirSync(AVATAR_DIR)
      .filter((name) => IMAGE_EXTENSIONS.includes(path.extname(name).toLowerCase()))
      .sort()
    return file ? `/avatar/${file}` : null
  } catch {
    return null
  }
}

export function HeroSection() {
  const avatarSrc = getAvatarSrc()

  return (
    <section
      id="accueil"
      className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
        <div className="relative w-48 h-48 md:w-72 md:h-72 shrink-0 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl bg-muted">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt="Portrait d'Aurélie Chu"
              fill
              className="object-cover object-top"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-balance px-4">
              Photo à venir
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2 text-balance">
            Aurélie Chu
          </h1>
          <p className="text-xl text-primary font-medium mb-6">
            Médiatrice Culturelle & Adjointe du Patrimoine
          </p>

          <div className="max-w-2xl mx-auto md:mx-0 mb-10">
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Passionnée par la transmission culturelle et la médiation, je mets
              mes compétences en communication visuelle et numérique au service du
              patrimoine. Depuis plus de 15 ans, j'accompagne les publics dans
              leur découverte de la culture à travers des expositions, événements
              et supports de communication créatifs. Mon parcours mêle rigueur
              professionnelle et sensibilité artistique.
            </p>
          </div>

          <Button size="lg" className="gap-2" asChild>
            <a href="/cv-aurelie-chu.pdf" download>
              <Download className="h-5 w-5" />
              Télécharger mon CV
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
