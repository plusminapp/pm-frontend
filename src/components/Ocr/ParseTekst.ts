import dayjs from "dayjs";
import { BetalingDTO } from "../../model/Betaling";

export const parseText = (text: string): BetalingDTO[] => {
  const dateRegex = /((vandaag|gisteren)?( - )?\d{1,2} (januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)( \d{4})?|(vandaag|gisteren)( - )?)/i;
  const currentYear = dayjs().year();
  const previousYear = currentYear - 1;
  const amountRegex = new RegExp(`[+-]?[0-9.,]+(?<!${currentYear}|${previousYear})$`);

  let currentDate = dayjs();
  let sortOrderBase = 900;
  const parsed = text.split('\n').reduce((acc, line) => {
    const dateMatch = line.match(dateRegex);
    const amountMatch = line.match(amountRegex);

    if (amountMatch) {
      let amount = amountMatch[0].replace('.', '').replace(',', '.');
      if (!amount.includes('.') && amount.length > 2) {
        amount = Number(amount) / 100 + '';
      }
      const ocrOmschrijving = line.replace(amountRegex, '').trim();
      const sortOrder = `${dayjs(currentDate).format('YYYYMMDD')}.${sortOrderBase}`;
      acc.push({
        id: Number(sortOrder),
        boekingsdatum: currentDate,
        omschrijving: '',
        ocrOmschrijving: ocrOmschrijving,
        bedrag: Number(amount),
        sortOrder: sortOrder,
        bestaatAl: false,
        betalingsSoort: undefined,
        bron: undefined,
        bestemming: undefined,
        budgetNaam: undefined
      });
      sortOrderBase -= 10; // Decrease sortOrderBase for the next entry
    } else if (dateMatch) {
      let dateStr = dateMatch[0].toLowerCase();
      if (dateStr.includes('-')) {
        dateStr = dateStr.split('-')[1].trim();
      }
      const yearMatch = dateStr.match(/\d{4}/);
      const year = yearMatch ? '' : dayjs().year();
      if (dateStr === 'vandaag') {
        currentDate = dayjs();
      } else if (dateStr === 'gisteren') {
        currentDate = dayjs().subtract(1, 'day');
      } else if (/\d{1,2} (januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/.test(dateStr)) {
        currentDate = dayjs(`${dateStr} ${year}`, 'D MMMM YYYY', 'nl');
      } else if (/\d{1,2} (jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)/.test(dateStr)) {
        currentDate = dayjs(`${dateStr} ${year}`, 'D MMM YYYY', 'nl');
      } else if (/\d{1,2}-\d{1,2}/.test(dateStr)) {
        currentDate = dayjs(`${dateStr}-${year}`, 'D-MM-YYYY');
      } else {
        currentDate = dayjs();
      }
      sortOrderBase = 900; // Reset sortOrderBase for a new date
    }
    return acc;
  }, [] as BetalingDTO[]);
  return parsed;
};
