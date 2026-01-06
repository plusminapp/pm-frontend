import dayjs from 'dayjs';

export type SpaarpotDTO = {
  doelDatum: dayjs.Dayjs | undefined;
  doelBedrag: number;
  notities: string;
};

export type SpaarpotSamenvattingDTO = {
  spaarpotNaam: string;
  spaarpotBedrag: number;
  betaalDag: number;
};
