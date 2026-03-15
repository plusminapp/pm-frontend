import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Checkbox, FormGroup, Typography,
} from '@mui/material'
import type { CategorizedTransaction, Bucket, UserRule } from '../types'

const BUCKET_OPTIONS: { value: Bucket; label: string }[] = [
  { value: 'INKOMEN',      label: 'Inkomsten' },
  { value: 'LEEFGELD',     label: 'Leefgeld' },
  { value: 'VASTE_LASTEN', label: 'Vaste lasten' },
  { value: 'SPAREN',       label: 'Sparen' },
]

interface Props {
  open: boolean
  transacties: CategorizedTransaction[]
  onSluiten: () => void
  onCorrectie: (ids: string[], bucket: Bucket) => void
  onRegelToepassen: (regel: UserRule) => void
}

export function CorrectionDialog({
  open,
  transacties,
  onSluiten,
  onCorrectie,
  onRegelToepassen,
}: Props) {
  const [gekozenBucket, setGekozenBucket] = useState<Bucket>('LEEFGELD')
  const [toepassenOpAlle, setToepassenOpAlle] = useState(false)

  const tegenpartij = transacties[0]?.tegenpartij ?? ''
  const aantalTekst = transacties.length === 1
    ? '1 transactie'
    : `${transacties.length} transacties`

  const handleOpslaan = () => {
    if (toepassenOpAlle) {
      onRegelToepassen({ tegenpartijPatroon: tegenpartij, bucket: gekozenBucket })
    } else {
      onCorrectie(transacties.map((t) => t.id), gekozenBucket)
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
          <RadioGroup
            value={gekozenBucket}
            onChange={(e) => setGekozenBucket(e.target.value as Bucket)}
          >
            {BUCKET_OPTIONS.map(({ value, label }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>
        </FormControl>

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
        <Button onClick={handleOpslaan} variant="contained">
          Opslaan
        </Button>
      </DialogActions>
    </Dialog>
  )
}
