import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Box from '@mui/material/Box';

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { AflossingDTO, ExtendedAflossingDTO } from '../model/Aflossing'
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import AflossingTabel from "../components/Aflossing/AflossingTabel";
import { MinIcon } from "../icons/Min";
import { PlusIcon } from "../icons/Plus";
import dayjs from "dayjs";
import { AflossingenAfbouwGrafiek } from "../components/Aflossing/Graph/AflossingenAfbouwGrafiek";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { useNavigate } from "react-router-dom";
import { dagInPeriode } from "../model/Periode";

export default function Aflossingen() {

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode, setSnackbarMessage } = useCustomContext();

  const [aflossingen, setAflossingen] = useState<ExtendedAflossingDTO[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const fetchAflossingen = useCallback(async () => {
    if (actieveHulpvrager && gekozenPeriode) {
      setIsLoading(true);
      const id = actieveHulpvrager!.id
      let token
      try {
        token = await getIDToken();
      } catch (error) {
        setIsLoading(false);
        navigate('/login');
      }
      const formDatum = dayjs().isAfter(dayjs(gekozenPeriode.periodeEindDatum)) ? dayjs(gekozenPeriode.periodeEindDatum) : dayjs();
      const response = await fetch(`/api/v1/aflossing/hulpvrager/${id}/datum/${formDatum.toISOString().slice(0, 10)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setAflossingen(result.map((aflossing: AflossingDTO) => toExtendedAflossingDTO(aflossing)));
      } else {
        console.error("Failed to fetch data", response.status);
        setSnackbarMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: "warning"
        })
      }
    }
  }, [getIDToken, actieveHulpvrager, gekozenPeriode]);

  useEffect(() => {
    fetchAflossingen();
  }, [fetchAflossingen]);

  const aflossingMoetBetaaldZijn = (betaalDag: number | undefined, peilDatum: dayjs.Dayjs | undefined) => {
    if (betaalDag === undefined || gekozenPeriode === undefined) return true;
    const betaalDagInPeriode = dagInPeriode(betaalDag, gekozenPeriode);
    return !betaalDagInPeriode.isAfter(peilDatum);
  }
  const toExtendedAflossingDTO = (aflossing: AflossingDTO): ExtendedAflossingDTO => {
    const aflossingMoetZijnBetaald = aflossingMoetBetaaldZijn(aflossing.betaalDag, dayjs(aflossing.aflossingPeilDatum));
    const actueleAchterstand = (aflossing.deltaStartPeriode ?? 0) + (aflossing.aflossingBetaling ?? 0) - (aflossingMoetZijnBetaald ? (aflossing.aflossingsBedrag ?? 0) : 0)
    console.log("actueleAchterstand", actueleAchterstand, 'saldoStartPeriode', (aflossing.saldoStartPeriode ?? 0), 'aflossingBetaling', aflossing.aflossingBetaling, 'actuelestand', (aflossing.saldoStartPeriode ?? 0) + (aflossing.aflossingBetaling ?? 0));
    return {
      ...aflossing,
      aflossingMoetBetaaldZijn: aflossingMoetZijnBetaald,
      actueleStand: (aflossing.saldoStartPeriode ?? 0) - (aflossing.aflossingBetaling ?? 0),
      actueleAchterstand: actueleAchterstand,
      meerDanVerwacht: !aflossingMoetZijnBetaald && actueleAchterstand > 0 ? actueleAchterstand : 0,
      minderDanVerwacht: actueleAchterstand < 0 ? -actueleAchterstand : 0,
      meerDanMaandAflossing: aflossingMoetZijnBetaald && actueleAchterstand > 0 ? actueleAchterstand : 0
    } as ExtendedAflossingDTO
  }

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De aflossingen worden opgehaald.</Typography>
  }

  const berekenToestandAflossingIcoon = (aflossing: ExtendedAflossingDTO): JSX.Element => {
    if (aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0) {
      if (!aflossing.aflossingMoetBetaaldZijn)
        return <PlusIcon color="#1977d3" height={18} />
      else return <PlusIcon color="#green" height={18} />
    }
    if (aflossing.minderDanVerwacht > 0) return <MinIcon color="red" height={18} />
    if (aflossing.meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={18} />
    if (aflossing.meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={18} />
    return <PlusIcon color="black" />
  }

  return (
    <>
      {aflossingen.length === 0 &&
        <Typography variant='h4'>{actieveHulpvrager?.bijnaam} heeft geen schulden/aflossingen ingericht.</Typography>
      }
      {aflossingen.length > 0 &&
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
                aflossingen={aflossingen} />
            </AccordionDetails>
          </Accordion>
        </>
      }
      {aflossingen.map(aflossing =>
        <Accordion
          elevation={2}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={aflossing.rekening.naam}
            id={aflossing.rekening.naam}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {berekenToestandAflossingIcoon(aflossing)}
              <Typography
                sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
                component="span"
                align="left">
                {aflossing.rekening.naam}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }} >
            <AflossingTabel
              aflossing={aflossing} />
          </AccordionDetails>
        </Accordion>
      )}
    </>
  )
}

