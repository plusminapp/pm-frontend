import dayjs from 'dayjs';

export type AflossingDTO = {
  startDatum: dayjs.Dayjs;
  eindDatum: dayjs.Dayjs | undefined;
  eindBedrag: number;
  aflossingsBedrag: number;
  betaalDag: number;
  dossierNummer: string;
  notities: string;
};

export type AflossingSamenvattingDTO = {
  aflossingNaam: string;
  aflossingsBedrag: number;
  betaalDag: number;
};
