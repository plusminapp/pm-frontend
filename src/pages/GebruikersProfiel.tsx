import React from 'react';
import { Typography } from '@mui/material';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';

const GebruikersProfiel: React.FC = () => {
  const { state } = useAuthContext();

  const { gebruiker, actieveAdministratie } = useCustomContext();

  return (
    <>
      <Typography variant="h4">{gebruiker?.bijnaam}'s profiel</Typography>

      {!state.isAuthenticated && (
        <Typography variant="h4" sx={{ mb: '25px' }}>
          Je moet eerst inloggen ...
        </Typography>
      )}
      {state.isAuthenticated && (
        <Typography sx={{ my: '5px' }}>
          Je bent ingelogd met email "{state.username}".
          <br />
          Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.
          <br />
          Je{' '}
          {gebruiker?.roles.length != undefined && gebruiker?.roles.length === 0
            ? ' hebt geen expliciete rol'
            : gebruiker?.roles.length && gebruiker?.roles.length > 1
              ? ' rollen zijn '
              : ' rol is '}
          {gebruiker?.roles.length && gebruiker?.roles.length > 0
            ? gebruiker?.roles
                .map((x) => x.split('_')[1].toLowerCase())
                .join('", "')
            : ''}
          .
        </Typography>
      )}
      <Typography sx={{ my: '25px' }}>
        De gekozen administratie is {actieveAdministratie?.naam}.
      </Typography>

      <Typography sx={{ my: '0px' }}>
        De administraties waar je toegang tot hebt zijn:
      </Typography>
      <ul >
        {gebruiker?.administraties.map((admin) => (
          <li key={admin.id}>
            {admin.naam}: eigenaar is {admin.eigenaarNaam}, gebruikers met toegang zijn:{' '}
            {admin.gebruikers.map((gebruiker) => gebruiker.bijnaam).join(', ')}
            </li>
        ))}
      </ul>

      {/* {JSON.stringify(rekeningGroepPerBetalingsSoort)} */}
    </>
  );
};

export default GebruikersProfiel;
