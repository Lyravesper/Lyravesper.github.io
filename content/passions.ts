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
        columns: [
          {
            player: {
              title: "Spells That Bring Happiness",
              composer: "Yuka Kitamura <3",
              cover: "/assets/cover.jpg",
              youtubeUrl:
                "https://www.youtube.com/watch?v=G-8C8Zy3OrY&list=RDG-8C8Zy3OrY",
            },
            width: 40,
          },
          {
            text: [
              { subtitle: "Trouvé un soir à minuit passé, écouté depuis en boucle" },
              {
                paragraph:
                  "Découvert en cherchant tout autre chose, et depuis impossible de faire autrement : dès que ça commence, tout le reste attend. Aucune idée de pourquoi celle-là en particulier — certaines chansons choisissent leur moment, pas l'inverse.",
              },
              {
                paragraph:
                  "Cliquez sur la pochette pour l'écouter, ou directement sur la barre de progression pour sauter au meilleur passage — comme tout le monde le fait, en vrai.",
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
