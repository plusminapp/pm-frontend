import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Box from '@mui/material/Box';

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import AflossingTabel from "../components/Aflossing/AflossingTabel";
import dayjs from "dayjs";
import { AflossingenAfbouwGrafiek } from "../components/Aflossing/Graph/AflossingenAfbouwGrafiek";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { BetalingsSoort } from "../model/Betaling";
import { SaldoDTO } from "../model/Saldo";
import { RekeningGroepSoort } from "../model/RekeningGroep";

export default function Aflossingen() {

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode, setSnackbarMessage, rekeningGroepPerBetalingsSoort } = useCustomContext();

  const aflossing = rekeningGroepPerBetalingsSoort
  .filter(r => r.betalingsSoort === BetalingsSoort.aflossen)
  .flatMap(r => r.rekeningGroepen)
  .flatMap(r => r.rekeningen)

  const [aflossingSaldi, setAflossingSaldi] = useState<SaldoDTO[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const fetchAflossingen = useCallback(async () => {
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error fetching ID token", error);
      setIsLoading(false);
    }
    if (actieveHulpvrager && gekozenPeriode && token) {
      setIsLoading(true);
      const id = actieveHulpvrager.id
      const formDatum = dayjs().isAfter(dayjs(gekozenPeriode.periodeEindDatum)) ? dayjs(gekozenPeriode.periodeEindDatum) : dayjs();
      const response = await fetch(`/api/v1/stand/hulpvrager/${id}/datum/${formDatum.toISOString().slice(0, 10)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setAflossingSaldi(result.resultaatOpDatum.
          filter((r: SaldoDTO) => r.rekeningGroepSoort === RekeningGroepSoort.aflossing)
        );
      } else {
        console.error("Failed to fetch data", response.status);
        setSnackbarMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: "warning"
        })
      }
    }
  }, [actieveHulpvrager, gekozenPeriode, getIDToken, setSnackbarMessage]);

  useEffect(() => {
    fetchAflossingen();
  }, [fetchAflossingen]);



  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De aflossingen worden opgehaald.</Typography>
  }

  // const berekenToestandAflossingIcoon = (aflossing: AflossingDTO): JSX.Element => {
  //   if (aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0) {
  //     if (!aflossing.aflossingMoetBetaaldZijn)
  //       return <PlusIcon color="#1977d3" height={18} />
  //     else return <PlusIcon color="#green" height={18} />
  //   }
  //   if (aflossing.minderDanVerwacht > 0) return <MinIcon color="red" height={18} />
  //   if (aflossing.meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={18} />
  //   if (aflossing.meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={18} />
  //   return <PlusIcon color="black" />
  // }

  return (
    <>
      {aflossingSaldi.length === 0 &&
      <>
        <Typography variant='h4'>Schulden/aflossingen pagina</Typography>
        <Typography variant='body2'>{actieveHulpvrager?.bijnaam} heeft op {gekozenPeriode?.periodeStartDatum} geen aflossingen ingericht.</Typography>
      <PeriodeSelect/>
      </>

      }
      {aflossingSaldi.length > 0 &&
        <>
          <Typography variant='h4'>Schulden/aflossingen pagina</Typography>
          <Grid container spacing={2} columns={{ xs: 1, md: 3 }} justifyContent="space-between">
            <Grid size={1} alignItems="start">
              <PeriodeSelect />
            </Grid>
          </Grid>
          <Accordion
            elevation={2}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls={"afbouwgrafiek"}
              id={"afbouwgrafiek"}>
              <Typography
                sx={{ color: 'FFF' }}
                component="span">
                Verwachte afbouw van de schulden/aflossingen
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }} >
              <AflossingenAfbouwGrafiek
              aflossingen={aflossing} aflossingSaldi={aflossingSaldi} />
            </AccordionDetails>
          </Accordion>
        </>
      }
      {aflossingSaldi.map(saldoDTO =>
        <Accordion
        key={saldoDTO.rekeningNaam}
          elevation={2}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={saldoDTO.rekeningNaam}
            id={saldoDTO.rekeningNaam}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              berekenToestandAflossingIcoon(aflossing)
              <Typography
                sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
                component="span"
                align="left">
                {saldoDTO.rekeningNaam}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }} >
            <AflossingTabel
              aflossingSaldo={saldoDTO}
              />
          </AccordionDetails>
        </Accordion>
      )}
      {/* aflossingSaldi: {JSON.stringify(aflossingSaldi)}
      <hr />
      series: {JSON.stringify(getSeries(aflossingSaldi))}
      <hr />
      data: {JSON.stringify(getData(aflossingSaldi))} */}
    </>
  )
}

