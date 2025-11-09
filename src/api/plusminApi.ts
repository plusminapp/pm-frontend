import { useCallback } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { SaldoDTO, Stand } from '../model/Saldo';
import { useAuthContext } from '@asgardeo/auth-react';
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
  const { getIDToken } = useAuthContext();

  /* Gebruiker */
  const getGebruikerZelf = useCallback(async () => {
    const token = await getIDToken();
    return fetchData<Gebruiker>('/api/v1/gebruikers/zelf', token);
  }, [getIDToken]);

  /* Rekening */
  const getRekeningenVooradministratieEnPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<RekeningGroepPerBetalingsSoort[]>(
        `/api/v1/rekeningen/administratie/${administratie.id}/periode/${periode.id}`,
        token,
      );
    },
    [getIDToken],
  );

  const getCashFlowVooradministratieEnPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<CashFlow[]>(
        `/api/v1/rekeningen/administratie/${administratie.id}/periode/${periode.id}/cashflow`,
        token,
      );
    },
    [getIDToken],
  );

  /* Betaling  */
  const getBetalingenVooradministratieVoorPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getIDToken();
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
    [getIDToken],
  );

  const getOngeldigeBetalingenVooradministratie = useCallback(
    async (administratie: Administratie) => {
      const token = await getIDToken();
      return fetchData<Betaling[]>(
        `/api/v1/betalingen/administratie/${administratie.id}/valideer-betalingen`,
        token,
      );
    },
    [getIDToken],
  );

  const postBetalingVooradministratie = useCallback(
    async (administratie: Administratie, betaling: BetalingDTO) => {
      const token = await getIDToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/administratie/${administratie.id}`,
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
      administratie: Administratie,
      saldoOpLaatsteBetalingDatum: SaldoDTO,
      betalingen: BetalingDTO[],
    ) => {
      const token = await getIDToken();
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
    [getIDToken],
  );

  /* Stand */
  const getStandVooradministratieEnDatum = useCallback(
    async (administratie: Administratie, datum: string) => {
      const token = await getIDToken();
      return fetchData<Stand>(
        `/api/v1/stand/administratie/${administratie.id}/datum/${datum}`,
        token,
      );
    },
    [getIDToken],
  );

  /* Periode */
  const putPeriodeActie = useCallback(
    async (
      administratie: Administratie,
      actie: 'heropenen' | 'sluiten' | 'opruimen',
      periode: Periode,
    ) => {
      const token = await getIDToken();
      return fetchData(
        `/api/v1/periodes/administratie/${administratie.id}/${actie}/${periode.id}`,
        token,
        'PUT',
        [],
      );
    },
    [getIDToken],
  );

  const putPeriodeOpeningWijziging = useCallback(
    async (administratie: Administratie, periode: Periode, saldos: SaldoDTO[]) => {
      const token = await getIDToken();
      return fetchData(
        `/api/v1/periodes/administratie/${administratie.id}/wijzig-periode-opening/${periode.id}`,
        token,
        'PUT',
        saldos,
      );
    },
    [getIDToken],
  );

  const getPeriodeOpening = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<SaldoDTO[]>(
        `/api/v1/stand/administratie/${administratie.id}/periode/${periode.id}/openingsbalans`,
        token,
        'GET',
      );
    },
    [getIDToken],
  );

  return {
    getGebruikerZelf,
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
