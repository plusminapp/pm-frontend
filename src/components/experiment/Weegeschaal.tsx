import { motion } from 'framer-motion';

export default function Weegschaal({
  leftWeights,
  rightWeights,
  scale = 1,
}: {
  leftWeights: number[];
  rightWeights: number[];
  scale?: number;
}) {
  const maxTilt = 15;
  const leftWeightTotal = leftWeights.reduce((a, b) => a + b, 0);
  const rightWeightTotal = rightWeights.reduce((a, b) => a + b, 0);
  const total = leftWeightTotal + rightWeightTotal;
  const balance =
    total === 0 ? 0 : (rightWeightTotal - leftWeightTotal) / total;
  const tilt = balance * maxTilt;

  const baseWidth = 300;
  const baseHeight = 200;
  const standTopY = 100;
  const standBottomY = 150;
  const beamY = 90;
  const beamLength = 100;
  const beamXLeft = 100;
  const beamXRight = beamXLeft + beamLength;
  // const panHeight = 40;
  const panBaseWidth = 50;
  const panTopXLeft = beamXLeft;
  const panTopXRight = beamXRight;
  const panTopY = beamY + 10;
  const panBaseY = standBottomY - 8;
  const panBaseYWeight = panBaseY - 2; // ruimte voor gewichten

  // Helper voor gewichten: breedte schalen naar gewicht, grootste onderop
  function renderWeights(
    weights: number[],
    panBaseX: number,
    panBaseY: number,
    panBaseWidth: number,
  ) {
    if (weights.length === 0) return null;
    const sorted = [...weights].sort((a, b) => a - b); // kleinste boven, grootste onder
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const boxHeight = 12;
    const boxSpacing = 2;
    return sorted.map((weight, i) => {
      // breedte tussen 18 en panBaseWidth-8
      const w =
        18 +
        ((panBaseWidth - 8 - 18) * (weight - minWeight)) /
          (maxWeight === minWeight ? 1 : maxWeight - minWeight);
      const x = panBaseX + (panBaseWidth - w) / 2;
      const y = panBaseY - (sorted.length - i) * (boxHeight + boxSpacing);
      return (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={w}
            height={boxHeight}
            fill="none"
            stroke="#555"
            strokeWidth={2}
            rx={2}
          />
          <text
            x={panBaseX + panBaseWidth / 2}
            y={y + boxHeight / 2 + 2}
            fontSize={5}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#222"
          >
            {weight.toLocaleString('nl-NL', {
              style: 'currency',
              currency: 'EUR',
            })}
          </text>
        </g>
      );
    });
  }

  return (
    <div
      className="flex justify-center items-center relative"
      style={{
        height: `${256 * scale}px`,
        width: `${baseWidth * scale}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        overflow: 'visible',
      }}
    >
      <svg
        width={baseWidth}
        height={baseHeight}
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
      >
        {/* Stand */}
        <rect
          x="145"
          y={standTopY}
          width="10"
          height={standBottomY - standTopY}
          fill="#444"
        />

        {/* Beam */}
        <motion.rect
          x={beamXLeft}
          y={beamY}
          width={beamLength}
          height={10}
          fill="#666"
          origin="center"
          animate={{ rotate: tilt }}
          style={{
            transformOrigin: `${beamXLeft + beamLength / 2}px ${beamY + 5}px`,
          }}
        />

        {/* Left Pan: gelijkbenige driehoek met dikke bodem */}
        <motion.g animate={{ y: tilt * -1 }}>
          <polygon
            points={`
              ${panTopXLeft},${panTopY}
              ${panTopXLeft - panBaseWidth / 2},${panBaseY}
              ${panTopXLeft + panBaseWidth / 2},${panBaseY}
            `}
            fill="#eee"
            stroke="#999"
            strokeWidth={2}
          />
          {/* Dikke bodem */}
          <rect
            x={panTopXLeft - panBaseWidth / 2}
            y={panBaseY - 3}
            width={panBaseWidth}
            height={6}
            fill="#bbb"
            stroke="#888"
            strokeWidth={2}
            rx={2}
          />
          {/* Gewichten */}
          {renderWeights(
            leftWeights,
            panTopXLeft - panBaseWidth / 2,
            panBaseYWeight,
            panBaseWidth,
          )}
        </motion.g>

        {/* Right Pan: gelijkbenige driehoek met dikke bodem */}
        <motion.g animate={{ y: tilt }}>
          <polygon
            points={`
              ${panTopXRight},${panTopY}
              ${panTopXRight - panBaseWidth / 2},${panBaseY}
              ${panTopXRight + panBaseWidth / 2},${panBaseY}
            `}
            fill="#eee"
            stroke="#999"
            strokeWidth={2}
          />
          {/* Dikke bodem */}
          <rect
            x={panTopXRight - panBaseWidth / 2}
            y={panBaseY - 3}
            width={panBaseWidth}
            height={6}
            fill="#bbb"
            stroke="#888"
            strokeWidth={2}
            rx={2}
          />
          {/* Gewichten */}
          {renderWeights(
            rightWeights,
            panTopXRight - panBaseWidth / 2,
            panBaseYWeight,
            panBaseWidth,
          )}
        </motion.g>
      </svg>

      <div className="absolute top-4 right-4 text-sm">
        <div>Links: {leftWeightTotal} kg</div>
        <div>Rechts: {rightWeightTotal} kg</div>
      </div>
    </div>
  );
}
