export type MenuItem = {
  name: string;
  description: string;
  price: string;
};

export type MenuCategory = {
  key: string;
  title: string;
  items: MenuItem[];
};

export type MenuSection = {
  key: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string;
  columns: MenuCategory[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    key: 'cocktails',
    eyebrow: '🍹 Bar à cocktails',
    title: 'Cocktails — ',
    titleAccent: 'avec ou sans alcool.',
    lead: 'Sucrés, fruités, acidulés. Préparés à la minute, version classique ou mocktail sans alcool. Tous nos cocktails démarrent à 7,50 €.',
    columns: [
      {
        key: 'avec-alcool',
        title: 'Avec alcool',
        items: [
          { name: 'Mojito', description: 'Rhum, citron vert, menthe, sucre de canne', price: '8,50€' },
          { name: 'Piña Colada', description: 'Rhum, ananas, lait de coco', price: '9€' },
          { name: 'Tequila Sunrise', description: 'Tequila, orange, grenadine', price: '9€' },
          { name: 'Daiquiri Fraise', description: 'Rhum, fraises fraîches, citron', price: '9,50€' },
          { name: 'Cuba Libre', description: 'Rhum, cola, citron vert', price: '8€' },
          { name: 'Cocktail du chef', description: 'Création de la semaine', price: '10€' },
        ],
      },
      {
        key: 'mocktails',
        title: 'Mocktails — sans alcool',
        items: [
          { name: 'Virgin Mojito', description: 'Citron vert, menthe, sucre, eau gazeuse', price: '7,50€' },
          { name: 'Sunset Tropical', description: 'Mangue, fruit de la passion, citron', price: '7,50€' },
          { name: 'Frozen Berry', description: 'Framboise, fraise, menthe, glace pilée', price: '8€' },
          { name: 'Pink Lemonade', description: 'Citronnade rose, grenadine, basilic', price: '7,50€' },
          { name: 'Blue Lagoon Mocktail', description: 'Citron, sirop bleu, soda', price: '7,50€' },
          { name: 'Cocktail surprise', description: 'Demandez au barman !', price: '8€' },
        ],
      },
    ],
  },
  {
    key: 'smoothies',
    eyebrow: '🥤 Nouveauté Printemps / Été 2026',
    title: 'Smoothies ',
    titleAccent: '& Milkshakes.',
    lead: 'Frais, gourmands, vitaminés. À déguster sur place ou à emporter en gobelet refermable. Dès 4,90 €.',
    columns: [
      {
        key: 'smoothies',
        title: 'Smoothies',
        items: [
          { name: 'Mango Sunrise', description: 'Mangue, ananas, orange', price: '4,90€' },
          { name: 'Berry Boost', description: 'Fraise, framboise, banane', price: '4,90€' },
          { name: 'Green Energy', description: 'Pomme, kiwi, épinard, gingembre', price: '5,50€' },
          { name: 'Pitaya Pink', description: 'Fruit du dragon, banane, coco', price: '5,90€' },
        ],
      },
      {
        key: 'milkshakes',
        title: 'Milkshakes',
        items: [
          { name: 'Vanille', description: 'Bourbon, chantilly maison', price: '4,90€' },
          { name: 'Chocolat', description: 'Cacao Valrhona, éclats de brownie', price: '5,50€' },
          { name: 'Cookies & Cream', description: 'Oreo, vanille, chantilly', price: '5,90€' },
          { name: 'Caramel beurre salé', description: 'Glace vanille, caramel breton', price: '5,90€' },
        ],
      },
    ],
  },
  {
    key: 'snacks',
    eyebrow: '🍕 Snacks',
    title: 'Salés ',
    titleAccent: '& sucrés.',
    lead: '',
    columns: [
      {
        key: 'sales',
        title: 'Snacks salés',
        items: [
          { name: 'Pizza Margherita', description: 'Tomate, mozzarella, basilic', price: '11€' },
          { name: 'Pizza Pepperoni', description: 'Tomate, mozza, pepperoni', price: '13€' },
          { name: 'Pizza 4 Fromages', description: 'Mozza, chèvre, bleu, parmesan', price: '14€' },
          { name: 'Croque-Monsieur', description: 'Jambon, emmental, pain brioché', price: '8€' },
          { name: 'Hot-Dog Classic', description: 'Saucisse, oignons, moutarde', price: '7,50€' },
          { name: 'Frites maison', description: 'Pommes de terre fraîches', price: '4,50€' },
          { name: 'Nachos', description: 'Cheddar, jalapeños, guacamole', price: '8,50€' },
        ],
      },
      {
        key: 'sucres',
        title: 'Snacks sucrés',
        items: [
          { name: 'Gaufre Nutella', description: 'Nutella, chantilly', price: '5,50€' },
          { name: 'Gaufre Maxi', description: 'Banane, choco, chantilly', price: '7€' },
          { name: 'Crêpe sucre / citron', description: 'Le classique', price: '4€' },
          { name: 'Crêpe Nutella banane', description: "L'incontournable", price: '6€' },
          { name: 'Brioche perdue', description: 'Caramel beurre salé, glace', price: '6,50€' },
          { name: 'Coupe glacée', description: '3 boules, chantilly, coulis', price: '7€' },
        ],
      },
    ],
  },
];
