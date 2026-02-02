import React from 'react';
import { Box, Typography, styled, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

interface PotjesDemoProps {
  naam: string;
  openingsReserveSaldo: number;
  periodeReservering: number;
  periodeBetaling: number;
  nogNodig: number;
  budgetMaandBedrag?: number;
  budgetPeilDatum?: string;
  budgetBetaalDatum?: string;
}

const VIEW_W = 92.4;
const VIEW_H = 129.36;

const IconButton = styled(Box)({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'rgba(226, 226, 226, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    background: 'rgba(171, 171, 171, 0.9)',
    transform: 'scale(1.1)',
  },
});

const IconContainer = styled(Box)({
  position: 'absolute',
  right: '-48px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const PotjesInkomstenDemo: React.FC<PotjesDemoProps> = ({
  naam,
  openingsReserveSaldo,
  periodeReservering,
  periodeBetaling,
  nogNodig,
  budgetMaandBedrag,
  budgetPeilDatum,
  budgetBetaalDatum,
}) => {
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const [open, setOpen] = React.useState(false);
  const [dialogData, setDialogData] = React.useState<Record<string, any> | null>(null);

  // determine before/after betaalDatum
  let voorBetaalDatum = true;
  if (budgetPeilDatum && budgetBetaalDatum) {
    try {
      voorBetaalDatum = new Date(budgetPeilDatum) <= new Date(budgetBetaalDatum);
    } catch (e) {
      voorBetaalDatum = true;
    }
  }

  const maandBedrag = budgetMaandBedrag && budgetMaandBedrag > 0 ? budgetMaandBedrag : 0;

  // base height is max(budgetMaandBedrag, periodeBetaling)
  const base = Math.max(maandBedrag, periodeBetaling, 1);

  const heightFor = (amount: number) => {
    if (base <= 0) return 0;
    return (amount / base) * VIEW_H;
  };

  // allocate heights for multiple areas ensuring minimum height and preventing overflow
  const allocateHeights = (amounts: Array<{ key: string; amount: number }>, minPx = 18) => {
    const raw: Record<string, number> = {};
    for (const a of amounts) raw[a.key] = a.amount > 0 ? (a.amount / base) * VIEW_H : 0;
    const heights: Record<string, number> = { ...raw };
    for (let iter = 0; iter < 10; iter++) {
      const keys = Object.keys(heights).filter(k => heights[k] > 0);
      let total = keys.reduce((s, k) => s + heights[k], 0);
      if (total <= VIEW_H) {
        for (const k of keys) if (heights[k] > 0) heights[k] = Math.max(heights[k], Math.min(minPx, VIEW_H));
        break;
      }
      const scale = VIEW_H / total;
      let changed = false;
      for (const k of keys) {
        const newH = Math.max(minPx, heights[k] * scale);
        if (Math.abs(newH - heights[k]) > 0.1) {
          heights[k] = newH;
          changed = true;
        } else {
          heights[k] = newH;
        }
      }
      if (!changed) break;
    }
    return heights;
  };

  // decide rendering cases
  const isPeriodeAtLeastMaand = periodeBetaling >= maandBedrag;

  // colors
  const gray = '#9e9e9e';
  const green = '#2e7d32';
  const orange = '#ff9800';

  // border and shapes
  let borderColor = gray;
  const shapes: React.ReactNode[] = [];
  const texts: React.ReactNode[] = [];

  if (isPeriodeAtLeastMaand) {
    // pot height = periodeBetaling (base == periodeBetaling)
    borderColor = gray;
    // allocate heights for fill, maand (budget), and extra above the dashed line
    const extraAbove = Math.max(0, periodeBetaling - maandBedrag);
    const alloc = allocateHeights([
      { key: 'fill', amount: periodeBetaling },
      { key: 'maand', amount: maandBedrag },
      { key: 'extraAbove', amount: extraAbove },
    ]);
    const fillH = alloc['fill'] || 0;
    const maandH = alloc['maand'] || 0;
    const extraH = alloc['extraAbove'] || 0;

    if (fillH > 0) {
      shapes.push(<rect key="fill" x="0" y={VIEW_H - fillH} width={VIEW_W} height={fillH} fill={gray} />);
    }

    // dashed line at budgetMaandBedrag (only if provided and >0)
    if (maandBedrag > 0) {
      const lineY = VIEW_H - maandH;
      shapes.push(<line key="dashed" x1="4" x2={VIEW_W - 4} y1={lineY} y2={lineY} stroke="#fff" strokeWidth={1} strokeDasharray="4 3" />);

      // show amount above dashed line when space allows
      if (extraH >= 18) {
        const y = VIEW_H - (fillH + maandH) / 2;
        shapes.push(
          <text key="extraAboveAmt" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
            {formatAmount(extraAbove)}
          </text>,
        );
      }
    }

    // texts: periodeBetaling in fill (hide when periodeBetaling > maand)
    if (fillH >= 18 && !(periodeBetaling > maandBedrag)) {
      texts.push(
        <text key="fillAmt" x={VIEW_W / 2} y={VIEW_H - fillH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
          {formatAmount(periodeBetaling)}
        </text>,
      );
    }

    // budgetMaandBedrag label near dashed line if space
    if (maandBedrag > 0) {
      if (maandH >= 12) {
        const y = VIEW_H - maandH / 2;
        texts.push(
          <text key="maandAmt" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
            {formatAmount(maandBedrag)}
          </text>,
        );
      }
    }
  } else {
    // periodeBetaling < maand -> pot height = maand
    if (voorBetaalDatum) {
      borderColor = green;
      const fillH = heightFor(periodeBetaling);
      if (fillH > 0) shapes.push(<rect key="green" x="0" y={VIEW_H - fillH} width={VIEW_W} height={fillH} fill="#4caf50" />);

      const topAmount = Math.max(0, maandBedrag - periodeBetaling);
      const topH = heightFor(topAmount);
      if (topH > 0) {
        // transparent top - no rect, only text
      }

      // texts
      if (fillH >= 18) {
        texts.push(
          <text key="greenAmt" x={VIEW_W / 2} y={VIEW_H - fillH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#fff" style={{ fontFamily: 'Roboto' }}>
            {formatAmount(periodeBetaling)}
          </text>,
        );
      }
      if (topH >= 18) {
        const y = VIEW_H - fillH - topH / 2;
        texts.push(
          <text key="topAmt" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
            {formatAmount(topAmount)}
          </text>,
        );
      }
    } else {
      // na betaaldatum
      borderColor = orange;
      const fillH = heightFor(periodeBetaling);
      if (fillH > 0) shapes.push(<rect key="orange" x="0" y={VIEW_H - fillH} width={VIEW_W} height={fillH} fill="#ffb74d" />);

      const topAmount = Math.max(0, maandBedrag - periodeBetaling);
      const topH = heightFor(topAmount);

      if (fillH >= 18) {
        texts.push(
          <text key="orangeAmt" x={VIEW_W / 2} y={VIEW_H - fillH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
            {formatAmount(periodeBetaling)}
          </text>,
        );
      }
      if (topH >= 18) {
        const y = VIEW_H - fillH - topH / 2;
        texts.push(
          <text key="topAmtAfter" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
            {formatAmount(topAmount)}
          </text>,
        );
      }
    }
  }

  return (
    <Box sx={{ width: `${VIEW_W}px`, margin: '12px auto', position: 'relative' }}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography
          sx={{
            color: '#333',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontFamily: 'Roboto',
          }}
        >
          {naam}
        </Typography>
      </Box>

      <svg width={VIEW_W} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ display: 'block' }}>
        <defs>
          <clipPath id="potClipInc">
            <polygon points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04" />
          </clipPath>
        </defs>

        <polygon
          points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04"
          fill="#fff"
          stroke={borderColor}
          strokeWidth="2.64"
          strokeLinejoin="miter"
        />

        <g clipPath="url(#potClipInc)">{shapes}{texts}</g>
      </svg>

      <IconContainer>
        <IconButton
          onClick={() => {
            setDialogData({
              naam,
              openingsReserveSaldo,
              periodeReservering,
              periodeBetaling,
              nogNodig,
              budgetMaandBedrag,
              budgetPeilDatum,
              budgetBetaalDatum,
            });
            setOpen(true);
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: '18px', color: '#666' }} />
        </IconButton>
      </IconContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Potje: {naam}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dialogData &&
              Object.entries(dialogData).map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#333' }}>{k}</Typography>
                  <Typography sx={{ color: '#333' }}>{String(v ?? '')}</Typography>
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Sluiten</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PotjesInkomstenDemo;
