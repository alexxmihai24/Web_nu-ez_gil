import type { LucideIcon } from 'lucide-react';
import {
  SprayCan,
  UtensilsCrossed,
  CookingPot,
  Package,
  ShieldPlus,
  Armchair,
} from 'lucide-react';

/**
 * Capa de PRESENTACIÓN (no es taxonomía de BD): agrupa los 13 departamentos en
 * 6 universos comprensibles para el mega-menú y la home (ver ux-arquitectura.md §1.2).
 * Los `slug` coinciden con los slugs reales de departamento del catálogo; el árbol
 * canónico lo aporta `getDepartments()`. Esta config solo define el AGRUPADOR visual.
 */
export interface DepartamentoUniverso {
  name: string;
  slug: string;
}

export interface Universo {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Color de acento del icono (clase Tailwind de texto). */
  departments: DepartamentoUniverso[];
}

export const UNIVERSOS: Universo[] = [
  {
    id: 'limpieza',
    name: 'Limpieza e higiene',
    icon: SprayCan,
    departments: [
      { name: 'Química industrial', slug: 'quimica-industrial' },
      { name: 'Artículos de limpieza', slug: 'articulos-de-limpieza' },
      { name: 'Celulosa y dispensadores', slug: 'celulosa-industrial-y-dispensadores' },
      { name: 'Aseo personal', slug: 'aseo-personal' },
    ],
  },
  {
    id: 'mesa-sala',
    name: 'Hostelería · Mesa y sala',
    icon: UtensilsCrossed,
    departments: [
      { name: 'En la mesa', slug: 'en-la-mesa' },
      { name: 'Cristalería', slug: 'cristaleria' },
      { name: 'En la sala', slug: 'en-la-sala' },
    ],
  },
  {
    id: 'cocina',
    name: 'Cocina y maquinaria',
    icon: CookingPot,
    departments: [
      { name: 'En la cocina', slug: 'en-la-cocina' },
      { name: 'Maquinaria de hostelería', slug: 'maquinaria-hosteleria' },
    ],
  },
  {
    id: 'consumibles',
    name: 'Consumibles y un solo uso',
    icon: Package,
    departments: [{ name: 'Consumibles y un solo uso', slug: 'consumibles-y-un-solo-uso' }],
  },
  {
    id: 'sanidad',
    name: 'Sanidad, salud y protección',
    icon: ShieldPlus,
    departments: [{ name: 'Sanidad, salud y protección', slug: 'sanidad-salud-y-proteccion' }],
  },
  {
    id: 'equipamiento',
    name: 'Equipamiento y automoción',
    icon: Armchair,
    departments: [
      { name: 'Mobiliario', slug: 'mobiliario' },
      { name: 'Automoción', slug: 'automocion' },
    ],
  },
];
