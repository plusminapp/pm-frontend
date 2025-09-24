import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { BudgetStatusIcon } from '../../icons/BudgetStatus';
import { InkomstenIcon } from '../../icons/Inkomsten';
import { InternIcon } from '../../icons/Intern';
import { UitgavenIcon } from '../../icons/Uitgaven';
import {
  currencyFormatter,
  inkomstenBetalingsSoorten,
  BetalingsSoort,
  betalingsSoortFormatter,
  internBetalingsSoorten,
  BetalingDTO,
  uitgavenBetalingsSoorten,
} from '../../model/Betaling';
import {
  berekenBedragVoorRekenining,
  inkomstenRekeningGroepSoorten,
  interneRekeningGroepSoorten,
  RekeningGroepDTO,
  RekeningGroepSoort,
  uitgavenRekeningGroepSoorten,
} from '../../model/RekeningGroep';
import { useCustomContext } from '../../context/CustomContext';
import { SaldoDTO } from '../../model/Saldo';
import BetalingTabel from './BetalingTabel';

interface KolommenTabelProps {
  betalingen: BetalingDTO[];
  geaggregeerdResultaatOpDatum: SaldoDTO[];
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
}

export default function KolommenTabel(props: KolommenTabelProps) {
  const { rekeningGroepPerBetalingsSoort } = useCustomContext();
  const rekeningGroepen = Array.from(
    new Map(
      rekeningGroepPerBetalingsSoort
        .flatMap((bs) => bs.rekeningGroepen)
        .map((r) => [r.id, r]),
    ).values(),
  );

  const inkomstenRekeningen: RekeningGroepDTO[] = rekeningGroepen.filter(
    (rekeningGroep) =>
      inkomstenRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort),
  );
  const uitgaveRekeningen: RekeningGroepDTO[] = rekeningGroepen.filter(
    (rekeningGroep) =>
      uitgavenRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort),
  );
  const interneRekeningen: RekeningGroepDTO[] = rekeningGroepen.filter(
    (rekeningGroep) =>
      interneRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort),
  );

  const berekenRekeningTotaal = (RekeningGroep: RekeningGroepDTO) => {
    return props.betalingen.reduce(
      (acc, betaling) =>
        acc + berekenBedragVoorRekenining(betaling, RekeningGroep),
      0,
    );
  };
  const berekenInkomstenTotaal = (): number => {
    return props.betalingen
      .filter(
        (betaling) => betaling.betalingsSoort === BetalingsSoort.inkomsten,
      )
      .reduce((acc, betaling) => acc + Number(betaling.bedrag), 0);
  };
  const berekenUitgavenTotaal = (): number => {
    return props.betalingen
      .filter(
        (betaling) =>
          betaling.betalingsSoort === BetalingsSoort.uitgaven ||
          betaling.betalingsSoort === BetalingsSoort.aflossen,
      )
      .reduce((acc, betaling) => acc - betaling.bedrag, 0);
  };

  return (
    <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
      <Grid size={{ xs: 1, lg: 4 }} justifyContent={'center'}>
        {inkomstenRekeningen.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            ml={2}
          >
            <Box display="flex" alignItems="center" justifyContent="flex-start">
              <InkomstenIcon />
            </Box>
            &nbsp;
            <Typography>
              {currencyFormatter.format(berekenInkomstenTotaal())}
            </Typography>
          </Box>
        )}
        {inkomstenRekeningen.map((rekeningGroep) => (
          <Grid key={rekeningGroep.id}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={rekeningGroep.naam}
                id={rekeningGroep.naam}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    {rekeningGroep.rekeningen.length > 0 && (
                      <BudgetStatusIcon
                        verwachtHoog={berekenRekeningTotaal(rekeningGroep)}
                        verwachtLaag={0}
                      />
                    )}
                  </Box>
                  &nbsp;
                  <Typography sx={{ fontSize: '15px' }} component="span">
                    {rekeningGroep.naam}:{' '}
                    {currencyFormatter.format(
                      berekenRekeningTotaal(rekeningGroep),
                    )}{' '}
                    {rekeningGroep.rekeningen.length > 0 && `van TODO`}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <BetalingTabel
                  rekeningGroep={rekeningGroep}
                  betalingen={props.betalingen.filter(
                    (betaling) =>
                      betaling.betalingsSoort &&
                      inkomstenBetalingsSoorten.includes(
                        betaling.betalingsSoort,
                      ),
                  )}
                  onBetalingBewaardChange={(betalingDTO) =>
                    props.onBetalingBewaardChange(betalingDTO)
                  }
                  onBetalingVerwijderdChange={(betalingDTO) =>
                    props.onBetalingVerwijderdChange(betalingDTO)
                  }
                  geaggregeerdResultaatOpDatum={
                    props.geaggregeerdResultaatOpDatum
                  }
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
      <Grid size={{ xs: 1, lg: 4 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          ml={2}
        >
          <Box display="flex" alignItems="center" justifyContent="flex-start">
            <UitgavenIcon />
          </Box>
          &nbsp;
          <Typography>
            {currencyFormatter.format(berekenUitgavenTotaal())}
          </Typography>
        </Box>
        {uitgaveRekeningen.map((rekeningGroep) => (
          <Grid key={rekeningGroep.id}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={rekeningGroep.naam}
                id={rekeningGroep.naam}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    {rekeningGroep.rekeningen.length > 0 && (
                      <BudgetStatusIcon
                        verwachtHoog={0}
                        verwachtLaag={-berekenRekeningTotaal(rekeningGroep)}
                      />
                    )}
                  </Box>
                  &nbsp;
                  <Typography sx={{ fontSize: '15px' }} component="span">
                    {rekeningGroep.naam}:{' '}
                    {currencyFormatter.format(
                      -berekenRekeningTotaal(rekeningGroep),
                    )}{' '}
                    {rekeningGroep.rekeningen.length > 0 && `van TODO`}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <BetalingTabel
                  rekeningGroep={rekeningGroep}
                  onBetalingBewaardChange={(betalingDTO) =>
                    props.onBetalingBewaardChange(betalingDTO)
                  }
                  onBetalingVerwijderdChange={(betalingDTO) =>
                    props.onBetalingVerwijderdChange(betalingDTO)
                  }
                  betalingen={props.betalingen.filter(
                    (betaling) =>
                      betaling.betalingsSoort &&
                      uitgavenBetalingsSoorten.includes(
                        betaling.betalingsSoort,
                      ),
                  )}
                  geaggregeerdResultaatOpDatum={
                    props.geaggregeerdResultaatOpDatum
                  }
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
      <Grid size={{ xs: 1, lg: 4 }}>
        {interneRekeningen.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            ml={2}
          >
            <InternIcon />
          </Box>
        )}
        {interneRekeningen.map((rekeningGroep) => (
          <Grid key={rekeningGroep.id}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={rekeningGroep.naam}
                id={rekeningGroep.naam}
              >
                {(rekeningGroep.rekeningGroepSoort ===
                  RekeningGroepSoort.contant ||
                  rekeningGroep.rekeningGroepSoort ===
                    RekeningGroepSoort.spaarrekening) && (
                  <Typography sx={{ fontSize: '15px' }} component="span">
                    {betalingsSoortFormatter(rekeningGroep.naam)}{' '}
                    opname/storting
                  </Typography>
                )}
                {rekeningGroep.rekeningGroepSoort ===
                  RekeningGroepSoort.creditcard && (
                  <Typography sx={{ fontSize: '15px' }} component="span">
                    {betalingsSoortFormatter(rekeningGroep.naam)} incasso
                  </Typography>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <BetalingTabel
                  rekeningGroep={rekeningGroep}
                  onBetalingBewaardChange={(betalingDTO) =>
                    props.onBetalingBewaardChange(betalingDTO)
                  }
                  onBetalingVerwijderdChange={(betalingDTO) =>
                    props.onBetalingVerwijderdChange(betalingDTO)
                  }
                  betalingen={props.betalingen.filter(
                    (betaling) =>
                      betaling.betalingsSoort &&
                      internBetalingsSoorten.includes(betaling.betalingsSoort),
                  )}
                  geaggregeerdResultaatOpDatum={
                    props.geaggregeerdResultaatOpDatum
                  }
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
