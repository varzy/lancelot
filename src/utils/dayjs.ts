import * as Dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

Dayjs.extend(utc);
Dayjs.extend(timezone);
Dayjs.extend(isSameOrAfter);
Dayjs.extend(isSameOrBefore);

export { Dayjs };
