import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { IconButton, Box } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useState } from 'react';

import { currencyFormatter } from '../../model/Betaling';
import { SaldoDTO } from '../../model/Saldo';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import { useCustomContext } from '../../context/CustomContext';
import { AflossingForm } from './AflossingForm';

interface AflossingProps {
  aflossingSaldo: SaldoDTO;
}

export default function AflossingTabel(props: AflossingProps) {
  const { gekozenPeriode } = useCustomContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lokaleAflossingSaldo, setLokaleAflossingSaldo] = useState(
    props.aflossingSaldo,
  );

  const actueleStand =
    (lokaleAflossingSaldo?.openingsBalansSaldo ?? 0) +
    (lokaleAflossingSaldo?.periodeBetaling ?? 0);
  const maandenTeGaan =
    (lokaleAflossingSaldo?.openingsBalansSaldo ?? 0) === 0
      ? 0
      : Math.ceil(
          -(actueleStand / (lokaleAflossingSaldo?.budgetMaandBedrag ?? 1)),
        );

  const handleEditClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAflossingUpdate = (dossierNummer: string, notities: string) => {
    setLokaleAflossingSaldo((prev) => ({
      ...prev,
      aflossing: prev.aflossing
        ? {
            ...prev.aflossing,
            dossierNummer,
            notities,
          }
        : undefined,
    }));
  };

  return (
    <>
      <TableContainer sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: '100%' }} aria-label="simple table">
          <TableBody>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Stand op{' '}
                {dayjs(lokaleAflossingSaldo?.budgetPeilDatum).format(
                  'D MMMM YYYY',
                )}
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(actueleStand)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Achterstand begin periode
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  lokaleAflossingSaldo?.openingsAchterstand ?? 0,
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Maandbedrag
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  (lokaleAflossingSaldo?.budgetMaandBedrag ?? 0) +
                    (lokaleAflossingSaldo?.openingsAchterstand ?? 0),
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Verwacht deze maand
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  lokaleAflossingSaldo?.budgetMaandBedrag ?? 0,
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Betaling deze periode
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  Math.abs(lokaleAflossingSaldo?.periodeBetaling ?? 0),
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Achterstand nu
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  (lokaleAflossingSaldo?.periodeBetaling ?? 0) -
                    (lokaleAflossingSaldo?.budgetMaandBedrag ?? 0),
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Betaaldag
              </TableCell>
              <TableCell align="right" size="small">
                {lokaleAflossingSaldo?.budgetBetaalDag}e
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Oorspronkelijke schuld
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  lokaleAflossingSaldo?.aflossing?.schuldOpStartDatum ?? 0,
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Maanden nog te gaan
              </TableCell>
              <TableCell align="right" size="small">
                {maandenTeGaan}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Startdatum
              </TableCell>
              <TableCell align="right" size="small">
                {lokaleAflossingSaldo?.aflossing?.startDatum
                  ? dayjs(lokaleAflossingSaldo.aflossing.startDatum).format(
                      'D-M-YYYY',
                    )
                  : ''}{' '}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Verwachte einddatum
              </TableCell>
              <TableCell align="right" size="small">
                {dayjs(gekozenPeriode?.periodeEindDatum)
                  .add(lokaleAflossingSaldo ? maandenTeGaan - 1 : 0, 'month')
                  .set('date', lokaleAflossingSaldo?.budgetBetaalDag ?? 1)
                  .format('D-M-YYYY')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Dossiernummer
              </TableCell>
              <TableCell
                align="right"
                size="small"
                sx={{
                  position: 'relative',
                  pr: 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 1,
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      mr: 1,
                      textAlign: 'right',
                      fontSize: 'inherit',
                    }}
                  >
                    {lokaleAflossingSaldo?.aflossing?.dossierNummer ??
                      'onbekend'}
                  </Typography>
                  <IconButton
                    onClick={handleEditClick}
                    size="small"
                    aria-label="Bewerk dossiernummer en notities"
                    sx={{ p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>{' '}
            <TableRow>
              <TableCell
                colSpan={2}
                align="left"
                size="small"
                sx={{ pl: 2, pr: 0 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    Notitie
                  </Typography>
                  <IconButton
                    onClick={handleEditClick}
                    size="small"
                    aria-label="Bewerk dossiernummer en notities"
                    sx={{
                      p: 0.5,
                      mr: 1,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', pr: 1}}>
                  {lokaleAflossingSaldo?.aflossing?.notities}
                </Typography>
              </TableCell>
            </TableRow>{' '}
          </TableBody>
        </Table>
      </TableContainer>

      <AflossingForm
        aflossingSaldo={lokaleAflossingSaldo}
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleAflossingUpdate}
      />
    </>
  );
}
