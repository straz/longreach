import { parse } from 'yaml';
import taxonomyYaml from '../../taxonomy.yml?raw';

export interface Card {
  id: string;
  name: string;
  description: string;
  category: string;
}

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
