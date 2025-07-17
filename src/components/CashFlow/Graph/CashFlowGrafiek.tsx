import { useState } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import { getData } from "./CashFlowData";

// type AflossingenAfbouwGrafiekProps = {
//   aflossingen: RekeningDTO[];
//   aflossingSaldi: SaldoDTO[];
// };


export const CashFlowGrafiek = () => {
  const [options] = useState<AgChartOptions>({
    title: {
      text: "Periode cashflow",
    },
    data: getData(),
    series: [
      {
        type: "bar",
        xKey: "datum",
        stacked: true,
        yKey: "inkomsten",
        yName: "Inkomsten",
        fill: "green",
      },
      {
        type: "bar",
        xKey: "datum",
        stacked: true,
        yKey: "uitgaven",
        yName: "Uitgaven",
        fill: "red",
      },
      {
        type: "line",
        xKey: "datum",
        yKey: "saldo",
        yName: "Saldo",
        stroke: "grey",
        marker: { size: 4 },
      },
      {
        type: "line",
        xKey: "datum",
        yKey: "prognose",
        yName: "Prognose",
        stroke: "grey",
        lineDash: [10, 4],
        marker: { size: 4, fill: 'grey'},
      },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: {
          formatter: (params: any) => {
            if (params.index % 2 === 0) return params.value;
            return '';
          }
        }
      },
      {
        type: 'number',
        position: 'left',
      }
    ],
  });
  return <AgCharts options={options} style={{ height: '500px' }} />;
};