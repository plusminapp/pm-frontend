import { Accordion, AccordionSummary, Typography, AccordionDetails, Link, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { AflossingStatusIcon } from "../../icons/AflossingStatus";
import { BudgetStatusIcon } from "../../icons/BudgetStatus";
import { ExternalLinkIcon } from "../../icons/ExternalLink";
import { InkomstenIcon } from "../../icons/Inkomsten";
import { InternIcon } from "../../icons/Intern";
import { UitgavenIcon } from "../../icons/Uitgaven";
import { AflossingDTO } from "../../model/Aflossing";
import { currencyFormatter, inkomstenBetalingsSoorten, BetalingsSoort, aflossenBetalingsSoorten, reserverenBetalingsSoorten, betalingsSoortFormatter, internBetalingsSoorten, BetalingDTO } from "../../model/Betaling";
import { berekenBedragVoorRekenining, inkomstenRekeningSoorten, interneRekeningSoorten, RekeningGroepDTO, rekeningGroepSoort } from "../../model/RekeningGroep";
import AflossingReserveringTabel from "./AflossingReserveringTabel";
import InkomstenUitgavenTabel from "./InkomstenUitgavenTabel";
import { useCustomContext } from "../../context/CustomContext";
import { BudgetDTO } from "../../model/Budget";
import { Link as RouterLink } from 'react-router-dom';


interface KolommenTabelProps {
  betalingen: BetalingDTO[];
  aflossingen: AflossingDTO[];
  budgetten: BudgetDTO[];
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
}

export default function KolommenTabel(props: KolommenTabelProps) {

  const { rekeningen } = useCustomContext();
  const inkomstenRekeningen: RekeningGroepDTO[] = rekeningen.filter(RekeningGroep => inkomstenRekeningSoorten.includes(RekeningGroep.rekeningGroepSoort))
  const uitgaveRekeningen: RekeningGroepDTO[] = rekeningen.filter(RekeningGroep => RekeningGroep.rekeningGroepSoort === rekeningGroepSoort.uitgaven)
  const interneRekeningen: RekeningGroepDTO[] = rekeningen.filter(RekeningGroep => interneRekeningSoorten.includes(RekeningGroep.rekeningGroepSoort))

  const berekenRekeningTotaal = (RekeningGroep: RekeningGroepDTO) => {
    return props.betalingen.reduce((acc, betaling) => (acc + berekenBedragVoorRekenining(betaling, RekeningGroep)), 0)
  }
  const berekenAflossingTotaal = () => {
    return props.betalingen
      .filter((betaling) => betaling.betalingsSoort && aflossenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
  }
  const berekenReserveringTotaal = () => {
    return props.betalingen
      .filter((betaling) => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc + Number((betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ? betaling.bedrag : -betaling.bedrag))), 0)
  }
  const berekenInkomstenTotaal = (): number => {
    return props.betalingen
      .filter((betaling) => betaling.betalingsSoort === BetalingsSoort.inkomsten ||
        betaling.betalingsSoort === BetalingsSoort.rente)
      .reduce((acc, betaling) => (acc + Number(betaling.bedrag)), 0)
  }
  const berekenUitgavenTotaal = (): number => {
    return props.betalingen
      .filter((betaling) => (betaling.betalingsSoort === BetalingsSoort.uitgaven ||
        betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ||
        betaling.betalingsSoort === BetalingsSoort.aflossen
      ))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
  }
  const heeftReserverenBetalingen = () => {
    return props.betalingen.find((betaling) => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
  }
  const aflossingsBedrag = props.aflossingen.reduce((acc, aflossing) => acc + Number(aflossing.aflossingsBedrag), 0)
  const betaalAchterstand = props.aflossingen.reduce((acc, aflossing) => acc + (Number(aflossing.deltaStartPeriode) ?? 0), 0)

  const budgetOpPeilDatum = (rekeningNaam: string) => {
    return props.budgetten
      .filter(b => b.rekeningNaam === rekeningNaam)
      .reduce((acc, b) => acc + (b.budgetOpPeilDatum ?? 0), 0)
  }

  return (
    <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
      <Grid size={{ xs: 1, lg: 4 }} justifyContent={'center'}>
        {inkomstenRekeningen.length > 0 &&
          <Box display="flex" alignItems="center" justifyContent="flex-start" ml={2}>
            <Box display="flex" alignItems="center" justifyContent="flex-start">
              <InkomstenIcon />
            </Box>
            &nbsp;
            <Typography>{currencyFormatter.format(berekenInkomstenTotaal())}</Typography>
          </Box>
        }
        {inkomstenRekeningen.map(RekeningGroep =>
          <Grid key={RekeningGroep.id}>
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={RekeningGroep.naam}
                id={RekeningGroep.naam}>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    {RekeningGroep.budgetten.length > 0 &&
                      <BudgetStatusIcon verwachtHoog={berekenRekeningTotaal(RekeningGroep)} verwachtLaag={budgetOpPeilDatum(RekeningGroep.naam)} />
                    }
                  </Box>
                  &nbsp;
                  <Typography sx={{ fontSize: '15px' }} component="span">{RekeningGroep.naam}: {currencyFormatter.format(berekenRekeningTotaal(RekeningGroep))} {RekeningGroep.budgetten.length > 0 && `(van ${currencyFormatter.format(budgetOpPeilDatum(RekeningGroep.naam))})`}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <InkomstenUitgavenTabel
                  actueleRekening={RekeningGroep}
                  betalingen={props.betalingen
                    .filter(betaling => betaling.betalingsSoort && inkomstenBetalingsSoorten.includes(betaling.betalingsSoort))}
                  onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
                  onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
      <Grid size={{ xs: 1, lg: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="flex-start" ml={2}>
          <Box display="flex" alignItems="center" justifyContent="flex-start">
            <UitgavenIcon />
          </Box>
          &nbsp;
          <Typography>{currencyFormatter.format(berekenUitgavenTotaal())}</Typography>
        </Box>
        {uitgaveRekeningen.map(RekeningGroep =>
          <Grid key={RekeningGroep.id}>
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={RekeningGroep.naam}
                id={RekeningGroep.naam}>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    {RekeningGroep.budgetten.length > 0 &&
                      <BudgetStatusIcon verwachtHoog={budgetOpPeilDatum(RekeningGroep.naam)} verwachtLaag={-berekenRekeningTotaal(RekeningGroep)} />}
                  </Box>
                  &nbsp;
                  <Typography sx={{ fontSize: '15px' }} component="span">{RekeningGroep.naam}: {currencyFormatter.format(-berekenRekeningTotaal(RekeningGroep))} {RekeningGroep.budgetten.length > 0 && `(van ${currencyFormatter.format(budgetOpPeilDatum(RekeningGroep.naam))})`}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <InkomstenUitgavenTabel
                  actueleRekening={RekeningGroep}
                  onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
                  onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
                  betalingen={props.betalingen.filter(betaling => betaling.betalingsSoort === BetalingsSoort.uitgaven)} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        {props.aflossingen.length > 0 &&
          <Grid >
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls='extra'
                id='extra'>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <Link component={RouterLink} to="/schuld-aflossingen" display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                      <AflossingStatusIcon verwachtHoog={-aflossingsBedrag} verwachtLaag={berekenAflossingTotaal() - betaalAchterstand} />
                      <ExternalLinkIcon />
                    </Link>
                  </Box>
                  &nbsp;
                  <Typography sx={{ fontSize: '15px' }} component="span">
                    Aflossingen: {currencyFormatter.format(-berekenAflossingTotaal())} 
                    {props.aflossingen.length > 0 && `(van ${currencyFormatter.format(aflossingsBedrag - betaalAchterstand)})`}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <AflossingReserveringTabel
                  onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
                  onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
                  betalingen={props.betalingen
                    .filter(betaling => betaling.betalingsSoort && aflossenBetalingsSoorten.includes(betaling.betalingsSoort))}
                  isAflossing={true} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        }
        {heeftReserverenBetalingen() &&
          <Grid >
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls='extra'
                id='extra'>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                  </Box>
                  &nbsp;
                  <Typography sx={{ fontSize: '15px' }} component="span">Reserveringen: {currencyFormatter.format(berekenReserveringTotaal())}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <AflossingReserveringTabel
                  onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
                  onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
                  betalingen={props.betalingen
                    .filter(betaling => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))}
                  isAflossing={false} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        }
      </Grid>
      <Grid size={{ xs: 1, lg: 4 }}>
        {interneRekeningen.length > 0 &&
          <Box display="flex" alignItems="center" justifyContent="flex-start" ml={2}>
            <InternIcon />
          </Box>
        }
        {interneRekeningen.map(RekeningGroep =>
          <Grid key={RekeningGroep.id}>
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={RekeningGroep.naam}
                id={RekeningGroep.naam}>
                {(RekeningGroep.rekeningGroepSoort === rekeningGroepSoort.contant || RekeningGroep.rekeningGroepSoort === rekeningGroepSoort.spaarrekening) &&
                  <Typography sx={{ fontSize: '15px' }} component="span">{betalingsSoortFormatter(RekeningGroep.naam)} opname/storting</Typography>}
                {RekeningGroep.rekeningGroepSoort === rekeningGroepSoort.creditcard &&
                  <Typography sx={{ fontSize: '15px' }} component="span">{betalingsSoortFormatter(RekeningGroep.naam)} incasso</Typography>}
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <InkomstenUitgavenTabel
                  actueleRekening={RekeningGroep}
                  onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
                  onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
                  betalingen={props.betalingen.filter(betaling => betaling.betalingsSoort && internBetalingsSoorten.includes(betaling.betalingsSoort))} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Grid>
    
  )
}
