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
import { SaldoDTO } from '../../model/Saldo';
import { BetalingDTO } from '@/model/Betaling';
import BetalingTabel from '../Kasboek/BetalingTabel';

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
  const formatAmount = (amount: number | undefined): string => {
    return amount?.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }) ?? '€ undefined';
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
            {saldo.budgetBetaalDag && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>
                  Betaaldag
                </TableCell>
                <TableCell>{saldo.budgetBetaalDag}</TableCell>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Reservering</TableCell>
              <TableCell>{formatAmount(saldo.periodeReservering)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Betalingen</TableCell>
              <TableCell>
                {formatAmount(saldo.periodeBetaling)}<br />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                <BetalingTabel
                  betalingen={betalingen}
                  rekeningNaam={saldo.rekeningNaam}
                  rekeningGroep={undefined}
                  geaggregeerdResultaatOpDatum={[]}
                  onBetalingBewaardChange={function (_: BetalingDTO): void {
                    throw new Error('Function not implemented.');
                  }}
                  onBetalingVerwijderdChange={function (_: BetalingDTO): void {
                    throw new Error('Function not implemented.');
                  }} />

              </TableCell>
            </TableRow>

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