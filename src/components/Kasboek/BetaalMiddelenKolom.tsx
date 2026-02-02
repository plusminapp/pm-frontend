import { Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { RekeningGroepPerBetalingsSoort, RekeningGroepDTO } from '../../model/RekeningGroep';
import { RekeningDTO } from '../../model/Rekening';
import { Stand } from '../../model/Saldo';

type BetaalMiddelenKolomProps = {
  rgpb: RekeningGroepPerBetalingsSoort;
  rgpbIndex: number;
  selectedRekeningGroep: RekeningGroepDTO | undefined;
  selectedRekening: RekeningDTO | undefined;
  stand: Stand | undefined;
  onRekeningClick: (rekeningNaam: string) => void;
  soort: 'van' | 'naar';
};

export const BetaalMiddelenKolom = ({
  rgpb,
  rgpbIndex,
  selectedRekeningGroep,
  selectedRekening,
  stand,
  onRekeningClick,
  soort,
}: BetaalMiddelenKolomProps) => {
  return (
    <>
      <Typography
        textAlign={'center'}
        fontSize={'12px'}
        color="grey"
        marginTop={'12px'}
        marginBottom={'8px'}
      >
        {soort}
      </Typography>
      <Grid
        key={'rekening-' + rgpb.betalingsSoort + '-' + rgpbIndex}
        container
        spacing={2}
        display={'flex'}
        flexDirection={'column'}
        alignItems={soort === 'van' ? 'flex-start' : 'flex-end'}
      >
      {rgpb.rekeningGroepen
        .filter((rg) => rg.naam === selectedRekeningGroep?.naam)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(
          (rg) =>
            rg.rekeningen.length > 1 &&
            rg.rekeningen.map((rekening) => (
              <Button
                key={rekening.naam}
                color="success"
                style={{ textTransform: 'none' }}
                sx={{ p: '3px', fontSize: 11 }}
                variant={
                  selectedRekening?.naam === rekening.naam
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => onRekeningClick(rekening.naam)}
              >
                {rekening.naam} <br />
                {(stand &&
                  stand.resultaatOpDatum
                    .filter((s) => s.rekeningNaam === rekening.naam)
                    ?.map(
                      (s) =>
                        s.openingsReserveSaldo +
                        s.periodeReservering -
                        s.periodeBetaling,
                    )
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString('nl-NL', {
                      style: 'currency',
                      currency: 'EUR',
                    })) ||
                  ''}
              </Button>
            )),
        )}
      </Grid>
      {/* {JSON.stringify(blaat?.naam)} */}
    </>
  );
};
