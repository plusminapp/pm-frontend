import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { eersteOpenPeriode, formateerNlDatum, formateerNlVolgendeDag, laatsteGeslotenPeriode, Periode } from "../../model/Periode";
import { useCustomContext } from "../../context/CustomContext";
import { saveToLocalStorage, transformRekeningen2BetalingsSoorten, transformRekeningenToBetalingsSoorten } from "../Header/HeaderExports.ts";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditIcon from '@mui/icons-material/Edit';

import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import { Rekening } from "../../model/Rekening.ts";
import dayjs from "dayjs";

interface PeriodeSelectProps {
  isProfiel?: boolean;
}

export function PeriodeSelect({ isProfiel = false }: PeriodeSelectProps) {

  const { getIDToken } = useAuthContext();
  const { periodes, actieveHulpvrager, gekozenPeriode, setGekozenPeriode, setRekeningen, setBetalingsSoorten, setBetalingsSoorten2Rekeningen } = useCustomContext();

  const handlegekozenPeriodeChange = async (event: SelectChangeEvent<string>) => {
    const periode = periodes.find(periode => periode.periodeStartDatum.toString() === event.target.value);
    setGekozenPeriode(periode);
    saveToLocalStorage('gekozenPeriode', periode?.id + '');

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
        setRekeningen(dataRekening as Rekening[]);
        setBetalingsSoorten(transformRekeningen2BetalingsSoorten(dataRekening as Rekening[]));
        setBetalingsSoorten2Rekeningen(transformRekeningenToBetalingsSoorten(dataRekening as Rekening[]));

      } catch (error) {
        console.error('Error fetching periode details:', error);
      }
    }
  };
  const navigate = useNavigate();

  const openPeriodes = periodes.filter(periode => periode.periodeStatus === 'OPEN' || periode.periodeStatus === 'HUIDIG')

  return (
    <>
      {!isProfiel && openPeriodes.length === 1 && gekozenPeriode &&
        <Box sx={{ mt: '37px', maxWidth: '340px' }}>
          <Typography >
            Periode: {gekozenPeriode.periodeStartDatum} - {gekozenPeriode.periodeEindDatum} ({gekozenPeriode.periodeStatus.toLocaleLowerCase()})
          </Typography>
        </Box>}

      {!isProfiel && openPeriodes.length > 1 && gekozenPeriode &&
        <Box sx={{ my: 2, maxWidth: '340px' }}>
          <FormControl variant="standard" fullWidth >
            <InputLabel id="demo-simple-select-label">Kies de periode</InputLabel>
            <Select
              sx={{ fontSize: '0.875rem' }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={periodes.some(periode => periode.periodeStartDatum === gekozenPeriode?.periodeStartDatum) ? gekozenPeriode?.periodeStartDatum : ''}
              label="Periode"
              onChange={handlegekozenPeriodeChange}>
              {openPeriodes
                .map((periode: Periode) => (
                  <MenuItem key={periode.periodeStartDatum.toString()} value={periode.periodeStartDatum.toString()} sx={{ fontSize: '0.875rem' }}>
                    {`van ${dayjs(periode.periodeStartDatum).format('D MMMM')} tot ${dayjs(periode.periodeEindDatum).format('D MMMM')}`} ({periode.periodeStatus.toLocaleLowerCase()})
                  </MenuItem>))}
            </Select>
          </FormControl>
        </Box>}

      {isProfiel &&
        <Box sx={{ maxWidth: '340px' }}>
          {periodes
            .sort((a, b) => a.periodeStartDatum.localeCompare(b.periodeStartDatum))
            .map((periode: Periode) => (
              <Grid key={periode.id} display="flex" flexDirection="row" alignItems={'center'} justifyContent="flex-start" >
                {periode.periodeStartDatum === periode.periodeEindDatum &&
                  <Typography key={periode.periodeStartDatum}>
                    Opening op {formateerNlVolgendeDag(periode.periodeEindDatum)}
                  </Typography>}
                {periode.periodeStartDatum !== periode.periodeEindDatum &&
                  <Typography key={periode.periodeStartDatum}>
                    Periode: {formateerNlDatum(periode.periodeStartDatum)} - {formateerNlDatum(periode.periodeEindDatum)} ({periode.periodeStatus.toLocaleLowerCase()})
                  </Typography>}
                <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer', mr: 0, pr: 0 }}>
                  {periode === laatsteGeslotenPeriode(periodes) &&
                    <Button onClick={() => navigate('/periode?actie=wijzigen')} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                      <EditIcon fontSize="small" />
                    </Button>}
                  {periode === eersteOpenPeriode(periodes) &&
                    <Button onClick={() => navigate('/periode?actie=sluiten')} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                      <LockOutlinedIcon fontSize="small" />
                    </Button>}
                </Box>
              </Grid>
            ))}
        </Box>}
    </>)
}
