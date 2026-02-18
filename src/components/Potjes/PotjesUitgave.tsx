import React from 'react';
import { Box, Typography } from '@mui/material';
import { useCustomContext } from '../../context/CustomContext';
import { InfoIcon } from '../../icons/Info';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

interface Props {
    naam: string;
    budgetMaandBedrag?: number;
    openingsReserveSaldo: number;
    periodeReservering: number;
    periodeBetaling: number;
    nogNodig: number;
    peilDatum?: string;
    budgetBetaalDatum?: string;
}

const VIEW_W = 92.4;
const VIEW_H = 129.36;


const PotjesUitgave: React.FC<Props> = ({
    naam,
    budgetMaandBedrag,
    openingsReserveSaldo,
    periodeReservering,
    periodeBetaling,
    nogNodig,
    peilDatum,
    budgetBetaalDatum,
}) => {
    const formatAmount = (amount: number) =>
        amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });

    const reservering = Math.max(0, openingsReserveSaldo + periodeReservering);
    const grootte = Math.max(budgetMaandBedrag && budgetMaandBedrag > 0 ? budgetMaandBedrag : 0, reservering);

    const isVast = Boolean(peilDatum || budgetBetaalDatum);

    // date comparison: if both present and peil > betaal => na-betaaldatum
    let naBetaalDatum = false;
    if (peilDatum && budgetBetaalDatum) {
        try {
            naBetaalDatum = new Date(peilDatum) > new Date(budgetBetaalDatum);
        } catch (e) {
            naBetaalDatum = false;
        }
    }

    // error condition
    const isError = Math.max(0, periodeBetaling) > reservering;

    const shortage = openingsReserveSaldo + periodeReservering - periodeBetaling - nogNodig;
    const shortageText = (shortage < 0 ? '-' : '') + formatAmount(Math.abs(shortage));

    // helper to scale heights
    const base = Math.max(1, grootte);
    const heightFor = (amount: number) => (amount <= 0 ? 0 : (amount / base) * VIEW_H);

    // visual decisions
    let borderColor = '#2e7d32';
    let fillParts: React.ReactNode[] = [];
    let overlayTexts: React.ReactNode[] = [];
    let showThumb = false;

    if (isError) {
        borderColor = '#d32f2f';
        // empty pot with exclamation handled in render
    } else if (isVast && naBetaalDatum && nogNodig > 0) {
        borderColor = '#d32f2f';
        const fillH = heightFor(Math.max(0, reservering - periodeBetaling));
        if (fillH > 0) fillParts.push(<rect key="red" x={0} y={VIEW_H - fillH} width={VIEW_W} height={fillH} fill="#d32f2f" />);
        if (fillH >= 18) overlayTexts.push(
            <text key="redAmt" x={VIEW_W / 2} y={VIEW_H - fillH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#fff" style={{ fontFamily: 'Roboto' }}>{formatAmount(Math.max(0, reservering - periodeBetaling))}</text>
        );
    } else if (isVast && naBetaalDatum && nogNodig === 0) {
        borderColor = '#9e9e9e';
        showThumb = true;
        const fillH = heightFor(Math.max(0, reservering - periodeBetaling));
        if (fillH > 0) fillParts.push(<rect key="gray" x={0} y={VIEW_H - fillH} width={VIEW_W} height={fillH} fill="#9e9e9e" />);
        if (fillH >= 18) {
            overlayTexts.push(
                <g key="grayAmt">
                    <text x={VIEW_W / 2} y={VIEW_H - fillH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>{formatAmount(Math.max(0, reservering - periodeBetaling))}</text>
                </g>
            );
        }
    } else if (Math.max(0, periodeBetaling) + Math.max(0, nogNodig) > reservering) {
        // orange state
        borderColor = '#ff9800';
        const filled = Math.max(0, reservering - Math.max(0, periodeBetaling));
        const fillH = heightFor(filled);
        if (fillH > 0) fillParts.push(<rect key="orange" x={0} y={VIEW_H - fillH} width={VIEW_W} height={fillH} fill="#ffb74d" />);
        // show filled amount inside orange area when space permits
        if (fillH >= 18) {
            const yCenter = VIEW_H - fillH / 2;
            overlayTexts.push(
                <text key="orangeFilledAmt" x={VIEW_W / 2} y={yCenter} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>
                    {formatAmount(filled)}
                </text>,
            );
        }
        // orange dashed line at nogNodig height
        const dashY = VIEW_H - heightFor(Math.max(0, nogNodig));
        fillParts.push(<line key="dash" x1={4} x2={VIEW_W - 4} y1={dashY} y2={dashY} stroke="#ff9800" strokeWidth={1} strokeDasharray="4 3" />);
        // show amount in the gap between orange top and dashed line if space
        const extra = Math.max(0, Math.max(0, nogNodig) - filled);
        const extraH = heightFor(extra);
        if (extraH >= 18) {
            const y = VIEW_H - fillH - extraH / 2;
            overlayTexts.push(<text key="extra" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#000" style={{ fontFamily: 'Roboto' }}>{formatAmount(extra)}</text>);
        }
    } else {
        // green split case
        borderColor = '#2e7d32';
        showThumb = true;
        const vull = Math.max(0, reservering - Math.max(0, periodeBetaling)); // vulling
        const blueAmount = Math.min(vull, Math.max(0, nogNodig));
        const greenAmount = Math.max(0, vull - blueAmount);
        const blueH = heightFor(blueAmount);
        const greenH = heightFor(greenAmount);
        if (greenH > 0) fillParts.push(<rect key="green" x={0} y={VIEW_H - blueH - greenH} width={VIEW_W} height={greenH} fill="#4caf50" />);
        if (blueH > 0) fillParts.push(<rect key="blue" x={0} y={VIEW_H - blueH} width={VIEW_W} height={blueH} fill="#2196f3" />);
        // texts: blue (nogNodig) centered with thumb if space
        if (blueH >= 18) {
            const y = VIEW_H - blueH / 2;
            overlayTexts.push(<text key="blueAmt" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#fff" style={{ fontFamily: 'Roboto' }}>{formatAmount(blueAmount)}</text>);
        }
        // green amount centered if space
        if (greenH >= 18) {
            const y = VIEW_H - blueH - greenH / 2;
            overlayTexts.push(<text key="greenAmt" x={VIEW_W / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#fff" style={{ fontFamily: 'Roboto' }}>{formatAmount(greenAmount)}</text>);
        }
    }

    // compute common amounts/heights for possible areas (used to render external labels when too small)
    const filled = Math.max(0, reservering - Math.max(0, periodeBetaling));
    const blueAmount = Math.min(filled, Math.max(0, nogNodig));
    const greenAmount = Math.max(0, filled - blueAmount);
    const filledH = heightFor(filled);
    const blueH = heightFor(blueAmount);
    const greenH = heightFor(greenAmount);
    const extra = Math.max(0, Math.max(0, nogNodig) - filled);
    const extraH = heightFor(extra);

    const externalLabels: Array<{ key: string; amount: number; y: number; color?: string }> = [];
    if (!isError) {
        if (isVast && naBetaalDatum) {
            const amt = Math.max(0, reservering - periodeBetaling);
            const h = heightFor(amt);
            if (amt > 0 && h > 0 && h < 18) {
                const y = VIEW_H - h / 2;
                externalLabels.push({ key: 'vastAfter', amount: amt, y, color: naBetaalDatum && nogNodig === 0 ? '#000' : '#fff' });
            }
        } else if (Math.max(0, periodeBetaling) + Math.max(0, nogNodig) > reservering) {
            // orange: consider filled and extra
            if (filled > 0 && filledH < 18) {
                externalLabels.push({ key: 'orangeFilled', amount: filled, y: VIEW_H - filledH / 2, color: '#000' });
            }
            if (extra > 0 && extraH < 18) {
                externalLabels.push({ key: 'orangeExtra', amount: extra, y: VIEW_H - filledH - extraH / 2, color: '#000' });
            }
        } else {
            // green split
            if (blueAmount > 0 && blueH < 18) {
                externalLabels.push({ key: 'blueSmall', amount: blueAmount, y: VIEW_H - blueH / 2, color: '#000' });
            }
            if (greenAmount > 0 && greenH < 18) {
                externalLabels.push({ key: 'greenSmall', amount: greenAmount, y: VIEW_H - blueH - greenH / 2, color: '#000' });
            }
        }
    }
    // prepare adjusted external labels (sorted + layout) so JSX can render without overlap
    type Label = { key: string; amount: number; y: number; color?: string };
    const MIN_GAP = 16;
    const MIN_Y = 12;
    const MAX_Y = VIEW_H - 12;
    const adjustedLabels: Label[] = externalLabels
        .slice()
        .sort((a, b) => a.y - b.y)
        .map((l) => ({ ...l }));
    // forward pass
    for (let i = 0; i < adjustedLabels.length; i++) {
        if (i === 0) {
            adjustedLabels[i].y = Math.max(MIN_Y, Math.min(MAX_Y, adjustedLabels[i].y));
        } else {
            const wanted = Math.max(adjustedLabels[i].y, adjustedLabels[i - 1].y + MIN_GAP);
            adjustedLabels[i].y = Math.max(MIN_Y, Math.min(MAX_Y, wanted));
        }
    }
    // backward pass
    // show aggregaat-like orange badge when periodeBetaling exceeds budgetMaandBedrag
    const showAggregaatOrangeBadge = Boolean(budgetMaandBedrag && periodeBetaling > budgetMaandBedrag);
    const meerUitgegegvenTekst = `Je hebt tot nu toe ${formatAmount(periodeBetaling - (budgetMaandBedrag ?? 0))} meer uitgegeven aan ${naam} dan je van plan was.`;    
    const { setSnackbarMessage } = useCustomContext();

    for (let i = adjustedLabels.length - 2; i >= 0; i--) {
        if (adjustedLabels[i + 1].y - adjustedLabels[i].y < MIN_GAP) {
            adjustedLabels[i].y = Math.max(MIN_Y, adjustedLabels[i + 1].y - MIN_GAP);
        }
    }

    return (
        <Box sx={{ width: `${VIEW_W}px`, margin: '12px auto', position: 'relative', overflow: 'visible' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, gap: 1, overflow: 'visible' }}>
                <Typography sx={{ color: '#333', fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'Roboto', whiteSpace: 'nowrap' }}>{naam}</Typography>
                {showThumb && <ThumbUpOffAltIcon sx={{ fontSize: 16, color: '#2e7d32' }} />}
            </Box>

            <Box sx={{ position: 'relative', display: 'block' }}>
                <svg width={VIEW_W} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                        <clipPath id="potClipUitgave">
                            <polygon points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04" />
                        </clipPath>
                    </defs>

                    <polygon points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04" fill="#fff" stroke={borderColor} strokeWidth="2.64" strokeLinejoin="miter" />

                    {isError ? (
                        <g>
                            <text x="50%" y="20%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#d32f2f" style={{ fontFamily: 'Roboto', fontWeight: 700 }}>{shortageText}</text>
                            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" fontSize="48" fill="#d32f2f">!</text>
                        </g>
                    ) : (
                        <>
                            <g clipPath="url(#potClipUitgave)">
                                {fillParts}
                                {overlayTexts}
                            </g>

                            {/* external labels for small areas: render left of pot with connector */}
                            {adjustedLabels.map((lab) => (
                                <g key={lab.key}>
                                    <text x={VIEW_W + 8} y={lab.y} textAnchor="start" dominantBaseline="middle" fontSize={12} fill={lab.color ?? '#000'} style={{ fontFamily: 'Roboto' }}>
                                        {formatAmount(lab.amount)}
                                    </text>
                                </g>
                            ))}
                        </>
                    )}
                </svg>

                {/* aggregaat-like orange badge top-right when periodeBetaling > budgetMaandBedrag */}
                {showAggregaatOrangeBadge && (
                    <Box sx={{ position: 'absolute', right: -6, top: -10 }}>
                        <Box
                            role="button"
                            onClick={() => setSnackbarMessage({ message: meerUitgegegvenTekst, type: 'info' })}
                            sx={{
                                bgcolor: '#ff9800',
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                boxShadow: '0 0 0 2px #fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <InfoIcon color="#fff" height="22px" />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PotjesUitgave;
