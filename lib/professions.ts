/**
 * Global profession values and types
 * Used sitewide for profile, test drive forms, and data validation
 */

export const PROFESSION_VALUES = new Set([
  'BUSINESSMAN',
  'ENGINEER',
  'DOCTOR',
  'EMPLOYEE_GOVT',
  'EMPLOYEE_PVT',
  'TEACHER',
  'SELF_EMPLOYED',
  'ACTORS_INFLUENCER',
  'GAMERS_STREAMERS',
  'STUDENT',
  'OTHER',
]);

export type ProfessionType =
    'BUSINESSMAN'
  | 'ENGINEER'
  | 'DOCTOR'
  | 'EMPLOYEE_GOVT'
  | 'EMPLOYEE_PVT'
  | 'TEACHER'
  | 'SELF_EMPLOYED'
  | 'ACTORS_INFLUENCER'
  | 'GAMERS_STREAMERS'
  | 'STUDENT'
  | 'OTHER'
  | '';

export const PROFESSION_OPTIONS: Array<{ value: ProfessionType; label: string }> = [
  { value: '', label: 'Select profession' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'ENGINEER', label: 'Engineer' },
  { value: 'BUSINESSMAN', label: 'Businessman' },
  { value: 'EMPLOYEE_GOVT', label: 'Government Employee' },
  { value: 'EMPLOYEE_PVT', label: 'Private Employee' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'ACTORS_INFLUENCER', label: 'Actor/Influencer' },
  { value: 'GAMERS_STREAMERS', label: 'Gamer/Streamer' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'OTHER', label: 'Other' },
];

export function sanitizeProfession(input: unknown): ProfessionType | null {
  if (input == null || input === '') return null;
  if (typeof input !== 'string') return null;
  const normalized = input.trim().toUpperCase();
  return PROFESSION_VALUES.has(normalized) ? (normalized as ProfessionType) : null;
}
