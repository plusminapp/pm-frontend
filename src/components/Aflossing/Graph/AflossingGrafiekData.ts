import dayjs from "dayjs";
import { SaldoDTO } from "../../../model/Saldo";
import { RekeningDTO } from "../../../model/Rekening";

type AflossingGrafiekData = {
  maand: string;
  rekeningNaam: string;
  bedrag: number;
};

type AflossingGrafiekDataMap = Record<string, Record<string, number>>;

export function getData(aflossing: RekeningDTO[]): Record<string, any>[] {
  const aflossingGrafiekDataLijst = aflossing.flatMap(genereerAflossingSaldi);
  const aflossingGrafiekDataMap: AflossingGrafiekDataMap = aflossingGrafiekDataLijst.reduce((acc, item) => {
    if (!acc[item.maand]) {
      acc[item.maand] = {};
    }
    const key = item.rekeningNaam.replace(/\s/g, '').toLowerCase();
    acc[item.maand][key] = item.bedrag;
    return acc;
  }, {} as AflossingGrafiekDataMap);

  const result: Record<string, any>[] = Object.entries(aflossingGrafiekDataMap).map(([maand, saldi]) => ({
    month: maand,
    ...saldi,
  }));
  return result;
}

const genereerAflossingSaldi = (aflossingSaldo: RekeningDTO): AflossingGrafiekData[] => {
  const formatter = "YYYY-MM";
  const aflossingGrafiekDataLijst: AflossingGrafiekData[] = [];
  let huidigeMaand = dayjs(aflossingSaldo.aflossing?.startDatum).startOf("month");
  let huidigeBedrag = aflossingSaldo.aflossing?.eindBedrag ?? 0;

  while (huidigeBedrag > 0 && huidigeMaand.isBefore(dayjs())) {
    aflossingGrafiekDataLijst.push({
      maand: huidigeMaand.format(formatter),
      rekeningNaam: aflossingSaldo.naam,
      bedrag: huidigeBedrag,
    });
    huidigeBedrag -= aflossingSaldo.budgetMaandBedrag ?? 0;
    huidigeMaand = huidigeMaand.add(1, "month");
  }

  huidigeMaand = dayjs().startOf("month");
  huidigeBedrag = 1500  //aflossingSaldi.aflossing?. ?? 0;

  while (huidigeBedrag > 0) {
    aflossingGrafiekDataLijst.push({
      maand: huidigeMaand.format(formatter),
      rekeningNaam: aflossingSaldo.naam,
      bedrag: huidigeBedrag,
    });
    huidigeBedrag -= aflossingSaldo.budgetMaandBedrag ?? 0;
    huidigeMaand = huidigeMaand.add(1, "month");
  }
  return aflossingGrafiekDataLijst;
}


export function getSeries(aflossingSaldi: SaldoDTO[]) {
  return aflossingSaldi.map((aflossing) => {
    return {
      type: "area",
      xKey: "month",
      yKey: aflossing.rekeningNaam.toLowerCase().replace(/\s/g, ''),
      yName: aflossing.rekeningNaam,
      stacked: true,
    };
  })
}
