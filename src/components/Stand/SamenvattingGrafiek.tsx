import { Box, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
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

  const { percentagePeriodeVoorbij, budgetMaandInkomstenBedrag, besteedTotPeilDatum, gespaardTotPeilDatum, nogNodigNaPeilDatum, actueleBuffer, extraGespaardTotPeilDatum } = props.resultaatSamenvattingOpDatum;
  const detailsVisible = props.detailsVisible;
  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };
  const gevarenZone = 0.02
  const isPeriodeAfgelopen = props.peilDatum.startOf('day').isSame(dayjs(props.periode.periodeEindDatum).startOf('day'));
  const isInGevarenZone = actueleBuffer < gevarenZone * budgetMaandInkomstenBedrag && !isPeriodeAfgelopen;

  const berekenStandGeneriekGrafiek = (): JSX.Element => {
    const roundUp = (value: number) => Math.ceil(value * 100) / 100;
    const bedragRounded = roundUp(Math.abs(actueleBuffer)).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const budgetRounded = roundUp(Number(budgetMaandInkomstenBedrag)).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const percentageBuffer = roundUp((actueleBuffer * 100) / (budgetMaandInkomstenBedrag));
    const bufferTekst =
      isPeriodeAfgelopen && actueleBuffer > 0 ? `Het periodeinkomen was ${budgetRounded} waarvan ${bedragRounded} over was.` :
        isPeriodeAfgelopen && actueleBuffer === 0 ? `Het periodeinkomen was ${budgetRounded} waarmee je precies uit kwam.` :
          isPeriodeAfgelopen && actueleBuffer < 0 ? `Het periodeinkomen was ${budgetRounded} waarbij je ${bedragRounded} tekort kwam.` :
            actueleBuffer < 0 ? `Het periodeinkomen is ${budgetRounded} waarbij je einde van de periode ${bedragRounded} tekort komt.` :
              isInGevarenZone ? `Het periodeinkomen is ${budgetRounded} waarbij je einde van de periode ${bedragRounded} over houdt; dat is ${percentageBuffer}% van het budget.` :
                `Het periodeinkomen is ${budgetRounded} waarvan ${bedragRounded} buffer.`;
    const color = actueleBuffer < 0 ? 'red' : isInGevarenZone ? 'orange' : 'green';
    return <StandGeneriekGrafiek
      statusIcon={berekenRekeningGroepIcoonOpKleur(36, color)}
      percentageFill={percentagePeriodeVoorbij}
      headerText={'Samenvatting'}
      rekeningIconNaam='samenvatting'
      bodyText={bufferTekst}
      cfaText={''} />
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '500px' }}>
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
                  {detailsVisible && (
                    <>
                      {formatAmount(besteedTotPeilDatum.toString())}
                      <br />besteed
                    </>
                  )}
                </TableCell>
              )}
              {gespaardTotPeilDatum > 0 && (
                <TableCell
                  width={`${(gespaardTotPeilDatum / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: '#f1c131',
                    borderBottom: detailsVisible ? '4px solid black' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(gespaardTotPeilDatum.toString())}
                      <br />gespaard
                    </>
                  )}
                </TableCell>
              )}
              {extraGespaardTotPeilDatum > 0 && (
                <TableCell
                  width={`${(extraGespaardTotPeilDatum / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: '#bf9001',
                    borderBottom: detailsVisible ? '4px solid black' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(extraGespaardTotPeilDatum.toString())}
                      <br /> extra gespaard
                    </>
                  )}
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
                  {detailsVisible && (
                    <>
                      {formatAmount(nogNodigNaPeilDatum.toString())}
                      <br />nog nodig
                    </>
                  )}
                </TableCell>
              )}
              {actueleBuffer > 0 && (
                <TableCell
                  width={`${(actueleBuffer / budgetMaandInkomstenBedrag) * 90}%`}
                  sx={{
                    backgroundColor: isInGevarenZone ? 'orange' : 'green',
                    color: 'white',
                    textAlign: 'center',
                    borderBottom: detailsVisible && isInGevarenZone ? '4px solid orange' :
                      detailsVisible && !isInGevarenZone ? '4px solid green' : '0px',
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(actueleBuffer.toString())}
                      <br />
                      {isPeriodeAfgelopen ? 'over' : 'buffer'}
                    </>
                  )}
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
                  {detailsVisible && (
                    <>
                      {formatAmount(Math.abs(actueleBuffer).toString())}
                      <br />
                      tekort
                    </>
                  )}
                </TableCell>
              )}

            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SamenvattingGrafiek;