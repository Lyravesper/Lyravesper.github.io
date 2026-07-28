import type { DetailPage } from "@/lib/detail-content"

/** Same schema as content/projets.ts — see that file for the full cheat-sheet. */
export const passions: Record<string, DetailPage> = {
  musique: {
    title: "Musique",
    rows: [
      {
        columns: [
          {
            text: [
              {
                paragraph:
                  "Il y a une playlist pour chaque étape d'un événement culturel : une pour préparer les affiches (calme, concentrée), une pour la veille du vernissage (café, stress, un peu de tout), et une, plus honteuse, pour le rangement de la salle une fois tout le monde parti.",
              },
              {
                paragraph:
                  "Je découvre en général les artistes bien après tout le monde, ce qui ne m'empêche pas d'en parler avec l'enthousiasme de quelqu'un qui vient de faire une découverte archéologique. **Désolée d'avance** si vous m'entendez chanter faux dans le bureau : la porte ferme mal.",
              },
            ],
          },
        ],
      },
      {
        width: 70,
        columns: [
          {
            image: "/assets/r6.jpg",
            alt: "Vinyles et enceinte",
            width: 45,
          },
          {
            text: [
              { subtitle: "En rotation ces temps-ci" },
              {
                list: [
                  "Un peu de tout, honnêtement",
                  "Ce que la médiathèque a mis en avant cette semaine",
                  "La bande-son du dernier vernissage, en boucle, sans l'avoir vraiment décidé",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}
