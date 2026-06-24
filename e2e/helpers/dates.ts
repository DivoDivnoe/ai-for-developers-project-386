export const MONDAY = '2026-06-29';
export const TUESDAY = '2026-06-30';
export const WEDNESDAY = '2026-07-01';
export const THURSDAY = '2026-07-02';

export const MONDAY_DAY = 29;
export const TUESDAY_DAY = 30;
export const WEDNESDAY_DAY = 1;
export const THURSDAY_DAY = 2;

export const MONDAY_DATA_DAY = '29.06.2026';
export const TUESDAY_DATA_DAY = '30.06.2026';
export const WEDNESDAY_DATA_DAY = '01.07.2026';
export const THURSDAY_DATA_DAY = '02.07.2026';

export const mondayAt = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return new Date(2026, 5, 29, h, m).toISOString();
};
export const wednesdayAt = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return new Date(2026, 6, 1, h, m).toISOString();
};
