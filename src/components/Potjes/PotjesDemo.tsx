import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

interface PotjesDemoProps {
  naam: string;
  openingsReserveSaldo: number;
  periodeReservering: number;
  besteed: number;
  nogNodig: number;
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

export const PotjesDemo: React.FC<PotjesDemoProps> = ({
  naam,
  openingsReserveSaldo,
  periodeReservering,
  besteed,
  nogNodig,
}) => {
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const total = Math.max(0, openingsReserveSaldo + periodeReservering);
  const spent = Math.max(0, besteed);
  const need = Math.max(0, nogNodig);

  const isError = spent > total || need > total;
  const sum = spent + need;
  const isOverflow = !isError && sum > total;
  // const isExact = !isError && sum === total;
  const isUnder = !isError && sum < total;

  // visible filled (inside pot) equals reserved - spent (can't be negative here)
  const visibleFilled = Math.max(0, total - spent);

  const heightFor = (amount: number) => {
    if (total <= 0) return 0;
    return (amount / total) * VIEW_H;
  };

  const bottomNeededHeight = isOverflow ? Math.max(0, total - spent) : Math.min(need, visibleFilled);
  const topGreenHeight = isUnder ? Math.max(0, visibleFilled - need) : 0;

  const borderColor = isError ? '#d32f2f' : isOverflow ? '#ff9800' : '#2e7d32';

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
          <clipPath id="potClip">
            <polygon points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04" />
          </clipPath>
        </defs>

        {/* background fill for pot (light) */}
        <polygon
          points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04"
          fill="#fff"
          stroke={borderColor}
          strokeWidth="2.64"
          strokeLinejoin="miter"
        />

        {/* if error, show empty pot with exclamation */}
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
          <g clipPath="url(#potClip)">
            {/* bottom: needed (either blue or orange) */}
            {bottomNeededHeight > 0 && (
              <rect
                x="0"
                y={VIEW_H - heightFor(bottomNeededHeight)}
                width={VIEW_W}
                height={heightFor(bottomNeededHeight)}
                  fill={isOverflow ? '#ffb74d' : '#2196f3'}
                opacity={1}
              />
            )}

              {/* If the 'nog nodig' area is tall enough, render the amount centered inside it */}
              {bottomNeededHeight > 0 && heightFor(bottomNeededHeight) >= 18 && (
                <text
                  x={VIEW_W / 2}
                  y={VIEW_H - heightFor(bottomNeededHeight) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill={isOverflow ? '#000' : '#fff'}
                  style={{ fontFamily: 'Roboto' }}
                >
                  {formatAmount(bottomNeededHeight)}
                </text>
              )}

            {/* top green layer when under-filled */}
            {topGreenHeight > 0 && (
              <rect
                x="0"
                y={VIEW_H - heightFor(bottomNeededHeight + topGreenHeight)}
                width={VIEW_W}
                height={heightFor(topGreenHeight)}
                fill="#4caf50"
              />
            )}

            {/* dashed thin horizontal line at the height of 'need' when overflow */}
            {isOverflow && (
              <line
                x1="4"
                x2={VIEW_W - 4}
                y1={VIEW_H - heightFor(need)}
                y2={VIEW_H - heightFor(need)}
                stroke="#ff9800"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            )}
          </g>
        )}
      </svg>

      {/* Icon next to potje, mirrors PotjesVisualisatie style */}
      <IconContainer>
        <IconButton
          onClick={() =>
            alert(
              JSON.stringify(
                {
                  naam,
                  openingsReserveSaldo,
                  periodeReservering,
                  besteed,
                  nogNodig,
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

export default PotjesDemo;
