export type DaySchedule = {
  key: string;
  label: string;
  hours: string;
  jsDay: number;
};

export const SCHEDULE: DaySchedule[] = [
  { key: 'lundi', label: 'Lundi', hours: '17h — 23h', jsDay: 1 },
  { key: 'mardi', label: 'Mardi', hours: '17h — 23h', jsDay: 2 },
  { key: 'mercredi', label: 'Mercredi', hours: '14h — 23h', jsDay: 3 },
  { key: 'jeudi', label: 'Jeudi', hours: '14h — 00h', jsDay: 4 },
  { key: 'vendredi', label: 'Vendredi', hours: '14h — 01h', jsDay: 5 },
  { key: 'samedi', label: 'Samedi', hours: '14h — 02h', jsDay: 6 },
  { key: 'dimanche', label: 'Dimanche', hours: '14h — 22h', jsDay: 0 },
];
