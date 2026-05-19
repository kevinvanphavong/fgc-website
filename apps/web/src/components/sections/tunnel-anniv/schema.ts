/**
 * Schémas Zod par étape — utilisés pour valider en local avant POST.
 * Les mêmes règles vivent côté API (BirthdayReservationInput) : c'est
 * normal et voulu (CLAUDE.md §6.4 « toutes les règles front sont
 * rejouées côté API »). Le front est juste plus rapide / explicite.
 */
import { z } from 'zod';

export const formuleKeySchema = z.enum(['newbowler', 'superbowler', 'probowler']);

export const timeSlotSchema = z.enum([
  '10:00',
  '14:00',
  '14:30',
  '16:00',
  '16:30',
  '17:00',
]);

/** Téléphone mobile FR — même regex que côté API. */
const phoneRegex = /^(?:(?:\+33|0)\s?[67](?:\s?\d{2}){4})$/;

export const step1Schema = z.object({
  formuleKey: formuleKeySchema,
});

export const step2Schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
    .refine((d) => {
      const date = new Date(d + 'T00:00:00');
      const min = new Date();
      min.setHours(0, 0, 0, 0);
      min.setDate(min.getDate() + 7);
      return date >= min;
    }, 'Réservation à partir de J+7'),
  timeSlot: timeSlotSchema,
});

export const step3Schema = (minKids: number) =>
  z.object({
    childName: z.string().trim().min(1, 'Prénom requis').max(80, 'Max 80 caractères'),
    childAge: z
      .number({ invalid_type_error: 'Indiquez l’âge' })
      .int()
      .min(4, 'Min 4 ans')
      .max(14, 'Max 14 ans'),
    kidsCount: z
      .number({ invalid_type_error: 'Nombre d’enfants requis' })
      .int()
      .min(minKids, `Minimum ${minKids} enfants pour cette formule`)
      .max(25, 'Maximum 25 enfants (au-delà, contactez-nous)'),
    cakeNote: z.string().max(300).optional(),
    allergies: z.string().max(300).optional(),
  });

export const step4Schema = z.object({
  parentFirstName: z.string().trim().min(1, 'Prénom requis').max(80),
  parentLastName: z.string().trim().min(1, 'Nom requis').max(80),
  parentEmail: z.string().trim().email('Email invalide').max(180),
  parentPhone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Numéro de mobile FR attendu (06 ou 07)'),
  source: z
    .enum(['', 'amis', 'instagram', 'facebook', 'google', 'passage', 'autre'])
    .optional()
    .or(z.literal('')),
  message: z.string().max(1000).optional(),
  acceptCGV: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
  acceptNewsletter: z.boolean(),
});

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step4Values = z.infer<typeof step4Schema>;
