import React, { useState } from 'react';
import { Typography, IconButton, TextField, Box } from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { usePlusminApi } from '../api/plusminApi';
import dayjs from 'dayjs';

interface BijnaamFormData {
  bijnaam: string;
}

const GebruikersProfiel: React.FC = () => {
  const { state } = useAuthContext();
  const isSignedIn = state?.isAuthenticated || false;
  const { gebruiker, setGebruiker, actieveAdministratie } = useCustomContext();
  const { updateBijnaam } = usePlusminApi();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BijnaamFormData>({
    defaultValues: {
      bijnaam: gebruiker?.bijnaam || '',
    },
  });

  const handleEditClick = () => {
    reset({ bijnaam: gebruiker?.bijnaam || '' });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({ bijnaam: gebruiker?.bijnaam || '' });
  };

  const onSubmit = async (data: BijnaamFormData) => {
    if (!gebruiker) return;

    try {
      setIsSubmitting(true);
      await updateBijnaam(data.bijnaam.trim());
      
      // Update de gebruiker in de context
      setGebruiker({
        ...gebruiker,
        bijnaam: data.bijnaam.trim(),
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Fout bij het bijwerken van de bijnaam:', error);
      // Hier zou je een snackbar of toast kunnen tonen
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {!isEditing ? (
          <>
            <Typography variant="h4">
              {gebruiker?.bijnaam}'s profiel
            </Typography>
            <IconButton 
              onClick={handleEditClick}
              size="small"
              sx={{ ml: 1 }}
              aria-label="Bijnaam bewerken"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
          >
            <Controller
              name="bijnaam"
              control={control}
              rules={{
                required: 'Bijnaam is verplicht',
                minLength: {
                  value: 2,
                  message: 'Bijnaam moet minimaal 2 karakters bevatten',
                },
                maxLength: {
                  value: 50,
                  message: 'Bijnaam mag maximaal 50 karakters bevatten',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  size="small"
                  error={!!errors.bijnaam}
                  helperText={errors.bijnaam?.message}
                  autoFocus
                  disabled={isSubmitting}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      fontSize: '2.125rem', // h4 font size
                      fontWeight: 400,
                    }
                  }}
                />
              )}
            />
            <Typography variant="h4" sx={{ ml: 1 }}>
              's profiel
            </Typography>
            <IconButton 
              type="submit"
              size="small"
              disabled={isSubmitting}
              color="primary"
              aria-label="Opslaan"
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={handleCancel}
              size="small"
              disabled={isSubmitting}
              color="secondary"
              aria-label="Annuleren"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {!isSignedIn && (
        <Typography variant="h4" sx={{ mb: '25px' }}>
          Je moet eerst inloggen ...
        </Typography>
      )}
      {isSignedIn && (
        <Typography sx={{ my: '5px' }}>
          Je bent ingelogd met email "{state.email}" en je hebt "{gebruiker?.subject}" als identificatie code.
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
      <ul>
        {gebruiker?.administraties.map((admin) => (
          <li key={admin.id}>
            {admin.naam}: eigenaar is {admin.eigenaarNaam}, gebruikers met toegang zijn:{' '}
            {admin.gebruikers.map((gebruiker) => gebruiker.bijnaam).join(', ')}
                      {admin.vandaag && (
            <Typography>
              {admin.vandaag && `De administratie is in spelmodus: het is vandaag ${admin.vandaag}. `}
              {!admin.vandaag && `De administratie is niet in spelmodus. het is vandaag ${dayjs().format('YYYY-MM-DD')}. `}
            </Typography>
          )}

          </li>
        ))}
      </ul>
    </>
  );
};

export default GebruikersProfiel;