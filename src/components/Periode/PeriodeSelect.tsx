import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { eersteOpenPeriode, formateerNlDatum, laatsteGeslotenPeriode, Periode } from "../../model/Periode";
import { useCustomContext } from "../../context/CustomContext";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import { useAuthContext } from "@asgardeo/auth-react";
import { RekeningGroepPerBetalingsSoort } from "../../model/RekeningGroep.ts";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import WijzigPeriodeDialoog from "./WijzigPeriodeDialoog.tsx";

interface PeriodeSelectProps {
  isProfiel?: boolean;
  isKasboek?: boolean;
}

export function PeriodeSelect({ isProfiel = false, isKasboek = false }: PeriodeSelectProps) {

  const { getIDToken } = useAuthContext();
  const { periodes, actieveHulpvrager, gekozenPeriode, setGekozenPeriode, setRekeningGroepPerBetalingsSoort, setSnackbarMessage } = useCustomContext();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [formPeriodes, setFormPeriodes] = useState<Periode[]>(periodes);
  useEffect(() => {
    setFormPeriodes(periodes);
  }, [periodes]);

  const handlegekozenPeriodeChange = async (event: SelectChangeEvent<string>) => {
    const periode = formPeriodes.find(periode => periode.periodeStartDatum.toString() === event.target.value);
    setGekozenPeriode(periode);
    localStorage.setItem('gekozenPeriode', periode?.id + '');

    if (actieveHulpvrager && periode) {
      let token
      try {
        token = await getIDToken();
      } catch (error) {
        console.error("Error getting ID token:", error);
      }

      try {
        const response = await fetch(`/api/v1/rekening/hulpvrager/${actieveHulpvrager.id}/periode/${periode.id}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          throw new Error(`Fetch failed with status: ${response.status}`);
        }
        const dataRekening = await response.json();
        setRekeningGroepPerBetalingsSoort(dataRekening as RekeningGroepPerBetalingsSoort[]);

      } catch (error) {
        console.error('Error fetching periode details:', error);
      }
    }
  };

  const selecteerbarePeriodes = isKasboek ?
    formPeriodes
      .filter(periode => periode.periodeStatus !== 'OPGERUIMD')
      .sort((a, b) => dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum))) :
    formPeriodes
      .filter(periode => periode.periodeStartDatum !== periode.periodeEindDatum) // eerste 'pseudo' periode
      .sort((a, b) => dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)));

  const [teWijzigenOpeneingsSaldiPeriode, setTeWijzigenOpeningsSaldiPeriode] = useState<number | undefined>(undefined);
  const handleOpeningsSaldiClick = (index: number, editMode: boolean) => {
    console.log("handleOpeningsSaldiClick", index, periodes[index]);
    setEditMode(editMode);
    setTeWijzigenOpeningsSaldiPeriode(index);
  };

  const onWijzigPeriodeClose = () => {
    setTeWijzigenOpeningsSaldiPeriode(undefined);
  };

  const handleHeropenenClick = async (periode: Periode) => {
    handleOpenSluitClick(periode, 'heropenen');
    setFormPeriodes([...formPeriodes.filter(p => p.id != periode.id), { ...periode, periodeStatus: 'OPEN' }]);
  }
  const handleSluitenClick = async (periode: Periode) => {
    handleOpenSluitClick(periode, 'sluiten');
    setFormPeriodes([...formPeriodes.filter(p => p.id != periode.id), { ...periode, periodeStatus: 'GESLOTEN' }]);
  }
  const handleOpruimenClick = async (periode: Periode) => {
    handleOpenSluitClick(periode, 'opruimen');
    setFormPeriodes(formPeriodes.map(p => p.id <= periode.id ? { ...p, periodeStatus: 'OPGERUIMD' } : p));
  }
  const handleOpenSluitClick = async (periode: Periode, actie: string) => {
    if (actieveHulpvrager && periode) {
      let token
      try {
        token = await getIDToken();
      } catch (error) {
        console.error("Error getting ID token:", error);
      }

      try {
        const response = await fetch(`/api/v1/periode/hulpvrager/${actieveHulpvrager.id}/${actie}/${periode.id}`, {
          method: 'PUT',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([]),

        });
        if (response.ok) {
          setSnackbarMessage({
            message: `Het ${actie} van de periode is succesvol uitgevoerd.`,
            type: "success"
          })
        } else {
          throw new Error(`Fetch failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching periode details:', error);
      }
    }
  }
  return (
    <>
      {!isProfiel && selecteerbarePeriodes.length === 1 && gekozenPeriode &&
        <Box sx={{ mt: '37px', maxWidth: '340px' }}>
          <Typography >
            Periode: {dayjs(gekozenPeriode.periodeStartDatum).format('D MMMM')} - {dayjs(gekozenPeriode.periodeEindDatum).format('D MMMM')} ({gekozenPeriode.periodeStatus.toLocaleLowerCase()})
          </Typography>
        </Box>}

      {!isProfiel && selecteerbarePeriodes.length > 1 && gekozenPeriode &&
        <Box sx={{ my: 2, maxWidth: '340px' }}>
          <FormControl variant="standard" fullWidth >
            <InputLabel id="demo-simple-select-label">Kies de periode</InputLabel>
            <Select
              sx={{ fontSize: '0.875rem' }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formPeriodes.some(periode => periode.periodeStartDatum === gekozenPeriode?.periodeStartDatum) ? gekozenPeriode?.periodeStartDatum : ''}
              label="Periode"
              onChange={handlegekozenPeriodeChange}>
              {selecteerbarePeriodes
                .map((periode: Periode) => (
                  <MenuItem key={periode.periodeStartDatum.toString()} value={periode.periodeStartDatum.toString()} sx={{ fontSize: '0.875rem' }}>
                    {`van ${dayjs(periode.periodeStartDatum).format('D MMMM')} tot ${dayjs(periode.periodeEindDatum).format('D MMMM')}`} ({periode.periodeStatus.toLocaleLowerCase()})
                  </MenuItem>))}
            </Select>
          </FormControl>
        </Box>}

      {isProfiel &&
        <Box sx={{ maxWidth: '400px' }}>
          {formPeriodes
            .sort((a, b) => dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)))
            .map((periode, index) => (
              <Grid key={periode.id} display="flex" flexDirection="row" alignItems={'center'} justifyContent="flex-start" >
                {periode.periodeStartDatum !== periode.periodeEindDatum &&
                  <>
                    <Typography key={periode.periodeStartDatum}>
                      Periode: {formateerNlDatum(periode.periodeStartDatum)} - {formateerNlDatum(periode.periodeEindDatum)} ({periode.periodeStatus.toLocaleLowerCase()})
                    </Typography>
                    <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer', mr: 0, pr: 0 }}>
                      <Button onClick={() => handleOpeningsSaldiClick(index, false)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </Button>
                      {periode === laatsteGeslotenPeriode(formPeriodes) &&
                        <>
                          {periode.periodeStatus === 'GESLOTEN' &&
                            <Button onClick={() => handleHeropenenClick(periode)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                              <LockOpenOutlinedIcon fontSize="small" />
                            </Button>}
                        </>}
                      {periode === eersteOpenPeriode(formPeriodes) &&
                        <>
                          <Button onClick={() => handleOpeningsSaldiClick(index, true)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                            <EditOutlinedIcon fontSize="small" />
                          </Button>
                          {periode.periodeStatus !== 'HUIDIG' &&
                            <Button onClick={() => handleSluitenClick(periode)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                              <LockOutlinedIcon fontSize="small" />
                            </Button>}
                        </>}
                      {periode.periodeStatus === 'GESLOTEN' &&
                        <Button onClick={() => handleOpruimenClick(periode)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                          <CleaningServicesOutlinedIcon fontSize="small" />
                        </Button>}
                    </Box>
                  </>}
              </Grid>
            ))}
        </Box>}
      {teWijzigenOpeneingsSaldiPeriode !== undefined && (
        <WijzigPeriodeDialoog
          index={teWijzigenOpeneingsSaldiPeriode}
          onWijzigPeriodeClose={onWijzigPeriodeClose}
          periodes={periodes}
          editMode={editMode}
        />
      )}
    </>
  );
}
