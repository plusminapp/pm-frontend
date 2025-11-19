import { useCallback } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { SaldoDTO, Stand } from '../model/Saldo';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { CashFlow } from '../model/CashFlow';
import { Betaling, BetalingDTO } from '../model/Betaling';
import { Administratie } from '../model/Administratie';

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
  const { getAccessToken } = useAuthContext();
  const { gebruiker } = useCustomContext();

  
  /* Gebruiker */
  const getGebruikerZelf = useCallback(async () => {
    const token = await getAccessToken();
    return fetchData<Gebruiker>('/api/v1/gebruikers/zelf', token);
  }, [getAccessToken]);

  const updateBijnaam = useCallback(
    async (bijnaam: string) => {
      const token = await getAccessToken();
      const nieuweGebruiker = {...gebruiker, bijnaam};
      return fetchData<Gebruiker>(
        '/api/v1/gebruikers/zelf',
        token,
        'PUT',
        nieuweGebruiker,
      );
    },
    [gebruiker, getAccessToken],
  );

  /* Rekening */
  const getRekeningenVooradministratieEnPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getAccessToken();
      return fetchData<RekeningGroepPerBetalingsSoort[]>(
        `/api/v1/rekeningen/administratie/${administratie.id}/periode/${periode.id}`,
        token,
      );
    },
    [getAccessToken],
  );

  const getCashFlowVooradministratieEnPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getAccessToken();
      return fetchData<CashFlow[]>(
        `/api/v1/rekeningen/administratie/${administratie.id}/periode/${periode.id}/cashflow`,
        token,
      );
    },
    [getAccessToken],
  );

  /* Betaling  */
  const getBetalingenVooradministratieVoorPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getAccessToken();
      return fetchData<{
        data: { content: BetalingDTO[] };
        gebruikersId: string;
        gebruikersEmail: string;
        gebruikersBijnaam: string;
      }>(
        `/api/v1/betalingen/administratie/${administratie.id}?fromDate=${periode.periodeStartDatum}&toDate=${periode.periodeEindDatum}&size=-1`,
        token,
      );
    },
    [getAccessToken],
  );

  const getOngeldigeBetalingenVooradministratie = useCallback(
    async (administratie: Administratie) => {
      const token = await getAccessToken();
      return fetchData<Betaling[]>(
        `/api/v1/betalingen/administratie/${administratie.id}/valideer-betalingen`,
        token,
      );
    },
    [getAccessToken],
  );

  const postBetalingVooradministratie = useCallback(
    async (administratie: Administratie, betaling: BetalingDTO) => {
      const token = await getAccessToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/administratie/${administratie.id}`,
        token,
        'POST',
        betaling,
      );
    },
    [getAccessToken],
  );

  const putBetaling = useCallback(
    async (betaling: BetalingDTO) => {
      const token = await getAccessToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/${betaling.id}`,
        token,
        'PUT',
        betaling,
      );
    },
    [getAccessToken],
  );

  const deleteBetaling = useCallback(
    async (betaling: BetalingDTO) => {
      const token = await getAccessToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/${betaling.id}`,
        token,
        'DELETE',
      );
    },
    [getAccessToken],
  );

  const putBetalingValidatie = useCallback(
    async (
      administratie: Administratie,
      saldoOpLaatsteBetalingDatum: SaldoDTO,
      betalingen: BetalingDTO[],
    ) => {
      const token = await getAccessToken();
      return fetchData<{
        laatsteBetalingDatum: string;
        saldoOpLaatsteBetalingDatum: SaldoDTO;
        betalingen: BetalingDTO[];
      }>(
        `/api/v1/betalingen/administratie/${administratie.id}/betalingvalidatie`,
        token,
        'PUT',
        { saldoOpLaatsteBetalingDatum, betalingen },
      );
    },
    [getAccessToken],
  );

  /* Stand */
  const getStandVooradministratieEnDatum = useCallback(
    async (administratie: Administratie, datum: string) => {
      const token = await getAccessToken();
      return fetchData<Stand>(
        `/api/v1/stand/administratie/${administratie.id}/datum/${datum}`,
        token,
      );
    },
    [getAccessToken],
  );

  /* Periode */
  const putPeriodeActie = useCallback(
    async (
      administratie: Administratie,
      actie: 'heropenen' | 'sluiten' | 'opruimen',
      periode: Periode,
    ) => {
      const token = await getAccessToken();
      return fetchData(
        `/api/v1/periodes/administratie/${administratie.id}/${actie}/${periode.id}`,
        token,
        'PUT',
        [],
      );
    },
    [getAccessToken],
  );

  const putPeriodeOpeningWijziging = useCallback(
    async (administratie: Administratie, periode: Periode, saldos: SaldoDTO[]) => {
      const token = await getAccessToken();
      return fetchData(
        `/api/v1/periodes/administratie/${administratie.id}/wijzig-periode-opening/${periode.id}`,
        token,
        'PUT',
        saldos,
      );
    },
    [getAccessToken],
  );

  const getPeriodeOpening = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getAccessToken();
      return fetchData<SaldoDTO[]>(
        `/api/v1/stand/administratie/${administratie.id}/periode/${periode.id}/openingsbalans`,
        token,
        'GET',
      );
    },
    [getAccessToken],
  );

  return {
    getGebruikerZelf,
    updateBijnaam,
    getRekeningenVooradministratieEnPeriode,
    getStandVooradministratieEnDatum,
    getCashFlowVooradministratieEnPeriode,
    getBetalingenVooradministratieVoorPeriode,
    getOngeldigeBetalingenVooradministratie,
    postBetalingVooradministratie,
    putBetaling,
    deleteBetaling,
    putPeriodeActie,
    putPeriodeOpeningWijziging,
    getPeriodeOpening,
    putBetalingValidatie,
  };
}

export { usePlusminApi };
