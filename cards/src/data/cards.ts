import { parse } from 'yaml';
import taxonomyYaml from '../../taxonomy.yml?raw';

export interface Card {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const categoryColors: Record<string, string> = {
  'Congenital & Genetic': '#8B0000',      // Dark red
  'Nutritional & Metabolic': '#D2691E',   // Chocolate orange
  'Infectious & Parasitic': '#228B22',    // Forest green
  'Perceptual & Recognition': '#6A0DAD',  // Purple
  'Psychological & Behavioral': '#4169E1', // Royal blue
  'Degenerative & Resource': '#8B4513',   // Saddle brown
  'Governance & Autoimmune': '#DAA520',   // Goldenrod
  'Operational & Control': '#708090',     // Slate gray
  'Human-System Interface': '#008B8B',    // Dark cyan
};

interface Disease {
  name: string;
  description: string;
  infection_vectors?: string[];
  subtypes?: Disease[];
}

interface Category {
  name: string;
  description: string;
  diseases: Disease[];
}

interface Taxonomy {
  taxonomy_name: string;
  categories: Category[];
}

function extractCards(taxonomy: Taxonomy): Card[] {
  const cards: Card[] = [];
  let id = 1;

  for (const category of taxonomy.categories) {
    for (const disease of category.diseases) {
      cards.push({
        id: `card-${String(id++).padStart(2, '0')}`,
        name: disease.name,
        description: disease.description,
        category: category.name,
      });
    }
  }

  return cards;
}

const taxonomy = parse(taxonomyYaml) as Taxonomy;
export const cards: Card[] = extractCards(taxonomy);
