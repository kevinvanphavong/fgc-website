/**
 * Types partagés du tunnel de réservation anniversaire.
 *
 * Source de vérité business : `apps/api/src/Dto/BirthdayReservationInput.php`
 * (côté serveur — toutes les règles front sont rejouées là-bas, donc
 * la moindre divergence est rattrapée par une 422).
 */

export type StepKey =
  | 'formule'
  | 'date'
  | 'enfant'
  | 'coordonnees'
  | 'recap'
  | 'confirmation';

export const STEP_ORDER: StepKey[] = [
  'formule',
  'date',
  'enfant',
  'coordonnees',
  'recap',
  'confirmation',
];

/** Représentation TS d'une AnnivCard renvoyée par l'API. */
export interface AnnivFormule {
  '@id'?: string;
  id: number;
  key: 'newbowler' | 'superbowler' | 'probowler';
  icon: string;
  name: string;
  age: string;
  price: string;          // string d'affichage (ex. "22,50€/enfant")
  unitPriceCents: number; // pour calculer le total
  minKids: number;
  duration: string;
  tagline: string;
  features: string[];
  featured: boolean;
  position: number;
}

export interface AvailabilitySlot {
  value: string;
  label: string;
  period: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  minDate: string;
  dateTooSoon: boolean;
  slots: AvailabilitySlot[];
}

export interface ReservationConfirmation {
  '@id'?: string;
  id: number;
  reference: string;
  status: 'nouveau' | 'contacte' | 'confirme' | 'refuse' | 'passe';
  formuleKey: string;
  eventDate: string;
  timeSlot: string;
  createdAt: string;
}

/** State persistée du tunnel — clé sessionStorage `fgc.anniv.draft`. */
export interface TunnelDraft {
  step: StepKey;
  formuleKey: AnnivFormule['key'] | null;
  date: string | null;     // YYYY-MM-DD
  timeSlot: string | null; // HH:mm
  childName: string;
  childAge: number | null;
  kidsCount: number | null;
  cakeNote: string;
  allergies: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  source: string;
  message: string;
  acceptCGV: boolean;
  acceptNewsletter: boolean;
  upsellVR: boolean;
  /** Renseigné uniquement à la confirmation finale. */
  reservation: ReservationConfirmation | null;
}

export const EMPTY_DRAFT: TunnelDraft = {
  step: 'formule',
  formuleKey: null,
  date: null,
  timeSlot: null,
  childName: '',
  childAge: null,
  kidsCount: null,
  cakeNote: '',
  allergies: '',
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  source: '',
  message: '',
  acceptCGV: false,
  acceptNewsletter: false,
  upsellVR: false,
  reservation: null,
};

/** Mapping clé → token de couleur Tailwind (cf. DS, pas de hex en dur). */
export const FORMULE_TOKEN: Record<
  AnnivFormule['key'],
  {
    chipBg: string;       // background pill « chip »
    chipText: string;
    ring: string;         // border selected
    icon: string;         // emoji background
    glowBg: string;
  }
> = {
  newbowler: {
    chipBg: 'bg-fgc-silver-formule/20',
    chipText: 'text-fgc-silver-formule',
    ring: 'border-fgc-silver-formule',
    icon: 'bg-fgc-silver-formule/30 text-fgc-cream',
    glowBg: 'from-fgc-silver-formule/10',
  },
  superbowler: {
    chipBg: 'bg-fgc-yellow/15',
    chipText: 'text-fgc-yellow',
    ring: 'border-fgc-yellow',
    icon: 'bg-fgc-yellow/20 text-fgc-yellow',
    glowBg: 'from-fgc-yellow/10',
  },
  probowler: {
    chipBg: 'bg-fgc-pink-hot/15',
    chipText: 'text-fgc-pink-hot',
    ring: 'border-fgc-pink-hot',
    icon: 'bg-fgc-pink-hot/20 text-fgc-pink-hot',
    glowBg: 'from-fgc-pink-hot/10',
  },
};
