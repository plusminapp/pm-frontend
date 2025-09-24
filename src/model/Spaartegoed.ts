import dayjs from 'dayjs';

export type SpaartegoedDTO = {
  startDatum: dayjs.Dayjs;
  eindDatum: dayjs.Dayjs | undefined;
  eindBedrag: number;
  spaartegoedsBedrag: number;
  betaalDag: number;
  notities: string;
};

export type SpaartegoedSamenvattingDTO = {
  spaartegoedNaam: string;
  spaartegoedsBedrag: number;
  betaalDag: number;
};
