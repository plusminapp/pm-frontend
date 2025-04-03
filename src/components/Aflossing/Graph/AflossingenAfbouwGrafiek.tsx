import { AgCharts } from "ag-charts-react";
import { AgAreaSeriesOptions, AgChartOptions } from "ag-charts-community";
import { getData, getSeries } from "./AflossingGrafiekData";
import { useCustomContext } from "../../../context/CustomContext";
import { AflossingDTO } from "../../../model/Aflossing";
import dayjs from "dayjs";

type AflossingenAfbouwGrafiekProps = {
  aflossingen: AflossingDTO[];
};

export const AflossingenAfbouwGrafiek = (props: AflossingenAfbouwGrafiekProps) => {

  const { gekozenPeriode } = useCustomContext();
  const getoondePeriode = dayjs(gekozenPeriode?.periodeEindDatum).format("YYYY-MM");

  const chartOptions: AgChartOptions = {
    data: Object.values(getData(props.aflossingen)),
    series: getSeries(props.aflossingen) as AgAreaSeriesOptions[],
    axes: [
      {
        type: "category",
        position: "bottom",
        crossLines: [
          {
            type: 'line',
            value: getoondePeriode,
            label: {
              text: getoondePeriode,
              position: 'top',
              fontSize: 12,
            },
          },
        ],
        label: {
          formatter: (params: { index: number; value: string }) =>
            params.index % 6 === 0 ? params.value : "",
        },
      },
      {
        type: "number",
        position: "left",
        label: {
          formatter: (params) => {
            return `${new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", }).format(params.value)}`;
          },
        },
      },
    ],
    height: 400,
  };

  return <AgCharts options={chartOptions} />;
};
