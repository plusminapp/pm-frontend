import dayjs from 'dayjs';

export type AflossingDTO = {
  id: string;
  startDatum: dayjs.Dayjs;
  schuldOpStartDatum: number;
  dossierNummer: string;
  notities: string;
};
