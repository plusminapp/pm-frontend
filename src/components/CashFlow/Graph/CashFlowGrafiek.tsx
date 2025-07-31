import { useCallback, useEffect, useState, useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import { useCustomContext } from "../../../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import { CashFlow } from "../../../model/CashFlow";
import dayjs from "dayjs";


export const CashFlowGrafiek = () => {
  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode } = useCustomContext();

  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);

  const fetchCashFlow = useCallback(async () => {
    if (!actieveHulpvrager || !gekozenPeriode) {
      return;
    }
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
    }

    const responseCashFlow = await fetch(`/api/v1/rekening/hulpvrager/${actieveHulpvrager.id}/periode/${gekozenPeriode.id}/cashflow`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    const cashflowData = await responseCashFlow.json();
    setCashFlow(cashflowData as CashFlow[]);

  }, [actieveHulpvrager, gekozenPeriode, getIDToken]);

  useEffect(() => {
    if (actieveHulpvrager && gekozenPeriode) {
      void fetchCashFlow();
    }
  }, [actieveHulpvrager, fetchCashFlow, gekozenPeriode]);

  const options = useMemo<AgChartOptions>(() => ({
    title: {
      text: "Periode cashflow",
    },
    data: cashFlow,
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
        marker: { size: 4, fill: 'grey' },
      },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: {
          formatter: (params: { value: string; index: number }) => {
            return dayjs(params.value).format('D/M');
          }
        }
      },
      {
        type: 'number',
        position: 'left',
        label: {
          formatter: (params: { value: number }) =>
            params.value.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
        }
      }
    ],
  }), [cashFlow]);
  return <AgCharts options={options} style={{ height: '500px' }} />;
};