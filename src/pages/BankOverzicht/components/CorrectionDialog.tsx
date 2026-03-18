import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Checkbox, FormGroup, Typography, Select, MenuItem, InputLabel,
} from '@mui/material'
import type { CategorizedTransaction, Bucket, UserRule, Potje } from '../types'

const BUCKET_OPTIONS: { value: Bucket; label: string }[] = [
  { value: 'INKOMEN',      label: 'Inkomsten' },
  { value: 'LEEFGELD',     label: 'Leefgeld' },
  { value: 'VASTE_LASTEN', label: 'Vaste lasten' },
  { value: 'SPAREN',       label: 'Sparen' },
]

interface Props {
  open: boolean
  transacties: CategorizedTransaction[]
  potjes: Potje[]
  onSluiten: () => void
  onCorrectie: (ids: string[], bucket: Bucket, subCategorie: string | null) => void
  onRegelToepassen: (regel: UserRule) => void
}

export function CorrectionDialog({
  open, transacties, potjes, onSluiten, onCorrectie, onRegelToepassen,
}: Props) {
  const [gekozenBucket, setGekozenBucket] = useState<Bucket>('LEEFGELD')
  const [gekozenSubCategorie, setGekozenSubCategorie] = useState<string>('')
  const [toepassenOpAlle, setToepassenOpAlle] = useState(false)

  // Reset subCategorie when bucket changes
  useEffect(() => { setGekozenSubCategorie('') }, [gekozenBucket])

  const tegenpartij = transacties[0]?.tegenpartij ?? ''
  const aantalTekst = transacties.length === 1 ? '1 transactie' : `${transacties.length} transacties`
  const bucketPotjes = potjes.filter((p) => p.bucket === gekozenBucket)
  const currentSubCategorie = transacties[0]?.subCategorie ?? null
  const isStale = currentSubCategorie && !potjes.some((p) => p.naam === currentSubCategorie)

  const handleOpslaan = () => {
    if (toepassenOpAlle) {
      onRegelToepassen({
        tegenpartijPatroon: tegenpartij,
        bucket: gekozenBucket,
        ...(gekozenSubCategorie ? { subCategorie: gekozenSubCategorie } : {}),
      })
    } else {
      onCorrectie(transacties.map((t) => t.id), gekozenBucket, gekozenSubCategorie || null)
    }
    onSluiten()
  }

  return (
    <Dialog open={open} onClose={onSluiten} maxWidth="xs" fullWidth>
      <DialogTitle>Categorie wijzigen</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {aantalTekst} voor <strong>{tegenpartij}</strong>
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
          <FormLabel component="legend">Nieuwe categorie</FormLabel>
          <RadioGroup value={gekozenBucket} onChange={(e) => setGekozenBucket(e.target.value as Bucket)}>
            {BUCKET_OPTIONS.map(({ value, label }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>
        </FormControl>

        {gekozenBucket !== 'ONBEKEND' && (
          <FormControl fullWidth sx={{ mt: 2 }} disabled={bucketPotjes.length === 0}>
            <InputLabel id="potje-label">Potje</InputLabel>
            <Select
              labelId="potje-label"
              label="Potje"
              value={gekozenSubCategorie}
              onChange={(e) => setGekozenSubCategorie(e.target.value)}
            >
              <MenuItem value="">Geen</MenuItem>
              {isStale && (
                <MenuItem value={currentSubCategorie!} disabled>
                  (onbekend potje: {currentSubCategorie})
                </MenuItem>
              )}
              {bucketPotjes.map((p) => (
                <MenuItem key={p.id} value={p.naam}>{p.naam}</MenuItem>
              ))}
            </Select>
            {bucketPotjes.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Geen potjes — maak aan via Potjes beheren.
              </Typography>
            )}
          </FormControl>
        )}

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={toepassenOpAlle}
                onChange={(e) => setToepassenOpAlle(e.target.checked)}
                inputProps={{ 'aria-label': `Toepassen op alle transacties van "${tegenpartij}"` }}
              />
            }
            label={`Toepassen op alle transacties van "${tegenpartij}"`}
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSluiten}>Annuleren</Button>
        <Button onClick={handleOpslaan} variant="contained">Opslaan</Button>
      </DialogActions>
    </Dialog>
  )
}
