import dayjs from 'dayjs';
import { BetalingDTO } from '../../../model/Betaling';
import { DateFormats } from '../../../util/date-formats';

// Constanten voor regex patterns
const DATE_PATTERN = /^(\d{1,2})[:/\s]*(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|[eE][nN][eE]|[fF][eE][bB]|[mM][aA][rR]|[aA][bB][rR]|[mM][aA][yY]|[jJ][uU][nN]|[jJ][uU][lL]|[aA][gG][oO]|[sS][eE][pP]|[oO][cC][tT]|[nN][oO0][vV]|[dD][iI][cC])/i;
const TRANSACTION_PATTERN = /^([EZ©&=][)]?|[Z=]2)\s+(.+?)\s*([+-]?\d+[.,]\d{2})\s*€?\s*$/i;
const AMOUNT_ONLY_PATTERN = /^.*?([+-]?\d+[.,]\d{2})\s*€?\s*$/;

// Maand mapping van Spaans naar nummer
const MONTH_MAP: { [key: string]: number } = {
  'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
  'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
};

// Hulpfunctie om maand OCR variaties te normaliseren
const normalizeMonth = (month: string): string => {
  const normalized = month.toLowerCase();
  if (normalized.match(/^[eE][nN][eE]$/)) return 'ene';
  if (normalized.match(/^[fF][eE][bB]$/)) return 'feb';
  if (normalized.match(/^[mM][aA][rR]$/)) return 'mar';
  if (normalized.match(/^[aA][bB][rR]$/)) return 'abr';
  if (normalized.match(/^[mM][aA][yY]$/)) return 'may';
  if (normalized.match(/^[jJ][uU][nN]$/)) return 'jun';
  if (normalized.match(/^[jJ][uU][lL]$/)) return 'jul';
  if (normalized.match(/^[aA][gG][oO0]$/)) return 'ago';
  if (normalized.match(/^[sS][eE][pP]$/)) return 'sep';
  if (normalized.match(/^[oO0][cC][tT]$/)) return 'oct';
  if (normalized.match(/^[nN][oO0][vV]$/)) return 'nov';
  if (normalized.match(/^[dD][iI1][cC]$/)) return 'dic';
  return normalized;
};

// Hulpfunctie om beschrijving te cleanen van prefixes en speciale tekens
const cleanDescription = (description: string): string => {
  let clean = description.trim();
  
  // Verwijder prefixes
  clean = clean.replace(/^[EZ©&=][)]?\s*/, '');
  clean = clean.replace(/^[Z=]2\s*/, '');
  clean = clean.replace(/^Tj-/, '');
  clean = clean.replace(/^Trf\.\s*/, '');
  
  // Verwijder extra OCR tekens
  clean = clean.replace(/[&$©=]/g, '').trim();
  
  return clean;
};

// Hulpfunctie om bedrag te parsen
const parseAmount = (amountStr: string): number => {
  const numericAmount = parseFloat(amountStr.replace(',', '.'));
  
  if (amountStr.startsWith('+')) {
    return Math.abs(numericAmount);
  }
  // Standaard negatief (uitgave), tenzij expliciet positief
  return -Math.abs(numericAmount);
};

// Functie om tekst van Caja Rural bankafschriften te parsen
export const parseTekstCR = (text: string, vandaag: string | null): BetalingDTO[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let currentDate = dayjs(vandaag);
  let sortOrderBase = 900;
  const parsed: BetalingDTO[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // Check voor datum
    const dateMatch = trimmedLine.match(DATE_PATTERN);
    if (dateMatch) {
      const day = dateMatch[1];
      const month = normalizeMonth(dateMatch[2]);
      
      const currentYear = dayjs(vandaag).year();
      currentDate = dayjs(vandaag)
        .year(currentYear)
        .month(MONTH_MAP[month])
        .date(parseInt(day, 10));
      
      sortOrderBase = 900;
      continue;
    }

    // Check voor transactie met prefix
    const transactionMatch = trimmedLine.match(TRANSACTION_PATTERN);
    if (transactionMatch) {
      const [, , description, amount] = transactionMatch;
      const cleanDesc = cleanDescription(description);
      const finalAmount = parseAmount(amount);
      const sortOrder = `${currentDate.format('YYYYMMDD')}.${sortOrderBase}`;
      
      parsed.push({
        id: Number(sortOrder.replace('.', '')),
        boekingsdatum: currentDate.format(DateFormats.YYYY_MM_DD),
        omschrijving: '',
        ocrOmschrijving: cleanDesc,
        bedrag: Math.abs(finalAmount),
        sortOrder: sortOrder,
        bestaatAl: false,
        betalingsSoort: undefined,
        bron: undefined,
        bestemming: undefined,
      });

      sortOrderBase -= 10;
      continue;
    }

    // Fallback: zoek naar regels met alleen een bedrag
    const amountOnlyMatch = trimmedLine.match(AMOUNT_ONLY_PATTERN);
    if (amountOnlyMatch && 
        !trimmedLine.includes('Fecha Valor') && 
        !trimmedLine.includes('=') &&
        trimmedLine.length > 10) {
      
      const amount = amountOnlyMatch[1];
      const description = trimmedLine.replace(amountOnlyMatch[1], '').replace(/€/g, '').trim();
      
      // Skip als beschrijving te kort of bevat weinig letters
      if (description.length > 3 && description.match(/[a-zA-Z]/)) {
        const cleanDesc = cleanDescription(description);
        
        if (cleanDesc.length > 2) {
          const finalAmount = parseAmount(amount);
          const sortOrder = `${currentDate.format('YYYYMMDD')}.${sortOrderBase}`;
          
          parsed.push({
            id: Number(sortOrder.replace('.', '')),
            boekingsdatum: currentDate.format(DateFormats.YYYY_MM_DD),
            omschrijving: '',
            ocrOmschrijving: cleanDesc,
            bedrag: Math.abs(finalAmount),
            sortOrder: sortOrder,
            bestaatAl: false,
            betalingsSoort: undefined,
            bron: undefined,
            bestemming: undefined,
          });

          sortOrderBase -= 10;
        }
      }
    }
  }

  return parsed;
};

// Hulpfunctie voor het extraheren van eenvoudige transacties
export const extractSimpleTransactionsCR = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const transactions = [];
  let currentDate = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check voor datum
    const dateMatch = trimmedLine.match(DATE_PATTERN);
    if (dateMatch) {
      const month = normalizeMonth(dateMatch[2]);
      currentDate = `${dateMatch[1]} ${month}`;
      continue;
    }

    // Check voor transactie
    const transactionMatch = trimmedLine.match(TRANSACTION_PATTERN);
    if (transactionMatch && currentDate) {
      const [, , description, amount] = transactionMatch;
      const cleanDesc = cleanDescription(description);

      transactions.push({
        datum: currentDate,
        omschrijving: cleanDesc,
        bedrag: amount
      });
    }
  }

  return transactions;
};