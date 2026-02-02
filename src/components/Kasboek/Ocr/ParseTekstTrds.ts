import dayjs from 'dayjs';
import { BetalingDTO } from '../../../model/Betaling';
import { DateFormats } from '../../../util/date-formats';

// Constanten voor regex patterns
const DATE_PATTERN = /^(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/i;
const AMOUNT_PATTERN = /([+-]?\s*€\s*[\d.,-\s]+)/;

// Maand mapping van Nederlands naar nummer
const MONTH_MAP: { [key: string]: number } = {
  'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
  'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
};

// Hulpfunctie om beschrijving te cleanen
const cleanDescription = (description: string): string => {
  let clean = description.trim();
  
  // Verwijder voorkomende OCR artefacten
  clean = clean.replace(/\s+/g, ' '); // Meerdere spaties naar enkele spatie
  clean = clean.replace(/\n/g, ' '); // Newlines naar spaties
  clean = clean.replace(/[_]+$/, ''); // Trailing underscores
  clean = clean.replace(/\s+00$/, ''); // Trailing '00'
  
  return clean.trim();
};

// Hulpfunctie om bedrag te parsen uit Triodos formaat
const parseAmount = (amountStr: string): number => {
  // Verwijder € en +/- aan het begin
  let clean = amountStr.replace(/€/g, '').replace(/^\s*[+-]\s*/, '');
  
  // Verwijder alle spaties en dashes (OCR fouten in bedragen)
  clean = clean.replace(/\s/g, '').replace(/-/g, '');
  
  // Vervang punt door niets (duizendtallen separator) en komma door punt (decimalen)
  if (clean.includes(',')) {
    // Komma is decimaal separator
    clean = clean.replace(/\./g, '').replace(',', '.');
  }
  // Anders is punt al decimaal separator
  
  return Math.abs(parseFloat(clean));
};

// Functie om tekst van Triodos bankafschriften te parsen
export const parseTekstTrds = (text: string, vandaag: string | null): BetalingDTO[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let currentDate = dayjs(vandaag);
  let sortOrderBase = 900;
  const parsed: BetalingDTO[] = [];
  let lastDateIndex = -1;
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check voor datum
    const dateMatch = line.match(DATE_PATTERN);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = dateMatch[2].toLowerCase();
      const year = parseInt(dateMatch[3], 10);
      
      currentDate = dayjs()
        .year(year)
        .month(MONTH_MAP[month])
        .date(day);
      
      sortOrderBase = 900;
      lastDateIndex = i;
      i++;
      continue;
    }
    
    // Check of regel een bedrag bevat
    const amountMatch = line.match(AMOUNT_PATTERN);
    if (amountMatch) {
      const amountStr = amountMatch[1];
      
      // Verzamel alle regels tussen de laatste datum en deze bedrag regel
      const descriptionLines: string[] = [];
      for (let j = lastDateIndex + 1; j < i; j++) {
        const descLine = lines[j];
        // Skip regels die irrelevant zijn of al een bedrag bevatten
        if (descLine.length > 0 && 
            !descLine.match(AMOUNT_PATTERN) && 
            !descLine.match(/^(Overzicht|Impact|Berichten|Meer|Bij|Af|Gepland|Q\s|A\s|\d{2}:\d{2})/i)) {
          descriptionLines.push(descLine);
        }
      }
      
      const description = descriptionLines.join(' ');
      const cleanDesc = cleanDescription(description);
      
      if (cleanDesc.length > 2) {
        const sortOrder = `${currentDate.format('YYYYMMDD')}.${sortOrderBase}`;
        
        parsed.push({
          id: Number(sortOrder.replace('.', '')),
          boekingsdatum: currentDate.format(DateFormats.YYYY_MM_DD),
          omschrijving: '',
          ocrOmschrijving: cleanDesc,
          bedrag: parseAmount(amountStr),
          sortOrder: sortOrder,
          bestaatAl: false,
          betalingsSoort: undefined,
          bron: undefined,
          bestemming: undefined,
        });
        
        sortOrderBase -= 10;
      }
      
      // Update lastDateIndex to current position for next transaction
      lastDateIndex = i;
    }
    
    i++;
  }
  
  return parsed;
};

// Hulpfunctie voor het extraheren van eenvoudige transacties
export const extractSimpleTransactionsTrds = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const transactions = [];
  let currentDate = '';
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check voor datum
    const dateMatch = line.match(DATE_PATTERN);
    if (dateMatch) {
      currentDate = `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`;
      i++;
      continue;
    }
    
    // Check voor bedrag
    const amountMatch = line.match(AMOUNT_PATTERN);
    if (amountMatch && currentDate) {
      const amountStr = amountMatch[1];
      let description = line.replace(amountMatch[0], '').trim();
      
      // Kijk naar vorige regel voor extra omschrijving
      if (i > 0) {
        const prevLine = lines[i - 1];
        if (!prevLine.match(DATE_PATTERN) && !prevLine.match(AMOUNT_PATTERN)) {
          description = prevLine + ' ' + description;
        }
      }
      
      const cleanDesc = cleanDescription(description);
      
      transactions.push({
        datum: currentDate,
        omschrijving: cleanDesc,
        bedrag: amountStr.trim()
      });
    }
    
    i++;
  }
  
  return transactions;
};
