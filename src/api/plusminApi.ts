import { useCallback } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { SaldoDTO, Stand } from '../model/Saldo';
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

  /* Gebruiker */
  const getGebruikerZelf = useCallback(async () => {
    const token = await getIDToken();
    return fetchData<{
      gebruiker: Gebruiker;
      hulpvragers: Gebruiker[];
    }>('/api/v1/gebruikers/zelf', token);
  }, [getIDToken]);

  /* Rekening */
  const getRekeningenVoorHulpvragerEnPeriode = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<RekeningGroepPerBetalingsSoort[]>(
        `/api/v1/rekeningen/hulpvrager/${hulpvrager.id}/periode/${periode.id}`,
        token,
      );
    },
    [getIDToken],
  );

  const getCashFlowVoorHulpvragerEnPeriode = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<CashFlow[]>(
        `/api/v1/rekeningen/hulpvrager/${hulpvrager.id}/periode/${periode.id}/cashflow`,
        token,
      );
    },
    [getIDToken],
  );

  /* Betaling  */
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

  const postBetalingVoorHulpvrager = useCallback(
    async (hulpvrager: Gebruiker, betaling: BetalingDTO) => {
      const token = await getIDToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/hulpvrager/${hulpvrager.id}`,
        token,
        'POST',
        betaling,
      );
    },
    [getIDToken],
  );

  const putBetaling = useCallback(
    async (betaling: BetalingDTO) => {
      const token = await getIDToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/${betaling.id}`,
        token,
        'PUT',
        betaling,
      );
    },
    [getIDToken],
  );

  const deleteBetaling = useCallback(
    async (betaling: BetalingDTO) => {
      const token = await getIDToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/${betaling.id}`,
        token,
        'DELETE',
      );
    },
    [getIDToken],
  );

  const putBetalingValidatie = useCallback(
    async (
      hulpvrager: Gebruiker,
      saldoOpLaatsteBetalingDatum: SaldoDTO,
      betalingen: BetalingDTO[],
    ) => {
      const token = await getIDToken();
      return fetchData<{
        laatsteBetalingDatum: string;
        saldoOpLaatsteBetalingDatum: SaldoDTO;
        betalingen: BetalingDTO[];
      }>(
        `/api/v1/betalingen/hulpvrager/${hulpvrager.id}/betalingvalidatie`,
        token,
        'PUT',
        { saldoOpLaatsteBetalingDatum, betalingen },
      );
    },
    [getIDToken],
  );

  /* Stand */
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

  /* Periode */
  const putPeriodeActie = useCallback(
    async (
      hulpvrager: Gebruiker,
      actie: 'heropenen' | 'sluiten' | 'opruimen',
      periode: Periode,
    ) => {
      const token = await getIDToken();
      return fetchData(
        `/api/v1/periodes/hulpvrager/${hulpvrager.id}/${actie}/${periode.id}`,
        token,
        'PUT',
        [],
      );
    },
    [getIDToken],
  );

  const putPeriodeOpeningWijziging = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode, saldos: SaldoDTO[]) => {
      const token = await getIDToken();
      return fetchData(
        `/api/v1/periodes/hulpvrager/${hulpvrager.id}/wijzig-periode-opening/${periode.id}`,
        token,
        'PUT',
        saldos,
      );
    },
    [getIDToken],
  );

  const getPeriodeOpening = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<SaldoDTO[]>(
        `/api/v1/stand/hulpvrager/${hulpvrager.id}/periode/${periode.id}/openingsbalans`,
        token,
        'GET',
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
    getOngeldigeBetalingenVoorHulpvrager,
    postBetalingVoorHulpvrager,
    putBetaling,
    deleteBetaling,
    putPeriodeActie,
    putPeriodeOpeningWijziging,
    getPeriodeOpening,
    putBetalingValidatie,
  };
}

export { usePlusminApi };
