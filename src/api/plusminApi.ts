import { useCallback } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { Stand } from '../model/Saldo';
import { useAuthContext } from '@asgardeo/auth-react';
import { CashFlow } from '../model/CashFlow';
import { Betaling, BetalingDTO } from '../model/Betaling';

async function fetchData<T>(
  endpoint: string,
  bearerToken: string,
  method: string = 'GET',
  body?: unknown,
) {
  const response = await fetch(`${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json() as T;
}

function usePlusminApi() {
  const { getIDToken } = useAuthContext();

  const getGebruikerZelf = useCallback(async () => {
    const token = await getIDToken();
    return fetchData<{
      gebruiker: Gebruiker;
      hulpvragers: Gebruiker[];
    }>('/api/v1/gebruiker/zelf', token);
  }, [getIDToken]);

  const getRekeningenVoorHulpvragerEnPeriode = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<RekeningGroepPerBetalingsSoort[]>(
        `/api/v1/rekening/hulpvrager/${hulpvrager.id}/periode/${periode.id}`,
        token,
      );
    },
    [getIDToken],
  );

  const getCashFlowVoorHulpvragerEnPeriode = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<CashFlow[]>(
        `/api/v1/rekening/hulpvrager/${hulpvrager.id}/periode/${periode.id}/cashflow`,
        token,
      );
    },
    [getIDToken],
  );

  const getBetalingenVoorHulpvragerVoorPeriode = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<{
        data: { content: BetalingDTO[] };
        gebruikersId: string;
        gebruikersEmail: string;
        gebruikersBijnaam: string;
      }>(
        `/api/v1/betalingen/hulpvrager/${hulpvrager.id}?fromDate=${periode.periodeStartDatum}&toDate=${periode.periodeEindDatum}&size=-1`,
        token,
      );
    },
    [getIDToken],
  );

  const getOngeldigeBetalingenVoorHulpvrager = useCallback(
    async (hulpvrager: Gebruiker) => {
      const token = await getIDToken();
      return fetchData<Betaling[]>(
        `/api/v1/betalingen/hulpvrager/${hulpvrager.id}/valideer-betalingen`,
        token,
      );
    },
    [getIDToken],
  );

  const getStandVoorHulpvragerEnDatum = useCallback(
    async (hulpvrager: Gebruiker, datum: string) => {
      const token = await getIDToken();
      return fetchData<Stand>(
        `/api/v1/stand/hulpvrager/${hulpvrager.id}/datum/${datum}`,
        token,
      );
    },
    [getIDToken],
  );

  return {
    getGebruikerZelf,
    getRekeningenVoorHulpvragerEnPeriode,
    getStandVoorHulpvragerEnDatum,
    getCashFlowVoorHulpvragerEnPeriode,
    getBetalingenVoorHulpvragerVoorPeriode,
    getOngeldigeBetalingenVoorHulpvrager
  };
}

export { usePlusminApi };
