import dayjs from 'dayjs';
import { BetalingDTO } from '../../../model/Betaling';
import { DateFormats } from '../../../util/date-formats';

// Functie om tekst van Caja Rural bankafschriften te parsen
export const parseTekstCR = (text: string, vandaag: string | null): BetalingDTO[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let currentDate = dayjs(vandaag);
  let sortOrderBase = 900;
  const parsed: BetalingDTO[] = [];

  // Maand mapping van Spaans naar nummer
  const monthMap: { [key: string]: number } = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // Verbeterde datum regex die meer OCR fouten herkent
    const dateMatch = trimmedLine.match(/^(\d{1,2})[:/\s]*([nN][oO0][vV]|nov)/i);
    if (dateMatch) {
      const day = dateMatch[1];
      const month = 'nov'; // Alle voorbeelden zijn november
      
      const currentYear = dayjs(vandaag).year();
      currentDate = dayjs(vandaag)
        .year(currentYear)
        .month(monthMap[month])
        .date(parseInt(day, 10));
      
      sortOrderBase = 900; // Reset voor nieuwe datum
      continue;
    }

    // Uitgebreide transactie regex die meer prefixes herkent
    // Inclusief =2 (OCR fout voor Z2)
    const transactionMatch = trimmedLine.match(/^([EZ©&=][)]?|[Z=]2)\s+(.+?)\s*([+-]?\d+[.,]\d{2})\s*€?\s*$/i);
    
    if (transactionMatch) {
      const [, , description, amount] = transactionMatch;
      
      // Clean de omschrijving
      let cleanDescription = description.trim();
      
      // Verwijder verschillende prefixes
      if (cleanDescription.startsWith('Tj-')) {
        cleanDescription = cleanDescription.substring(3);
      } else if (cleanDescription.startsWith('Trf.')) {
        cleanDescription = cleanDescription.substring(4).trim();
      }
      
      // Remove extra tekens die OCR fouten kunnen zijn
      cleanDescription = cleanDescription.replace(/[&$©=]/g, '').trim();

      // Parse het bedrag
      const numericAmount = amount.replace(',', '.');
      
      // Bepaal of het positief of negatief is
      let finalAmount = parseFloat(numericAmount);
      if (!amount.startsWith('+') && !amount.startsWith('-')) {
        // Als geen teken, maak negatief (uitgave)
        finalAmount = -Math.abs(finalAmount);
      } else if (amount.startsWith('+')) {
        // Expliciet positief (inkomst)
        finalAmount = Math.abs(finalAmount);
      } else {
        // Expliciet negatief (uitgave)
        finalAmount = -Math.abs(finalAmount);
      }

      const sortOrder = `${currentDate.format('YYYYMMDD')}.${sortOrderBase}`;
      
      parsed.push({
        id: Number(sortOrder.replace('.', '')),
        boekingsdatum: currentDate.format(DateFormats.YYYY_MM_DD),
        omschrijving: '',
        ocrOmschrijving: cleanDescription,
        bedrag: Math.abs(finalAmount), // In BankAppAfbeelding.tsx wordt Math.abs toegepast
        sortOrder: sortOrder,
        bestaatAl: false,
        betalingsSoort: undefined,
        bron: undefined,
        bestemming: undefined,
      });

      sortOrderBase -= 10;
      continue;
    }

    // Fallback: zoek naar regels met alleen een bedrag (voor incomplete regels)
    const amountOnlyMatch = trimmedLine.match(/^.*?([+-]?\d+[.,]\d{2})\s*€?\s*$/);
    if (amountOnlyMatch && 
        !trimmedLine.includes('Fecha Valor') && 
        !trimmedLine.includes('=') &&
        trimmedLine.length > 10) { // Minimale lengte om noise te vermijden
      
      const amount = amountOnlyMatch[1];
      const description = trimmedLine.replace(amountOnlyMatch[1], '').replace(/€/g, '').trim();
      
      // Skip als beschrijving te kort of bevat veel speciale tekens
      if (description.length > 3 && description.match(/[a-zA-Z]/)) {
        let cleanDescription = description;
        
        // Clean prefixes - inclusief =2
        cleanDescription = cleanDescription.replace(/^[EZ©&=][)]?\s*/, '');
        cleanDescription = cleanDescription.replace(/^[Z=]2\s*/, '');
        cleanDescription = cleanDescription.replace(/^Tj-/, '');
        cleanDescription = cleanDescription.replace(/^Trf\.\s*/, '');
        cleanDescription = cleanDescription.replace(/[&$©=]/g, '').trim();
        
        if (cleanDescription.length > 2) {
          const numericAmount = amount.replace(',', '.');
          let finalAmount = parseFloat(numericAmount);
          
          if (!amount.startsWith('+') && !amount.startsWith('-')) {
            finalAmount = -Math.abs(finalAmount);
          } else if (amount.startsWith('+')) {
            finalAmount = Math.abs(finalAmount);
          } else {
            finalAmount = -Math.abs(finalAmount);
          }

          const sortOrder = `${currentDate.format('YYYYMMDD')}.${sortOrderBase}`;
          
          parsed.push({
            id: Number(sortOrder.replace('.', '')),
            boekingsdatum: currentDate.format(DateFormats.YYYY_MM_DD),
            omschrijving: '',
            ocrOmschrijving: cleanDescription,
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
    
    // Check voor datum (inclusief OCR fouten)
    const dateMatch = trimmedLine.match(/^(\d{1,2})[:/\s]*([nN][oO0][vV]|nov)/i);
    if (dateMatch) {
      currentDate = `${dateMatch[1]} nov`;
      continue;
    }

    // Check voor transactie - inclusief =2
    const transactionMatch = trimmedLine.match(/^([EZ©&=][)]?|[Z=]2)\s+(.+?)\s*([+-]?\d+[.,]\d{2})\s*€?\s*$/i);
    if (transactionMatch && currentDate) {
      const [, , description, amount] = transactionMatch;
      
      let cleanDescription = description.trim();
      cleanDescription = cleanDescription.replace(/^Tj-/, '');
      cleanDescription = cleanDescription.replace(/^Trf\.\s*/, '');
      cleanDescription = cleanDescription.replace(/[&$©=]/g, '').trim();

      transactions.push({
        datum: currentDate,
        omschrijving: cleanDescription,
        bedrag: amount
      });
    }
  }

  return transactions;
};