import type { DetailPage } from "@/lib/detail-content"

/**
 * Each entry is one project detail page, reachable at /projets/<key>.
 *
 * A page is a title + a list of rows. A row is a list of columns, plus an
 * optional `width` (% of the page, centered — leave it out for full width).
 *
 * A column is either:
 *   { image: "/assets/photo.jpg", alt: "description", width: 40 }
 *   { text: [ ...blocks ], width: 60 }
 *
 * `width` on a column is a % of its row. Leave it out and the column
 * splits whatever space is left evenly with the other width-less columns
 * in that row. If the widths in a row add up past 100 (e.g. two columns
 * both set to 60), the ones that don't fit wrap to their own new line
 * automatically — no extra row needed for that.
 *
 * Text blocks (mix and repeat in any order):
 *   { subtitle: "A small heading" }
 *   { paragraph: "Normal text. **bold** and [links](https://example.com) work inline." }
 *   { list: ["Bullet one", "Bullet two"] }
 */
export const projets: Record<string, DetailPage> = {
  "montage-video": {
    title: "Montage Vidéo",
    rows: [
      {
        columns: [
          {
            image: "/assets/r3.jpg",
            alt: "Poste de montage vidéo avec plusieurs écrans",
            width: 50,
          },
          {
            text: [
              { subtitle: "Trois caméras, un stagiaire, zéro plan B" },
              {
                paragraph:
                  "Pour la Nuit des Musées, on a filmé sur trois caméras en simultané, dont une tenue à bout de bras par un stagiaire qui découvrait le concept de « cadrage » en direct. Résultat : deux heures de rushes, une guêpe qui a jugé bon de traverser le champ à la minute 42, et un montage final de trois minutes qui ne garde heureusement aucune trace de l'un ou l'autre.",
              },
              {
                paragraph:
                  "Le montage se fait sous **Adobe Premiere Pro**, avec un luxe de patience pour synchroniser le son du micro-cravate et celui des caméras. Depuis, retour à une seule caméra fixe pour les événements suivants : moins de rushes, plus de café bu pendant qu'elle tourne toute seule. J'adore mon frère.",
              },
            ],
            width: 50,
          },
        ],
      },
      {
        columns: [
          {
            text: [
              { subtitle: "Le matériel" },
              {
                list: [
                  "**Adobe Premiere Pro** pour le montage et l'étalonnage",
                  "Un micro-cravate, parce que le son d'une salle pleine à 15 mètres n'a jamais aidé personne",
                  "Une sauvegarde. Puis une deuxième sauvegarde.",
                ],
              },
            ],
            width: 60,
          },
          {
            text: [
              { subtitle: "Les délais, toujours serrés" },
              {
                paragraph:
                  "Entre la validation du programme et l'envoi de la vidéo, il reste en général trois jours. Quatre si on a de la chance. Le secret : commencer le montage avant que tous les rushes soient arrivés, et espérer que la meilleure prise ne soit pas la toute dernière.",
              },
            ],
            width: 60,
          },
        ],
      },
      {
        columns: [
          {
            text: [
              { subtitle: "Ce qui sert vraiment, au-delà du logiciel" },
              {
                list: [
                  "Rédiger un plan de montage avant d'ouvrir le logiciel, pas pendant",
                  "Regarder les rushes une fois en entier avant de couper quoi que ce soit",
                  "Voir aussi la page [Communication Visuelle](/#projets) pour les affiches qui annoncent ces événements",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}
