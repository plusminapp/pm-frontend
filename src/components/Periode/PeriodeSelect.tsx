import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { usePlusminApi } from '../../api/plusminApi.ts';
import { useCustomContext } from '../../context/CustomContext';
import { BetalingsSoort } from '../../model/Betaling.ts';
import {
  eersteOpenPeriode,
  formateerNlDatum,
  formateerNlPeriode,
  laatsteGeslotenPeriode,
  Periode,
} from '../../model/Periode';
import WijzigPeriodeDialoog from './WijzigPeriodeDialoog.tsx';

interface PeriodeSelectProps {
  isProfiel?: boolean;
  isKasboek?: boolean;
  isAflossing?: boolean;
}

export function PeriodeSelect({
  isAflossing = false,
  isProfiel = false,
  isKasboek = false,
}: PeriodeSelectProps) {
  const {
    periodes,
    setPeriodes,
    actieveAdministratie,
    gekozenPeriode,
    setGekozenPeriode,
    rekeningGroepPerBetalingsSoort,
    setRekeningGroepPerBetalingsSoort,
    setSnackbarMessage,
  } = useCustomContext();
  const { putPeriodeActie } = usePlusminApi();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [formPeriodes, setFormPeriodes] = useState<Periode[]>(periodes);
  const { getRekeningenVooradministratieEnPeriode } = usePlusminApi();

  useEffect(() => {
    setFormPeriodes(periodes);
  }, [periodes]);

  const handlegekozenPeriodeChange = async (
    event: SelectChangeEvent<string>,
  ) => {
    const periode = formPeriodes.find(
      (periode) => periode.periodeStartDatum.toString() === event.target.value,
    );
    setGekozenPeriode(periode);
    localStorage.setItem('gekozenPeriode', periode?.id + '');

    if (actieveAdministratie && periode) {
      const dataRekening = await getRekeningenVooradministratieEnPeriode(
        actieveAdministratie,
        periode,
      );
      setRekeningGroepPerBetalingsSoort(dataRekening);
    }
  };

  const periodeHeeftAlossing = (periode: Periode) => {
    return rekeningGroepPerBetalingsSoort
      .filter((bs) => bs.betalingsSoort === BetalingsSoort.aflossen)
      .flatMap((bs) => bs.rekeningGroepen)
      .flatMap((rg) => rg.rekeningen)
      .some(
        (r) =>
          periode.periodeStartDatum != periode.periodeEindDatum &&
          (r.vanPeriode === undefined ||
            r.vanPeriode?.periodeStartDatum <= periode.periodeStartDatum) &&
          (r.totEnMetPeriode === undefined ||
            r.totEnMetPeriode?.periodeEindDatum >= periode.periodeEindDatum),
      );
  };

  const selecteerbarePeriodes = isKasboek
    ? formPeriodes
        .filter((periode) => periode.periodeStatus !== 'OPGERUIMD')
        .sort((a, b) =>
          dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
        )
    : isAflossing
      ? formPeriodes
          .filter((periode) => periodeHeeftAlossing(periode))
          .sort((a, b) =>
            dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
          )
      : formPeriodes
          .filter(
            (periode) => periode.periodeStartDatum !== periode.periodeEindDatum,
          ) // eerste 'pseudo' periode
          .sort((a, b) =>
            dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
          );

  const [teWijzigenOpeningsSaldiPeriode, setTeWijzigenOpeningsSaldiPeriode] =
    useState<number | undefined>(undefined);
  const handleOpeningsSaldiClick = (index: number, editMode: boolean) => {
    console.log('handleOpeningsSaldiClick', index, periodes[index]);
    setEditMode(editMode);
    setTeWijzigenOpeningsSaldiPeriode(index);
  };

  const onWijzigPeriodeClose = () => {
    setTeWijzigenOpeningsSaldiPeriode(undefined);
  };

  const handleHeropenenClick = async (periode: Periode) => {
    handleOpenSluitClick(periode, 'heropenen');
    setFormPeriodes([
      ...formPeriodes.filter((p) => p.id != periode.id),
      { ...periode, periodeStatus: 'OPEN' },
    ]);
  };
  const handleSluitenClick = async (periode: Periode) => {
    handleOpenSluitClick(periode, 'sluiten');
    setFormPeriodes([
      ...formPeriodes.filter((p) => p.id != periode.id),
      { ...periode, periodeStatus: 'GESLOTEN' },
    ]);
  };
  const handleOpruimenClick = async (periode: Periode) => {
    handleOpenSluitClick(periode, 'opruimen');
    setFormPeriodes(
      formPeriodes.map((p) =>
        p.id <= periode.id ? { ...p, periodeStatus: 'OPGERUIMD' } : p,
      ),
    );
  };
  const handleOpenSluitClick = async (
    periode: Periode,
    actie: 'heropenen' | 'sluiten' | 'opruimen',
  ) => {
    if (actieveAdministratie && periode) {
      try {
        await putPeriodeActie(actieveAdministratie, actie, periode);
        setPeriodes(
          periodes.map((p) =>
            p.id !== periode.id
              ? p
              : {
                  ...p,
                  periodeStatus:
                    actie === 'heropenen'
                      ? 'OPEN'
                      : actie === 'sluiten'
                        ? 'GESLOTEN'
                        : 'OPGERUIMD',
                },
          ),
        );
        setSnackbarMessage({
          message: `Het ${actie} van de periode is succesvol uitgevoerd.`,
          type: 'success',
        });
      } catch (error) {
        throw new Error(`Fetch failed with status: ${error}`);
      }
    }
  };
  return (
    <>
      {!isProfiel && selecteerbarePeriodes.length === 1 && gekozenPeriode && (
        <Box sx={{ mt: '37px', maxWidth: '340px' }}>
          <Typography>
            Periode: {formateerNlPeriode(gekozenPeriode)} (
            {gekozenPeriode.periodeStatus.toLocaleLowerCase()})
          </Typography>
        </Box>
      )}

      {!isProfiel && selecteerbarePeriodes.length > 1 && gekozenPeriode && (
        <Box sx={{ my: 2, maxWidth: '340px' }}>
          <FormControl variant="standard" fullWidth>
            <InputLabel id="demo-simple-select-label">
              Kies de periode
            </InputLabel>
            <Select
              sx={{ fontSize: '0.875rem' }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={
                formPeriodes.some(
                  (periode) =>
                    periode.periodeStartDatum ===
                    gekozenPeriode?.periodeStartDatum,
                )
                  ? gekozenPeriode?.periodeStartDatum
                  : ''
              }
              label="Periode"
              onChange={handlegekozenPeriodeChange}
            >
              {selecteerbarePeriodes.map((periode: Periode) => (
                <MenuItem
                  key={periode.periodeStartDatum.toString()}
                  value={periode.periodeStartDatum.toString()}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {`${dayjs(periode.periodeStartDatum).format('MMMM')}/${dayjs(periode.periodeEindDatum).format('MMMM')}`}{' '}
                  ({periode.periodeStatus.toLocaleLowerCase()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {isProfiel && (
        <Box sx={{ maxWidth: '400px' }}>
          {formPeriodes
            .sort((a, b) =>
              dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
            )
            .map((periode, index) => (
              <Grid
                key={periode.id}
                display="flex"
                flexDirection="row"
                alignItems={'center'}
                justifyContent="flex-start"
              >
                {periode.periodeStartDatum !== periode.periodeEindDatum && (
                  <>
                    <Typography key={periode.periodeStartDatum}>
                      Periode: {formateerNlDatum(periode.periodeStartDatum)} -{' '}
                      {formateerNlDatum(periode.periodeEindDatum)} (
                      {periode.periodeStatus.toLocaleLowerCase()})
                    </Typography>
                    <Box
                      alignItems={'center'}
                      display={'flex'}
                      sx={{ cursor: 'pointer', mr: 0, pr: 0 }}
                    >
                      <Button
                        onClick={() => handleOpeningsSaldiClick(index, false)}
                        sx={{ minWidth: '24px', color: 'grey', p: '5px' }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </Button>
                      {periode === laatsteGeslotenPeriode(formPeriodes) && (
                        <>
                          {periode.periodeStatus === 'GESLOTEN' && (
                            <Button
                              onClick={() => handleHeropenenClick(periode)}
                              sx={{ minWidth: '24px', color: 'grey', p: '5px' }}
                            >
                              <LockOpenOutlinedIcon fontSize="small" />
                            </Button>
                          )}
                        </>
                      )}
                      {periode === eersteOpenPeriode(formPeriodes) && (
                        <>
                          <Button
                            onClick={() =>
                              handleOpeningsSaldiClick(index, true)
                            }
                            sx={{ minWidth: '24px', color: 'grey', p: '5px' }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </Button>
                          {periode.periodeStatus !== 'HUIDIG' && (
                            <Button
                              onClick={() => handleSluitenClick(periode)}
                              sx={{ minWidth: '24px', color: 'grey', p: '5px' }}
                            >
                              <LockOutlinedIcon fontSize="small" />
                            </Button>
                          )}
                        </>
                      )}
                      {periode.periodeStatus === 'GESLOTEN' && (
                        <Button
                          onClick={() => handleOpruimenClick(periode)}
                          sx={{ minWidth: '24px', color: 'grey', p: '5px' }}
                        >
                          <CleaningServicesOutlinedIcon fontSize="small" />
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </Grid>
            ))}
        </Box>
      )}
      {teWijzigenOpeningsSaldiPeriode !== undefined && actieveAdministratie && (
        <WijzigPeriodeDialoog
          onWijzigPeriodeClose={onWijzigPeriodeClose}
          periode={periodes[teWijzigenOpeningsSaldiPeriode]}
          editMode={editMode}
          actieveAdministratie={actieveAdministratie}
        />
      )}
    </>
  );
}
