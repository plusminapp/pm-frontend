import dayjs from 'dayjs';
import { BetalingDTO } from '../../../model/Betaling';
import { DateFormats } from '../../../util/date-formats';

// Constanten voor regex patterns
const AMOUNT_PATTERN = /([©€]\s*[-+]?\s*\d[\d.,\s]*)/;

// Hulpfunctie om beschrijving te cleanen
const cleanDescription = (description: string): string => {
  let clean = description.trim();
  
  // Verwijder voorkomende OCR artefacten
  clean = clean.replace(/\s+/g, ' '); // Meerdere spaties naar enkele spatie
  clean = clean.replace(/\n/g, ' '); // Newlines naar spaties
  clean = clean.replace(/[_]+$/, ''); // Trailing underscores
  clean = clean.replace(/^(eo|©|&)\s*/g, ''); // Leading 'eo', '©' of '&'
  clean = clean.replace(/\s+(©|&)\s*/g, ' '); // '©' of '&' in het midden
  
  return clean.trim();
};

// Hulpfunctie om bedrag te parsen uit N26 formaat
const parseAmount = (amountStr: string): number => {
  // Vervang © door € (OCR fout)
  let clean = amountStr.replace(/©/g, '€');
  
  // Verwijder € en +/- aan het begin
  clean = clean.replace(/€/g, '').replace(/^\s*[-+]\s*/, '');
  
  // Verwijder alle spaties
  clean = clean.replace(/\s/g, '');
  
  // Vervang komma door punt (decimalen)
  if (clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  }
  
  return Math.abs(parseFloat(clean));
};

// Functie om tekst van N26 bankafschriften te parsen
export const parseTekstN26 = (text: string, vandaag: string | null): BetalingDTO[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const currentDate = dayjs(vandaag);
  let sortOrderBase = 900;
  const parsed: BetalingDTO[] = [];
  
  // N26 heeft geen datums in de transactielijst, gebruik vandaag
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip irrelevante regels
    if (line.match(/^(Home|Main Account|Current balance|Add money|Send money|Transactions|See all|Refer friends|Finances|Investments|Benefits|Cards|More|Bizum|RA|SE|@|fi|MK|\+\]|=)/i)) {
      continue;
    }
    
    // Check of regel een bedrag bevat
    const amountMatch = line.match(AMOUNT_PATTERN);
    if (amountMatch) {
      const amountStr = amountMatch[1];
      
      // Verzamel beschrijving: eerst kijken of er tekst op deze regel staat voor het bedrag
      const descriptionLines: string[] = [];
      const textBeforeAmount = line.substring(0, line.indexOf(amountMatch[0])).trim();
      
      if (textBeforeAmount.length > 0) {
        descriptionLines.push(textBeforeAmount);
      } else {
        // Geen tekst op deze regel, zoek in vorige regel(s)
        for (let j = i - 1; j >= 0 && descriptionLines.length < 3; j--) {
          const prevLine = lines[j];
          
          // Stop als we een bedrag of irrelevante regel tegenkomen
          if (prevLine.match(AMOUNT_PATTERN) || 
              prevLine.match(/^(Home|Main Account|Current balance|Add money|Send money|Transactions|See all|Refer friends|Finances|Investments|Benefits|Cards|More|Bizum|RA|SE|@|fi|MK|\+\]|=|€\s*[\d.,]+$)/i)) {
            break;
          }
          
          descriptionLines.unshift(prevLine);
        }
      }
      
      const description = descriptionLines.join(' ');
      const cleanDesc = cleanDescription(description);
      
      if (cleanDesc.length > 0) {
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
    }
  }
  
  return parsed;
};
