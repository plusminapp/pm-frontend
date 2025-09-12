import dayjs from 'dayjs';
import { SaldoDTO } from '../../../model/Saldo';

type AflossingGrafiekData = {
  maand: string;
  rekeningNaam: string;
  bedrag: number;
};

type AflossingGrafiekDataMap = Record<string, Record<string, number>>;

export function getData(aflossingSaldi: SaldoDTO[]): Record<string, any>[] {
  const aflossingGrafiekDataLijst = aflossingSaldi.flatMap(
    genereerAflossingSaldi,
  );
  const aflossingGrafiekDataMap: AflossingGrafiekDataMap =
    aflossingGrafiekDataLijst.reduce((acc, item) => {
      if (!acc[item.maand]) {
        acc[item.maand] = {};
      }
      const key = item.rekeningNaam.replace(/\s/g, '').toLowerCase();
      acc[item.maand][key] = item.bedrag;
      return acc;
    }, {} as AflossingGrafiekDataMap);

  const result: Record<string, any>[] = Object.entries(
    aflossingGrafiekDataMap,
  ).map(([maand, saldi]) => ({
    month: maand,
    ...saldi,
  }));
  return result;
}

const genereerAflossingSaldi = (
  aflossingSaldoDTO: SaldoDTO,
): AflossingGrafiekData[] => {
  const formatter = 'YYYY-MM';
  const aflossingGrafiekDataLijst: AflossingGrafiekData[] = [];
  let huidigeBedrag = Number(aflossingSaldoDTO.aflossing?.eindBedrag ?? 0);
  let startAflossing = dayjs(aflossingSaldoDTO.aflossing?.startDatum).startOf(
    'month',
  );
  let startPeilDatumPeriode = dayjs(aflossingSaldoDTO.budgetPeilDatum)
    .subtract(1, 'month')
    .startOf('month');

  let peilMaand = startAflossing;

  while (huidigeBedrag > 0 && peilMaand.isBefore(startPeilDatumPeriode)) {
    aflossingGrafiekDataLijst.push({
      maand: peilMaand.format(formatter),
      rekeningNaam: aflossingSaldoDTO.rekeningNaam,
      bedrag: huidigeBedrag,
    });
    huidigeBedrag -=
      (aflossingSaldoDTO.budgetMaandBedrag ?? 0) +
      (aflossingSaldoDTO.achterstand ?? 0);
    peilMaand = peilMaand.add(1, 'month');
  }

  peilMaand = dayjs(
    startPeilDatumPeriode.isBefore(startAflossing)
      ? startAflossing
      : startPeilDatumPeriode,
  );
  huidigeBedrag = -aflossingSaldoDTO.openingsBalansSaldo;
  aflossingGrafiekDataLijst.push({
    maand: peilMaand.format(formatter),
    rekeningNaam: aflossingSaldoDTO.rekeningNaam,
    bedrag: huidigeBedrag,
  });

  peilMaand = peilMaand.add(1, 'month');
  huidigeBedrag -= aflossingSaldoDTO.betaling ?? 0;

  while (huidigeBedrag > 0) {
    aflossingGrafiekDataLijst.push({
      maand: peilMaand.format(formatter),
      rekeningNaam: aflossingSaldoDTO.rekeningNaam,
      bedrag: huidigeBedrag,
    });
    huidigeBedrag -=
      (aflossingSaldoDTO.budgetMaandBedrag ?? 0) +
      (aflossingSaldoDTO.achterstand ?? 0);
    peilMaand = peilMaand.add(1, 'month');
  }
  return aflossingGrafiekDataLijst;
};

export function getSeries(aflossingSaldi: SaldoDTO[]) {
  return aflossingSaldi.map((aflossing) => {
    return {
      type: 'line',
      xKey: 'month',
      yKey: aflossing.rekeningNaam.toLowerCase().replace(/\s/g, ''),
      yName: aflossing.rekeningNaam,
      stacked: false,
    };
  });
}
