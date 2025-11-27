import React, { useState } from 'react';
import { Typography, IconButton, TextField, Box } from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { usePlusminApi } from '../api/plusminApi';
import dayjs from 'dayjs';
import { Administratie } from '../model/Administratie';
import CreeerAdministratie from '../components/Administratie/CreeerAdministratie';

interface BijnaamFormData {
  bijnaam: string;
}

interface VandaagFormData {
  vandaag: string;
}

const GebruikersProfiel: React.FC = () => {
  const { state } = useAuthContext();
  const isSignedIn = state?.isAuthenticated || false;
  const {
    gebruiker,
    setGebruiker,
    actieveAdministratie,
    setVandaag,
    setSnackbarMessage,
  } = useCustomContext();
  const { updateBijnaam, putVandaag, resetSpel } = usePlusminApi();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVandaagAdminId, setEditingVandaagAdminId] = useState<
    string | null
  >(null);
  const [submittingVandaagAdminId, setSubmittingVandaagAdminId] = useState<
    string | null
  >(null);
  const [resettingAdminId, setResettingAdminId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BijnaamFormData>({
    defaultValues: {
      bijnaam: gebruiker?.bijnaam || '',
    },
  });

  const {
    control: vandaagControl,
    handleSubmit: handleVandaagSubmit,
    reset: resetVandaag,
    formState: { errors: vandaagErrors },
  } = useForm<VandaagFormData>();

  const handleEditClick = () => {
    reset({ bijnaam: gebruiker?.bijnaam || '' });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({ bijnaam: gebruiker?.bijnaam || '' });
  };

  const handleVandaagEditClick = (admin: Administratie) => {
    const currentDate = admin.vandaag || dayjs().format('YYYY-MM-DD');
    resetVandaag({ vandaag: currentDate });
    setEditingVandaagAdminId(admin.id.toString());
  };

  const handleVandaagCancel = () => {
    setEditingVandaagAdminId(null);
    resetVandaag();
  };

  const handleResetSpel = async (admin: Administratie) => {
    try {
      setResettingAdminId(admin.id.toString());
      await resetSpel(admin);
      console.log('Spel gereset voor administratie:', admin.naam);
      setSnackbarMessage({ message: `Spel is gereset`, type: 'success' });
    } catch (error) {
      console.error('Fout bij het resetten van het spel:', error);
    } finally {
      setResettingAdminId(null);
    }
  };

  const onSubmit = async (data: BijnaamFormData) => {
    if (!gebruiker) return;

    try {
      setIsSubmitting(true);
      await updateBijnaam(data.bijnaam.trim());

      setGebruiker({
        ...gebruiker,
        bijnaam: data.bijnaam.trim(),
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Fout bij het bijwerken van de bijnaam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVandaagSubmit = async (
    data: VandaagFormData,
    admin: Administratie,
  ) => {
    try {
      setSubmittingVandaagAdminId(admin.id.toString());
      await putVandaag(admin, data.vandaag, false);
      const currentDate = data.vandaag || dayjs().format('YYYY-MM-DD');
      setVandaag(currentDate);
      setEditingVandaagAdminId(null);
    } catch (error) {
      console.error('Fout bij het bijwerken van vandaag:', error);
    } finally {
      setSubmittingVandaagAdminId(null);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {!isEditing ? (
          <>
            <Typography variant="h4">{gebruiker?.bijnaam}'s profiel</Typography>
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
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
            }}
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
                      fontSize: '2.125rem',
                      fontWeight: 400,
                    },
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
          Je bent ingelogd met email "{state.username}" en je hebt "
          {gebruiker?.subject}" als identificatie code.
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
            <Box>
              {admin.naam}: eigenaar is {admin.eigenaarNaam}, gebruikers met
              toegang zijn:{' '}
              {admin.gebruikers
                .map((gebruiker) => gebruiker.bijnaam)
                .join(', ')}
              <Box sx={{ mt: 1 }}>
                {editingVandaagAdminId === admin.id.toString() ? (
                  <Box
                    component="form"
                    onSubmit={handleVandaagSubmit((data) =>
                      onVandaagSubmit(data, admin),
                    )}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Typography>
                      De administratie is in spelmodus: het is vandaag
                    </Typography>
                    <Controller
                      name="vandaag"
                      control={vandaagControl}
                      rules={{
                        required: 'Datum is verplicht',
                        validate: (value) => {
                          const selectedDate = dayjs(value);
                          const currentVandaag = admin.vandaag
                            ? dayjs(admin.vandaag)
                            : dayjs();
                          if (selectedDate.isBefore(currentVandaag, 'day')) {
                            return 'Nieuwe datum moet groter zijn dan de huidige datum';
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          variant="outlined"
                          size="small"
                          error={!!vandaagErrors.vandaag}
                          helperText={vandaagErrors.vandaag?.message}
                          disabled={
                            submittingVandaagAdminId === admin.id.toString()
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: '150px' }}
                        />
                      )}
                    />
                    <IconButton
                      type="submit"
                      size="small"
                      disabled={
                        submittingVandaagAdminId === admin.id.toString()
                      }
                      color="primary"
                      aria-label="Datum opslaan"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={handleVandaagCancel}
                      size="small"
                      disabled={
                        submittingVandaagAdminId === admin.id.toString()
                      }
                      color="secondary"
                      aria-label="Annuleren"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>
                      {admin.vandaag
                        ? `De administratie is in spelmodus: het is vandaag ${admin.vandaag}`
                        : 'De administratie is niet in spelmodus'}
                    </Typography>
                    <IconButton
                      onClick={() => handleVandaagEditClick(admin)}
                      size="small"
                      aria-label="Datum bewerken"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {admin.vandaag && (
                      <IconButton
                        onClick={() => handleResetSpel(admin)}
                        size="small"
                        disabled={resettingAdminId === admin.id.toString()}
                        aria-label="Spel resetten"
                      >
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </li>
        ))}
      </ul>
      <CreeerAdministratie />
    </>
  );
};

export default GebruikersProfiel;
