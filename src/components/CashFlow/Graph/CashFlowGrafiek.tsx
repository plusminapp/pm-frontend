import { useCallback, useEffect, useState, useMemo } from 'react';
import { AgCharts } from 'ag-charts-react';
import { AgChartOptions } from 'ag-charts-community';
import { useCustomContext } from '../../../context/CustomContext';
import { CashFlow } from '../../../model/CashFlow';
import dayjs from 'dayjs';
import { usePlusminApi } from '../../../api/plusminApi';

export const CashFlowGrafiek = () => {
  const { actieveHulpvrager, gekozenPeriode } = useCustomContext();
  const { getCashFlowVoorHulpvragerEnPeriode } = usePlusminApi();

  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);

  const fetchCashFlow = useCallback(async () => {
    if (!actieveHulpvrager || !gekozenPeriode) {
      return;
    }
    const cashflowData = await getCashFlowVoorHulpvragerEnPeriode(actieveHulpvrager, gekozenPeriode);
    setCashFlow(cashflowData);
  }, [actieveHulpvrager, gekozenPeriode, getCashFlowVoorHulpvragerEnPeriode]);

  useEffect(() => {
    if (actieveHulpvrager && gekozenPeriode) {
      void fetchCashFlow();
    }
  }, [actieveHulpvrager, fetchCashFlow, gekozenPeriode]);

  const options = useMemo<AgChartOptions>(
    () => ({
      title: {
        text: 'Periode cashflow',
      },
      data: cashFlow,
      series: [
        {
          type: 'bar',
          xKey: 'datum',
          stacked: true,
          yKey: 'inkomsten',
          yName: 'Inkomsten',
          fill: 'green',
        },
        {
          type: 'bar',
          xKey: 'datum',
          stacked: true,
          yKey: 'uitgaven',
          yName: 'Uitgaven',
          fill: 'red',
        },
        {
          type: 'bar',
          xKey: 'datum',
          stacked: true,
          yKey: 'spaarReserveringen',
          yName: 'Spaarreserveringen',
          fill: 'blue',
        },
        {
          type: 'bar',
          xKey: 'datum',
          stacked: true,
          yKey: 'aflossing',
          yName: 'Aflossing',
          fill: 'darkred',
        },
        {
          type: 'line',
          xKey: 'datum',
          yKey: 'prognose',
          yName: 'Prognose',
          stroke: 'lightgrey',
          lineDash: [10, 4],
          marker: { size: 7, fill: 'lightgrey' },
        },
        {
          type: 'line',
          xKey: 'datum',
          yKey: 'saldo',
          yName: 'Saldo',
          stroke: 'grey',
          marker: { size: 7, fill: 'grey' },
        },
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          label: {
            formatter: (params: { value: string; index: number }) => {
              return dayjs(params.value).format('D/M');
            },
          },
        },
        {
          type: 'number',
          position: 'left',
          label: {
            formatter: (params: { value: number }) =>
              params.value.toLocaleString('nl-NL', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
              }),
          },
        },
      ],
    }),
    [cashFlow],
  );
  return <AgCharts options={options} style={{ height: '500px' }} />;
};
