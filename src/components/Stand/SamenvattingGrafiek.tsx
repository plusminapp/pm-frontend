import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { useState } from 'react';
import StandGeneriekGrafiek from '../../components/Stand/StandGeneriekGrafiek';
import { BudgetSamenvatting } from '../../model/Budget';

type SamenvattingGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  budgetSamenvatting: BudgetSamenvatting;
  toonBudgetDetails: boolean;
};

export const SamenvattingGrafiek = (props: SamenvattingGrafiekProps) => {

  const { percentagePeriodeVoorbij, budgetMaandInkomstenBedrag, besteedTotPeilDatum, nogNodigNaPeilDatum, actueleBuffer } = props.budgetSamenvatting;

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };
  const gevarenZone = 0.02
  const inGevarenZone = actueleBuffer < gevarenZone * budgetMaandInkomstenBedrag

  const berekenStandGeneriekGrafiek = (): JSX.Element => {
    const bufferTekst = props.peilDatum.startOf('day').isSame(dayjs(props.periode.periodeEindDatum).startOf('day')) ? 'Over einde periode' : 'Buffer';
    const status = actueleBuffer == 0 ? 'red' : inGevarenZone ? 'orange' : 'green';
    return <StandGeneriekGrafiek
      status={status}
      percentageFill={percentagePeriodeVoorbij}
      headerText={'Samenvatting'}
      rekeningIconNaam='samenvatting'
      bodyText={`${bufferTekst}: ${actueleBuffer.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}`}
      cfoText={''} />
  }

  const [detailsVisible, setDetailsVisible] = useState(false);
  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible);
  }
  return (
    <Box sx={{ maxWidth: '500px' }}>
      <Box onClick={toggleDetails} sx={{ cursor: 'pointer' }}>
        {berekenStandGeneriekGrafiek()}
      </Box>
      <TableContainer onClick={toggleDetails} sx={{ cursor: 'pointer' }}>
        <Table size={"small"}>
        {/* <Table size={!detailsVisible ? "small" : undefined}> */}
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
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {props.toonBudgetDetails && detailsVisible &&
        <Box maxWidth={'500px'}>
          <Typography variant='body2' sx={{ fontSize: '0.8rem', p: 1 }}>
            Het maandinkomen is {budgetMaandInkomstenBedrag.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} waarvan {besteedTotPeilDatum.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} is besteed 
            en {nogNodigNaPeilDatum.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} nog nodig is. 
            De buffer is dus {actueleBuffer.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}.
          </Typography>
        </Box>}

    </Box>
  );
};

export default SamenvattingGrafiek;