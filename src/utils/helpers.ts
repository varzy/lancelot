import { Dayjs } from './dayjs';

export const getRegularTime = (date: string | Date | Dayjs.Dayjs = new Date()) =>
  Dayjs(date).format('YYYY-MM-DD hh:mm:ss');

export const getIsoTimeCST = (date: string | Date | Dayjs.Dayjs = new Date()) =>
  Dayjs(date).format('YYYY-MM-DDTHH:mm:ss+0800');

export const getRandomStr = () => (Math.random() + 1).toString(36).substring(7);
