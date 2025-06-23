import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import StandGeneriekGrafiek from '../../components/Stand/StandGeneriekGrafiek';
import { ResultaatSamenvattingOpDatumDTO } from '../../model/Saldo';
import { berekenRekeningGroepIcoonOpKleur } from './BerekenStandKleurEnTekst';

type SamenvattingGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  resultaatSamenvattingOpDatum: ResultaatSamenvattingOpDatumDTO;
  detailsVisible: boolean;
};

export const SamenvattingGrafiek = (props: SamenvattingGrafiekProps) => {

  const { percentagePeriodeVoorbij, budgetMaandInkomstenBedrag, besteedTotPeilDatum, nogNodigNaPeilDatum, actueleBuffer } = props.resultaatSamenvattingOpDatum;
  const detailsVisible = props.detailsVisible;
  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };
  const gevarenZone = 0.02
  const periodeAfgelopen = props.peilDatum.startOf('day').isSame(dayjs(props.periode.periodeEindDatum).startOf('day'));
  const inGevarenZone = actueleBuffer < gevarenZone * budgetMaandInkomstenBedrag && !periodeAfgelopen;

  const berekenStandGeneriekGrafiek = (): JSX.Element => {
    const bedrag = actueleBuffer.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
    const bufferTekst =
      periodeAfgelopen ? `Over einde periode: ${bedrag}`: 
      actueleBuffer < 0 ?`Pas op. Je houdt deze maand geen geld over! Je dreigt ${bedrag} tekort te komen.` :
      inGevarenZone ? `Beetje rustig aan. De buffer wordt klein: ${bedrag}, dat is minder dan ${gevarenZone * 100}% van je budget.` : 
      'Ga zo door. Je houdt deze maand ruim over, namelijk ' + bedrag;
    const color = actueleBuffer < 0 ? 'red' : inGevarenZone ? 'orange' : 'green';
    return <StandGeneriekGrafiek
      statusIcon={berekenRekeningGroepIcoonOpKleur(36, color)}
      percentageFill={percentagePeriodeVoorbij}
      headerText={'Samenvatting'}
      rekeningIconNaam='samenvatting'
      bodyText={bufferTekst}
      cfoText={''} />
  }

  return (
    <Box sx={{ maxWidth: '500px' }}>
      <Box >
        {berekenStandGeneriekGrafiek()}
      </Box>
      <TableContainer>
        <Table size={"small"}>
          <TableBody>
            <TableRow>
              {besteedTotPeilDatum > 0 && (
                <TableCell
                  width={`${(besteedTotPeilDatum / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: detailsVisible ? '4px solid #333' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  {detailsVisible && formatAmount(besteedTotPeilDatum.toString())}
                </TableCell>
              )}
              {nogNodigNaPeilDatum > 0 && (
                <TableCell
                  width={`${(nogNodigNaPeilDatum / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: '#1977D3',
                    borderBottom: detailsVisible ? '4px solid #1977D3' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  {detailsVisible && formatAmount(nogNodigNaPeilDatum.toString())}
                </TableCell>
              )}
              {actueleBuffer > 0 && (
                <TableCell
                  width={`${(actueleBuffer / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: inGevarenZone ? 'orange' : 'green',
                    color: 'white',
                    textAlign: 'center',
                    borderBottom: detailsVisible && inGevarenZone ? '4px solid orange' :
                      detailsVisible && !inGevarenZone ? '4px solid green' : '0px',
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && formatAmount(actueleBuffer.toString())}
                </TableCell>
              )}
              {actueleBuffer < 0 && (
                <TableCell
                  width={`${(actueleBuffer / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: 'red',
                    color: 'white',
                    textAlign: 'center',
                    borderBottom: detailsVisible ? '4px solid red' : undefined,
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && formatAmount(actueleBuffer.toString())}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {detailsVisible && // TODO: remove false when ready
        <Box maxWidth={'500px'}>
          <Typography variant='body2' sx={{ fontSize: '0.8rem', p: 1 }}>
            Het maandinkomen is {budgetMaandInkomstenBedrag.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} waarvan
            {besteedTotPeilDatum.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} is besteed
            en {nogNodigNaPeilDatum.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} nog nodig is.
            De buffer is dus {actueleBuffer.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}.
          </Typography>
        </Box>}

    </Box>
  );
};

export default SamenvattingGrafiek;