import { parse } from 'yaml';
import taxonomyYaml from '../../taxonomy.yml?raw';

export interface Card {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
}

export const categoryColors: Record<string, string> = {
  'Congenital':    '#8B0000',  // Dark red
  'Malnutrition':  '#D2691E',  // Chocolate orange
  'Parasites':     '#228B22',  // Forest green
  'Recognition':   '#6A0DAD',  // Purple
  'Behavioral':    '#4169E1',  // Royal blue
  'Degenerative':  '#8B4513',  // Saddle brown
  'Governance':    '#DAA520',  // Goldenrod
  'Control':       '#708090',  // Slate gray
  'Human Impact':  '#008B8B',  // Dark cyan
};

interface Condition {
  code: string;
  name: string;
  category: string;
  short_description: string;
  full_description: string;
  vectors?: string[];
  image?: string;
}

interface Taxonomy {
  taxonomy_name: string;
  conditions: Condition[];
}

function extractCards(taxonomy: Taxonomy): Card[] {
  return taxonomy.conditions.map((condition, i) => ({
    id: `card-${String(i + 1).padStart(2, '0')}`,
    name: condition.name,
    description: condition.short_description,
    category: condition.category,
    image: condition.image ?? '',
  }));
}

const taxonomy = parse(taxonomyYaml) as Taxonomy;
export const cards: Card[] = extractCards(taxonomy);
