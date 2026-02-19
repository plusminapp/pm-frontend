import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gebruiker } from '../model/Gebruiker';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { SaldoDTO, Stand } from '../model/Saldo';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { CashFlow } from '../model/CashFlow';
import { Betaling, BetalingDTO } from '../model/Betaling';
import { Administratie, AdministratieWrapper } from '../model/Administratie';
import { AflossingDTO } from '../model/Aflossing';
import { PlusMinErrorResponse } from '../model/PlusMinError';

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
    const responseBody = await response.clone().text();
    const message = responseBody ? `${response.status} ${response.statusText}: ${responseBody}` : `${response.status} ${response.statusText}`;
    const error = new Error(message);
    
    // Set properties type-safe
    error.status = response.status;
    error.body = responseBody;
    
    // Parse PlusMinError if possible
    try {
      if (responseBody) {
        const parsedError = JSON.parse(responseBody) as PlusMinErrorResponse;
        if (parsedError.errorCode && parsedError.message) {
          error.plusMinError = parsedError;
        }
      }
    } catch {
      // Ignore parse errors, continue with basic error
    }
        throw error;
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
}
function usePlusminApi() {
  const { getAccessToken } = useAuthContext();
  const { gebruiker } = useCustomContext();
  const navigate = useNavigate();

  // Helper function to safely get access token with redirect on failure
  const safeGetAccessToken = useCallback(async (): Promise<string> => {
    try {
      return await getAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      navigate('/login');
      throw error; // Re-throw to prevent further execution
    }
  }, [getAccessToken, navigate]);


  /* Gebruiker */
  const getGebruikerZelf = useCallback(async () => {
    const token = await safeGetAccessToken();
    return fetchData<Gebruiker>('/api/v1/gebruikers/zelf', token);
  }, [safeGetAccessToken]);

  const updateBijnaam = useCallback(
    async (bijnaam: string) => {
      const token = await safeGetAccessToken();
      const nieuweGebruiker = { ...gebruiker, bijnaam };
      return fetchData<Gebruiker>(
        '/api/v1/gebruikers/zelf',
        token,
        'PUT',
        nieuweGebruiker,
      );
    },
    [gebruiker, safeGetAccessToken],
  );

  /* Rekening */
  const getRekeningenVoorAdministratieEnPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await safeGetAccessToken();
      return fetchData<RekeningGroepPerBetalingsSoort[]>(
        `/api/v1/rekeningen/administratie/${administratie.id}/periode/${periode.id}`,
        token,
      );
    },
    [safeGetAccessToken],
  );

  const getCashFlowVooradministratieEnPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await safeGetAccessToken();
      return fetchData<CashFlow[]>(
        `/api/v1/rekeningen/administratie/${administratie.id}/periode/${periode.id}/cashflow`,
        token,
      );
    },
    [safeGetAccessToken],
  );

  const getLabels = useCallback(
    async (administratie: Administratie) => {
      const token = await safeGetAccessToken();
      return fetchData<string[]>(
        `/api/v1/label/${administratie.id}`,
        token,
      );
    },
    [safeGetAccessToken],
  );

  /* Betaling  */
  const getBetalingenVooradministratieVoorPeriode = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await safeGetAccessToken();
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
    [safeGetAccessToken],
  );

  const getOngeldigeBetalingenVooradministratie = useCallback(
    async (administratie: Administratie) => {
      const token = await safeGetAccessToken();
      return fetchData<Betaling[]>(
        `/api/v1/betalingen/administratie/${administratie.id}/valideer-betalingen`,
        token,
      );
    },
    [safeGetAccessToken],
  );

  const postBetalingVooradministratie = useCallback(
    async (administratie: Administratie, betaling: BetalingDTO) => {
      const token = await safeGetAccessToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/administratie/${administratie.id}`,
        token,
        'POST',
        betaling,
      );
    },
    [safeGetAccessToken],
  );

  const putBetaling = useCallback(
    async (betaling: BetalingDTO) => {
      const token = await safeGetAccessToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/${betaling.id}`,
        token,
        'PUT',
        betaling,
      );
    },
    [safeGetAccessToken],
  );

  const deleteBetaling = useCallback(
    async (betaling: BetalingDTO) => {
      const token = await safeGetAccessToken();
      return fetchData<Betaling>(
        `/api/v1/betalingen/${betaling.id}`,
        token,
        'DELETE',
      );
    },
    [safeGetAccessToken],
  );

  const putBetalingValidatie = useCallback(
    async (
      administratie: Administratie,
      saldoOpLaatsteBetalingDatum: SaldoDTO,
      betalingen: BetalingDTO[],
    ) => {
      const token = await safeGetAccessToken();
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
    [safeGetAccessToken],
  );

  /* Stand */
  const getStandVooradministratieEnDatum = useCallback(
    async (administratie: Administratie, datum: string) => {
      const token = await safeGetAccessToken();
      return fetchData<Stand>(
        `/api/v1/stand/administratie/${administratie.id}/datum/${datum}`,
        token,
      );
    },
    [safeGetAccessToken],
  );

  /* Reserveren */
  const putReserveringen = useCallback(
    async (administratie: Administratie) => {
      const token = await safeGetAccessToken();
      return fetchData<void>(
        `/api/v1/reserveringen/administratie/${administratie.id}`,
        token,
        'PUT',
      );
    },
    [safeGetAccessToken],
  );

  const putAlleReserveringen = useCallback(
    async (administratie: Administratie) => {
      const token = await safeGetAccessToken();
      return fetchData<void>(
        `/api/v1/reserveringen/administratie/${administratie.id}/alle`,
        token,
        'PUT',
      );
    },
    [safeGetAccessToken],
  );

  /* Periode */
  const putPeriodeActie = useCallback(
    async (
      administratie: Administratie,
      actie: 'heropenen' | 'sluiten' | 'opruimen',
      periode: Periode,
    ) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/periodes/administratie/${administratie.id}/${actie}/${periode.id}`,
        token,
        'PUT',
        [],
      );
    },
    [safeGetAccessToken],
  );

  const putPeriodeOpeningWijziging = useCallback(
    async (administratie: Administratie, periode: Periode, saldos: SaldoDTO[]) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/periodes/administratie/${administratie.id}/wijzig-periode-opening/${periode.id}`,
        token,
        'PUT',
        saldos,
      );
    },
    [safeGetAccessToken],
  );

  const getPeriodeOpening = useCallback(
    async (administratie: Administratie, periode: Periode) => {
      const token = await safeGetAccessToken();
      return fetchData<SaldoDTO[]>(
        `/api/v1/stand/administratie/${administratie.id}/periode/${periode.id}/openingsbalans`,
        token,
        'GET',
      );
    },
    [safeGetAccessToken],
  );

  /* Demo */
  const putVandaag = useCallback(
    async (administratie: Administratie, vandaag: string, toonBetalingen: boolean) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/demo/administratie/${administratie.id}/vandaag/${vandaag}/betalingen/${toonBetalingen}`,
        token,
        'PUT',
      );
    },
    [safeGetAccessToken],
  );

  /* Aflossing */
  const putAflossing = useCallback(
    async (aflossing: AflossingDTO) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/aflossingen/${aflossing.id}`,
        token,
        'PUT',
        aflossing
      );
    },
    [safeGetAccessToken],
  );

  const resetSpel = useCallback(
    async (administratie: Administratie) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/demo/administratie/${administratie.id}/reset`,
        token,
        'PUT',
      );
    },
    [safeGetAccessToken],
  );

  const zetSpelInDemoModus = useCallback(
    async (administratie: Administratie) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/demo/administratie/${administratie.id}/configureer`,
        token,
        'PUT',
      );
    },
    [safeGetAccessToken],
  );

  const uploadSpel = useCallback(
    async (administratieWrapper: AdministratieWrapper) => {
      const token = await safeGetAccessToken();
      return fetchData(
        `/api/v1/demo/administratie/upload`,
        token,
        'PUT',
        administratieWrapper,
      );
    },
    [safeGetAccessToken],
  );

  return {
    getGebruikerZelf,
    updateBijnaam,
    getRekeningenVoorAdministratieEnPeriode,
    getLabels,
    getStandVooradministratieEnDatum,
    getCashFlowVooradministratieEnPeriode,
    getBetalingenVooradministratieVoorPeriode,
    getOngeldigeBetalingenVooradministratie,
    postBetalingVooradministratie,
    putBetaling,
    deleteBetaling,
    putReserveringen,
    putAlleReserveringen,
    putPeriodeActie,
    putPeriodeOpeningWijziging,
    getPeriodeOpening,
    putBetalingValidatie,
    putAflossing,
    putVandaag,
    resetSpel,
    zetSpelInDemoModus,
    uploadSpel
  };
}

export { usePlusminApi };