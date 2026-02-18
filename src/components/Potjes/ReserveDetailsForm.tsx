import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { SaldoDTO } from '../../model/Saldo';
import { BetalingDTO, BetalingsSoort } from '@/model/Betaling';
import BetalingTabel from '../Kasboek/BetalingTabel';
import { useCustomContext } from '@/context/CustomContext';
import dayjs from 'dayjs';

interface ReserveDetailsFormProps {
  betalingen: BetalingDTO[];
  saldo: SaldoDTO;
  onClose: () => void;
}

export const ReserveDetailsForm: React.FC<ReserveDetailsFormProps> = ({
  betalingen,
  saldo,
  onClose,
}) => {
  const [contextBetalingen, setContextBetalingen] = useState<BetalingDTO[]>(betalingen);
  const [showReserveTable, setShowReserveTable] = useState<boolean>(false);
  const [showBetalingTable, setShowBetalingTable] = useState<boolean>(false);
  const [reserveBetalingen, setReserveBetalingen] = useState<BetalingDTO[]>([]);
  const [otherBetalingen, setOtherBetalingen] = useState<BetalingDTO[]>([]);

  useEffect(() => {
    setReserveBetalingen(contextBetalingen.filter(betaling => betaling.betalingsSoort === BetalingsSoort.reserveren));
    setOtherBetalingen(contextBetalingen.filter(betaling => betaling.betalingsSoort !== BetalingsSoort.reserveren));
  }, [contextBetalingen]);

  const formatAmount = (amount: number | undefined): string => {
    return amount?.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }) ?? '€ undefined';
  };

  const formatDate = (d?: string | Date): string => {
    if (!d) return '';
    try {
      const date = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(date.getTime())) return String(d);
      return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return String(d);
    }
  };

  const { setIsStandDirty, gekozenPeriode } =
    useCustomContext();

  const isBoekingInGekozenPeriode = (boekingsdatum: string | Date) =>
    dayjs(boekingsdatum).isAfter(
      dayjs(gekozenPeriode?.periodeStartDatum).subtract(1, 'day'),
    ) &&
    dayjs(boekingsdatum).isBefore(
      dayjs(gekozenPeriode?.periodeEindDatum).add(1, 'day'),
    );

  const onBetalingBewaardChange = (betaling: BetalingDTO): void => {
    if (betaling && isBoekingInGekozenPeriode(betaling.boekingsdatum)) {
      setContextBetalingen(prev => {
        const index = prev.findIndex(b => b.id === betaling.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = betaling;
          return updated;
        }
        return [...prev, betaling];
      });
      setIsStandDirty(true);
    }
  };
  const onBetalingVerwijderdChange = (betaling: BetalingDTO): void => {
    if (betaling && isBoekingInGekozenPeriode(betaling.boekingsdatum)) {
      setContextBetalingen(prev => prev.filter(b => b.id !== betaling.id));
      setIsStandDirty(true);
    }
  };


  const reserveNu =
    saldo.openingsReserveSaldo + saldo.periodeReservering - saldo.periodeBetaling;
  const eindReserve = reserveNu - saldo.komtNogNodig;

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {saldo.rekeningNaam}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            {saldo.budgetBetaalDatum && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>
                  Betaaldatum
                </TableCell>
                <TableCell>{formatDate(saldo.budgetBetaalDatum)}</TableCell>
              </TableRow>
            )}

            {saldo.budgetMaandBedrag !== 0 && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Budget</TableCell>
                <TableCell>{formatAmount(saldo.budgetMaandBedrag)}</TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Opening</TableCell>
              <TableCell>
                {formatAmount(saldo.openingsReserveSaldo)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>In het potje gestopt</TableCell>
              <TableCell sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>{formatAmount(saldo.periodeReservering)}</Box>
                <Box>
                  <IconButton size="small" onClick={() => setShowReserveTable(v => !v)}>
                    {showReserveTable ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                  <Typography component="span" sx={{ ml: 0.5 }}>{reserveBetalingen.length}</Typography>
                </Box>
              </TableCell>
            </TableRow>

            {showReserveTable && (
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                  <BetalingTabel
                    betalingen={reserveBetalingen}
                    rekeningNaam={saldo.rekeningNaam}
                    rekeningGroep={undefined}
                    geaggregeerdResultaatOpDatum={[]}
                    isReserveringenTabel={true}
                    onBetalingBewaardChange={function (_: BetalingDTO): void {
                      setIsStandDirty(true);
                    }}
                    onBetalingVerwijderdChange={function (_: BetalingDTO): void {
                      setIsStandDirty(true);
                    }} />

                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Betalingen</TableCell>
              <TableCell sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>{formatAmount(saldo.periodeBetaling)}</Box>
                <Box>
                  <IconButton size="small" onClick={() => setShowBetalingTable(v => !v)}>
                    {showBetalingTable ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                  <Typography component="span" sx={{ ml: 0.5 }}>{otherBetalingen.length}</Typography>
                </Box>
              </TableCell>
            </TableRow>

            {showBetalingTable && (
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                  <BetalingTabel
                    betalingen={otherBetalingen}
                    rekeningNaam={saldo.rekeningNaam}
                    rekeningGroep={undefined}
                    geaggregeerdResultaatOpDatum={[]}
                    onBetalingBewaardChange={onBetalingBewaardChange}
                    onBetalingVerwijderdChange={onBetalingVerwijderdChange} />

                </TableCell>
              </TableRow>
            )}

            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Reserve nu</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                {formatAmount(reserveNu)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nog nodig</TableCell>
              <TableCell>{formatAmount(saldo.komtNogNodig)}</TableCell>
            </TableRow>

            <TableRow
              sx={{
                backgroundColor: eindReserve >= 0 ? '#e8f5e9' : '#ffebee',
              }}
            >
              <TableCell sx={{ fontWeight: 'bold' }}>Eindreserve</TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: eindReserve >= 0 ? '#4caf50' : '#f44336',
                }}
              >
                {formatAmount(eindReserve)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};