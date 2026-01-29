import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

interface PotjesDemoProps {
  naam: string;
  openingsReserveSaldo: number;
  periodeReservering: number;
  periodeBetaling: number;
  nogNodig: number;
  budgetMaandBedrag?: number;
  bedragPerMaandTeGaan?: number;
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

export const PotjesSparenDemo: React.FC<PotjesDemoProps> = ({
  naam,
  openingsReserveSaldo,
  periodeReservering,
  periodeBetaling,
  nogNodig,
  budgetMaandBedrag,
  bedragPerMaandTeGaan,
}) => {
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };
  // reservering = periodeReservering - periodeBetaling
  const reservering = periodeReservering - periodeBetaling;
  const maand = budgetMaandBedrag && budgetMaandBedrag > 0 ? budgetMaandBedrag : 0;
  const perMaand = bedragPerMaandTeGaan && bedragPerMaandTeGaan > 0 ? bedragPerMaandTeGaan : 0;
  const need = Math.max(0, nogNodig);

  // visual defaults
  let base = 1;
  let fillColor = '#4caf50';
  let dashY: number | null = null;
  let dashColor = '#fff';
  let showNotif = false;
  let inhoudToShow = 0; // value used to draw the filled rect
  let isError = false;

  // CASE A: both zero
  if (perMaand === 0 && maand === 0) {
    if (reservering >= 0) {
      // grootte = inhoud = openingsReserveSaldo + reservering
      inhoudToShow = Math.max(0, openingsReserveSaldo + reservering);
      base = Math.max(1, inhoudToShow);
      fillColor = '#4caf50';
      // white dashed line at openingsReserveSaldo
      dashY = VIEW_H - (openingsReserveSaldo / base) * VIEW_H;
      dashColor = '#fff';
    } else {
      // reservering < 0: grootte = openingsReserveSaldo, inhoud = openingsReserveSaldo + reservering
      base = Math.max(1, openingsReserveSaldo);
      inhoudToShow = Math.max(0, openingsReserveSaldo + reservering);
      fillColor = '#4caf50';
      // green dashed line at openingsReserveSaldo
      dashY = VIEW_H - (openingsReserveSaldo / base) * VIEW_H;
      dashColor = '#2e7d32';
    }

    // CASE B: maand > 0, perMaand == 0
  } else if (perMaand === 0 && maand > 0) {
    // reservering < 0 => error potje
    if (reservering < 0) {
      isError = true;
    } else {
      base = Math.max(1, Math.max(maand, reservering));
      inhoudToShow = reservering;
      if (reservering >= maand) {
        fillColor = '#4caf50';
        dashY = VIEW_H - (maand / base) * VIEW_H; // white dashed at budgetMaandBedrag
        dashColor = '#fff';
      } else if (reservering > 0 && reservering < maand) {
        fillColor = '#ffb74d';
        dashY = null;
      }
    }

    // CASE C: perMaand > 0
  } else {
    // perMaand > 0 (and maand > 0 assumed)
    const budget = Math.max(maand, perMaand);
    if (reservering < 0) {
      isError = true;
    } else {
      base = Math.max(1, Math.max(budget, reservering));
      inhoudToShow = reservering;
      showNotif = maand < perMaand;
      if (reservering >= budget) {
        fillColor = '#4caf50';
        dashY = VIEW_H - (budget / base) * VIEW_H; // white dashed at budget
        dashColor = '#fff';
      } else if (reservering > 0 && reservering < budget) {
        fillColor = '#ffb74d';
        // orange dashed at reservering
        dashY = VIEW_H - (reservering / base) * VIEW_H;
        dashColor = '#ff9800';
      }
    }
  }

  const heightFor = (amount: number) => {
    if (base <= 0) return 0;
    return (amount / base) * VIEW_H;
  };

  const borderColor = fillColor === '#4caf50' ? '#2e7d32' : fillColor === '#ffb74d' ? '#ff9800' : '#2e7d32';

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
      <svg
        width={VIEW_W}
        height={VIEW_H}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id="potClipSparen">
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

        {isError ? (
          <g>
            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="36"
              fill="#d32f2f"
            >
              !
            </text>
          </g>
        ) : (
          <g clipPath="url(#potClipSparen)">
            {/* main fill based on computed base and fillColor */}
            {heightFor(inhoudToShow) > 0 && (
              <rect x="0" y={VIEW_H - heightFor(inhoudToShow)} width={VIEW_W} height={heightFor(inhoudToShow)} fill={fillColor} />
            )}

            {/* dashed line if applicable */}
            {dashY !== null && (
              <line x1="4" x2={VIEW_W - 4} y1={dashY} y2={dashY} stroke={dashColor} strokeWidth={1} strokeDasharray="4 3" />
            )}

            {/* notification dot when budgetMaandBedrag < bedragPerMaandTeGaan */}
            {showNotif && (
              <circle cx={VIEW_W + 4} cy={6} r={6} fill="#d32f2f" />
            )}

            {/* amount labels: render only if there's enough height */}
            {heightFor(inhoudToShow) >= 18 && (
              <text x={VIEW_W / 2} y={VIEW_H - heightFor(inhoudToShow) / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill={fillColor === '#4caf50' ? '#fff' : '#000'} style={{ fontFamily: 'Roboto' }}>
                {formatAmount(inhoudToShow)}
              </text>
            )}

            {dashY !== null && (() => {
              // when dash is inside the fill and dash is white, show nogNodig below dash inside fill
              const dashAmount = ((): number => {
                if (perMaand === 0 && maand === 0) return openingsReserveSaldo;
                if (perMaand === 0 && maand > 0) return periodeReservering >= maand ? maand : periodeReservering;
                return periodeReservering >= Math.max(maand, perMaand) ? Math.max(maand, perMaand) : periodeReservering;
              })();
              const dashInsideFill = dashY > VIEW_H - heightFor(inhoudToShow);
              const extraAbove = Math.max(0, inhoudToShow - dashAmount);
              const extraAboveH = heightFor(extraAbove);

              const nodes: React.ReactNode[] = [];
              if (dashInsideFill) {
                // show nogNodig centered below dashed line (inside fill)
                const yUnder = dashY + 10;
                if (heightFor(dashAmount) >= 12) {
                  nodes.push(
                    <text key="dashInsideAmount" x={VIEW_W / 2} y={yUnder} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#fff" style={{ fontFamily: 'Roboto' }}>
                      {formatAmount(dashAmount)}
                    </text>,
                  );
                }

                // show remaining above dashed line if space
                if (extraAboveH >= 18) {
                  const yAbove = VIEW_H - heightFor(inhoudToShow) + extraAboveH / 2;
                  nodes.push(
                    <text key="dashInsideAbove" x={VIEW_W / 2} y={yAbove} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#fff" style={{ fontFamily: 'Roboto' }}>
                      {formatAmount(extraAbove)}
                    </text>,
                  );
                }
              } else {
                // dashed line is above the fill (show inhoud inside red/orange fill and extra above)
                if (heightFor(inhoudToShow) >= 18) {
                  const yCenter = VIEW_H - heightFor(inhoudToShow) / 2;
                  nodes.push(
                    <text key="inhoudCenter" x={VIEW_W / 2} y={yCenter} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill={fillColor === '#4caf50' ? '#fff' : '#000'} style={{ fontFamily: 'Roboto' }}>
                      {formatAmount(inhoudToShow)}
                    </text>,
                  );
                }
                const extraNeeded = Math.max(0, need - inhoudToShow);
                const extraNeededH = heightFor(extraNeeded);
                if (extraNeededH >= 18) {
                  const y = VIEW_H - heightFor(inhoudToShow) - extraNeededH / 2;
                  nodes.push(
                    <text key="extraAboveNeeded" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
                      {formatAmount(extraNeeded)}
                    </text>,
                  );
                }
              }
              return nodes;
            })()}
          </g>
        )}
      </svg>

      <IconContainer>
        <IconButton
          onClick={() =>
            alert(
                JSON.stringify(
                    {
                      naam,
                      openingsReserveSaldo,
                      periodeReservering,
                      periodeBetaling,
                      nogNodig,
                      budgetMaandBedrag,
                    },
                  null,
                  2,
                ),
              )
          }
        >
          <VisibilityOutlinedIcon sx={{ fontSize: '18px', color: '#666' }} />
        </IconButton>
      </IconContainer>
    </Box>
  );
};

export default PotjesSparenDemo;
