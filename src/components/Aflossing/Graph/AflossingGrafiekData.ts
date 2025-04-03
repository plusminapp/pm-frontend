import dayjs from "dayjs";
import { AflossingDTO } from "../../../model/Aflossing";
import { Saldo } from "../../../model/Saldo";

type AflossingGrafiekData = {
  maand: string;
  aflossingSaldi: Saldo;
};

type AflossingGrafiekDataMap = Record<string, Record<string, number>>;

export function getData(aflossingen: AflossingDTO[]): Record<string, any>[] {
  const aflossingGrafiekDataLijst = aflossingen.flatMap(genereerAflossingSaldi);
  const aflossingGrafiekDataMap: AflossingGrafiekDataMap = aflossingGrafiekDataLijst.reduce((acc, item) => {
    if (!acc[item.maand]) {
      acc[item.maand] = {};
    }
    const key = item.aflossingSaldi.rekeningNaam.replace(/\s/g, '').toLowerCase();
    acc[item.maand][key] = item.aflossingSaldi.bedrag;
    return acc;
  }, {} as AflossingGrafiekDataMap);

  const result: Record<string, any>[] = Object.entries(aflossingGrafiekDataMap).map(([maand, saldi]) => ({
    month: maand,
    ...saldi,
  }));
  return result;
}

const genereerAflossingSaldi = (aflossing: AflossingDTO): AflossingGrafiekData[] => {
  const formatter = "YYYY-MM";
  const aflossingGrafiekDataLijst: AflossingGrafiekData[] = [];
  let huidigeMaand = dayjs(aflossing.startDatum).startOf("month");
  let huidigeBedrag = aflossing.eindBedrag;

  while (huidigeBedrag > 0) {
    aflossingGrafiekDataLijst.push({
      maand: huidigeMaand.format(formatter),
      aflossingSaldi: {
        id: 0,
        rekeningNaam: aflossing.rekening.naam,
        bedrag: huidigeBedrag,
      },
    });
    huidigeBedrag -= aflossing.aflossingsBedrag;
    huidigeMaand = huidigeMaand.add(1, "month");
  }
  return aflossingGrafiekDataLijst;
}


export function getSeries(aflossingen: AflossingDTO[]) {
  return aflossingen.map((aflossing) => {
    return {
      type: "area",
      xKey: "month",
      yKey: aflossing.rekening.naam.toLowerCase().replace(/\s/g, ''),
      yName: aflossing.rekening.naam,
      stacked: true,
    };
  })
}
