export type Climate = "humid" | "room" | "travel";

export type Stage = "first" | "second" | "later" | "concept";

/** Closed until manufacturing, documentation, and regulatory review exist. */
export const purchasesOpen = false;

export const stageLabel: Record<Stage, string> = {
  first: "Planned first product",
  second: "Planned second product",
  later: "Later in the collection",
  concept: "Concept set, not a launch offer",
};

export const sampleNotice = "Sample formula. Not a finished product and not for sale.";

export const conceptPriceNote = "Concept price. Not a selling price.";

export type Product = {
  slug: string;
  name: string;
  kind: string;
  stage: Stage;
  priceUsd: number;
  compareAtUsd?: number;
  size: string;
  texture: string;
  climates: Climate[];
  summary: string;
  detail: string;
  use: string[];
  skip: string;
  ingredients: { name: string; note: string }[];
  inci: string;
  includes?: string[];
};

export function publicPriceUsd(product: Product): number | null {
  return product.stage === "concept" ? null : product.priceUsd;
}

export const climateLabel: Record<Climate, string> = {
  humid: "Humid air",
  room: "Cold rooms",
  travel: "Travel",
};

export const products: Product[] = [
  {
    slug: "two-weather-set",
    name: "Two-Weather Set",
    kind: "Three-piece routine",
    stage: "concept",
    priceUsd: 79,
    size: "Wash, serum, gel",
    texture: "The daytime trio",
    climates: ["humid", "room", "travel"],
    summary:
      "Day Wash, Water Veil, and Shade Gel. The routine for a day that starts in a cold room and ends on a hot street.",
    detail:
      "A concept grouping of Day Wash, Water Veil, and Shade Gel. It is not a launch offer and it has no selling price. Cabin Balm is not in the set. It is for flights and long hours of dry air, and it stays a separate small tin.",
    use: [
      "Morning in the heat: wash, veil, shade gel.",
      "Afternoon in the office: do not wash again. Press on a drop of Water Veil if your cheeks feel tight.",
      "Keep Cabin Balm for the airplane and the hotel.",
    ],
    skip: "This is not a sunscreen, and it is not a treatment for acne, eczema, or aging.",
    ingredients: [
      {
        name: "Three textures",
        note: "A rinse, a watery layer, and a gel that stays light at noon.",
      },
      {
        name: "No fragrance",
        note: "The sample formulas are unscented, so the products are judged on feel.",
      },
    ],
    inci: "See each product. These are sample formulas for the preview, not a finished factory specification.",
    includes: ["day-wash", "water-veil", "shade-gel"],
  },
  {
    slug: "day-wash",
    name: "Day Wash",
    kind: "Gel cleanser",
    stage: "later",
    priceUsd: 22,
    size: "120 ml",
    texture: "Clear, low-foam gel",
    climates: ["humid", "travel"],
    summary:
      "A clear gel for sweat, city dust, and the film a humid morning leaves on the skin. It rinses clean and does not leave a squeak.",
    detail:
      "Heavy cleansers make sense in a cold city and feel harsh once you live in air-conditioning all afternoon. Day Wash is meant to be boring, in a good way: enough to remove the day, not so much that the skin feels stripped before the serum.",
    use: [
      "Use morning and night on wet skin.",
      "One pump is enough. Rinse with lukewarm water.",
      "Follow with Water Veil while the skin is still damp.",
    ],
    skip: "Do not use it as a scrub, and do not expect it to treat breakouts. It only cleans.",
    ingredients: [
      {
        name: "Glycerin",
        note: "Holds water so the wash does not feel tight after rinsing.",
      },
      {
        name: "Mild cleanser",
        note: "A low-foam surfactant blend, not a squeaky detergent.",
      },
      {
        name: "Panthenol",
        note: "Included for a soft feel on the skin after you rinse.",
      },
    ],
    inci: "Aqua, Glycerin, Cocamidopropyl Betaine, Sodium Cocoyl Isethionate, Panthenol, Allantoin, Citric Acid, Sodium Benzoate, Potassium Sorbate. Sample formula, not a production specification.",
  },
  {
    slug: "water-veil",
    name: "Water Veil",
    kind: "Hydrating serum",
    stage: "first",
    priceUsd: 36,
    size: "30 ml",
    texture: "Watery serum",
    climates: ["humid", "room", "travel"],
    summary:
      "Humectants in a thin serum. It sits under a gel on a hot day, and it is what you press on before dry air-conditioning pulls water out of the skin.",
    detail:
      "This is the product the brand is built around. Hot air wants something weightless. Cold indoor air wants water. A rich serum tries to be both and usually feels like a film. Water Veil stays thin, and the next step changes with the room you are walking into.",
    use: [
      "After washing, on damp skin. Two or three drops.",
      "In heat, follow with Shade Gel.",
      "In a cold room or on a flight, follow with a grain of Cabin Balm on the dry parts only.",
    ],
    skip: "It will not replace a moisturizer in desert wind, and it is not a medicine.",
    ingredients: [
      {
        name: "Glycerin",
        note: "The main water-binding ingredient.",
      },
      {
        name: "Sodium PCA",
        note: "Another humectant, for a light, non-greasy feel.",
      },
      {
        name: "Beta-glucan",
        note: "Included for a comfortable, cushioned look. Not a treatment.",
      },
    ],
    inci: "Aqua, Glycerin, Propanediol, Beta-Glucan, Panthenol, Sodium PCA, Trehalose, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin. Sample formula, not a production specification.",
  },
  {
    slug: "shade-gel",
    name: "Shade Gel",
    kind: "Lightweight moisturizer",
    stage: "second",
    priceUsd: 32,
    size: "50 ml",
    texture: "Cooling gel cream",
    climates: ["humid"],
    summary:
      "The daytime layer for heat. It cools, then disappears. It is not a rich cream, and it should not be one: rich creams melt and travel into the eyes.",
    detail:
      "Shade Gel is for 33 degrees and a humid street, or for a motorbike ride across Bangkok at 5pm. A little squalane keeps it from feeling like plain aloe. If the afternoon is spent in a cold office, you may not need it at all.",
    use: [
      "Last step in the morning when you are going out into heat.",
      "Use less than you think. A pea is a starting point for the whole face.",
      "Skip it on flight days and use Cabin Balm on the dry areas instead.",
    ],
    skip: "This is not sunscreen. Wear a sunscreen that is legal where you live.",
    ingredients: [
      {
        name: "Glycerin",
        note: "Keeps the gel from feeling like it vanishes in ten minutes.",
      },
      {
        name: "Squalane",
        note: "A small amount of slip, so the gel is not only water.",
      },
      {
        name: "Niacinamide",
        note: "A familiar cosmetic ingredient, kept modest in this sample formula.",
      },
    ],
    inci: "Aqua, Glycerin, Propanediol, Squalane, Niacinamide, Ammonium Acryloyldimethyltaurate/VP Copolymer, Panthenol, Phenoxyethanol, Ethylhexylglycerin. Sample formula, not a production specification.",
  },
  {
    slug: "cabin-balm",
    name: "Cabin Balm",
    kind: "Face balm",
    stage: "later",
    priceUsd: 18,
    size: "15 ml",
    texture: "Soft balm",
    climates: ["room", "travel"],
    summary:
      "A small tin for recycled air: the airplane, the hotel, the office set to 22 degrees. A grain on the cheeks and around the mouth.",
    detail:
      "People who move between climates often own one cream and use it everywhere. That cream is too heavy outside and too thin on a night flight. Cabin Balm is the indoors piece, on purpose. It is small because you should not need much, and because a 15 ml tin is easy to put in a bag.",
    use: [
      "After Water Veil, only where the skin feels papery.",
      "On a flight, warm a grain between fingers and press it on.",
      "Do not spread it over the whole face before walking into humid heat.",
    ],
    skip: "Not a daytime moisturizer for a Bangkok sidewalk.",
    ingredients: [
      {
        name: "Shea butter",
        note: "The body of the balm. Soft, not a hard wax.",
      },
      {
        name: "Squalane",
        note: "Thins the butter so it presses in instead of sitting in a stripe.",
      },
      {
        name: "Tocopherol",
        note: "Vitamin E, here to help keep the oils stable in the tin.",
      },
    ],
    inci: "Butyrospermum Parkii Butter, Caprylic/Capric Triglyceride, Squalane, Helianthus Annuus Seed Oil, Tocopherol. Sample formula, not a production specification.",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function relatedProducts(slug: string) {
  const current = getProduct(slug);
  if (!current) return [];
  return products
    .filter(
      (product) =>
        product.slug !== slug &&
        product.climates.some((climate) => current.climates.includes(climate)),
    )
    .slice(0, 3);
}

export const routineSteps = [
  {
    title: "Humid morning",
    air: "Outside, around 33°C",
    steps: ["Day Wash", "Water Veil", "Shade Gel"],
    note: "Then a sunscreen you already trust, bought where it is allowed to be sold.",
  },
  {
    title: "Cold room",
    air: "Office or apartment, around 22°C",
    steps: ["Leave the morning layers", "A drop of Water Veil if cheeks feel tight"],
    note: "Do not wash again at your desk. Water, not more foam, is the fix.",
  },
  {
    title: "Flight or hotel",
    air: "Recycled, dry air",
    steps: ["Day Wash if you want a reset", "Water Veil", "Cabin Balm on dry spots"],
    note: "Shade Gel stays in the bag until you are back in real heat.",
  },
] as const;
