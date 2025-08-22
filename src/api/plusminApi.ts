import { useCallback } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { Stand } from '../model/Saldo';
import { useAuthContext } from '@asgardeo/auth-react';

async function fetchData<T>(endpoint: string, bearerToken: string) {
  const response = await fetch(`${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json() as T;
}

function useGetGebruikerZelf() {
  const { getIDToken } = useAuthContext();
  const fetch = useCallback(async () => {
    const token = await getIDToken();
    return fetchData<{
      gebruiker: Gebruiker;
      hulpvragers: Gebruiker[];
    }>('/api/v1/gebruiker/zelf', token);
  }, [getIDToken]);
  return [fetch];
}

function useGetRekeningenVoorHulpvragerEnPeriode() {
  const { getIDToken } = useAuthContext();
  const fetch = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      const token = await getIDToken();
      return fetchData<RekeningGroepPerBetalingsSoort[]>(
        `/api/v1/rekening/hulpvrager/${hulpvrager.id}/periode/${periode.id}`,
        token,
      );
    },
    [getIDToken],
  );
  return [fetch];
}

function useGetStandVoorHulpvragerEnDatum() {
  const { getIDToken } = useAuthContext();
  const fetch = useCallback(
    async (hulpvrager: Gebruiker, datum: string) => {
      const token = await getIDToken();
      return fetchData<Stand>(
        `/api/v1/stand/hulpvrager/${hulpvrager.id}/datum/${datum}`,
        token,
      );
    },
    [getIDToken],
  );
  return [fetch];
}

export {
  useGetGebruikerZelf,
  useGetRekeningenVoorHulpvragerEnPeriode,
  useGetStandVoorHulpvragerEnDatum,
};
