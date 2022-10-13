import { Dayjs } from './dayjs';

export const getRegularTime = (date: string | Date | Dayjs.Dayjs = new Date()) =>
  Dayjs(date).format('YYYY-MM-DD hh:mm:ss');

export const getIsoTime = (date: string | Date | Dayjs.Dayjs = new Date()) =>
  Dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ');
