export const WEEKDAYS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'] as const;
export type Weekday = (typeof WEEKDAYS)[number];
const LABELS: Record<string, string> = {
  segunda: 'Segunda-feira',
  terça: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sábado: 'Sábado',
  domingo: 'Domingo',
};
const SHORT: Record<string, string> = {
  segunda: 'Segunda',
  terça: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sábado: 'Sábado',
  domingo: 'Domingo',
};
export const weekdayLabel = (value: string): string => LABELS[value] ?? value;
export const weekdayShort = (value: string): string => SHORT[value] ?? value;
export const weekdayIndex = (value: string): number => Math.max(0, WEEKDAYS.indexOf(value as Weekday));
