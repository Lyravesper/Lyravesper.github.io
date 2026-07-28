import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                aurelie.chu@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                06 30 30 87 24
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Citers, Haute-Saône
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#accueil" className="hover:text-primary transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/#projets" className="hover:text-primary transition-colors">
                  Projets
                </a>
              </li>
              <li>
                <a href="/#parcours" className="hover:text-primary transition-colors">
                  Parcours
                </a>
              </li>
              <li>
                <a href="/#passions" className="hover:text-primary transition-colors">
                  Passions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">À propos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Portfolio créé avec amour et beaucoup de café :)
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Aurélie Chu. Tous droits réservés.
            Fait avec amour par mon petit frère.
          </p>
        </div>
      </div>
    </footer>
  )
}
