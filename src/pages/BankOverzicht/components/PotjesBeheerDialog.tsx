import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, TextField,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import type { Potje, Bucket } from '../types'

type AssignableBucket = Exclude<Bucket, 'ONBEKEND'>

const BUCKET_GROUPS: { bucket: AssignableBucket; label: string }[] = [
  { bucket: 'INKOMEN',      label: 'Inkomsten' },
  { bucket: 'LEEFGELD',     label: 'Leefgeld' },
  { bucket: 'VASTE_LASTEN', label: 'Vaste lasten' },
  { bucket: 'SPAREN',       label: 'Sparen' },
]

interface Props {
  open: boolean
  potjes: Potje[]
  onSluiten: () => void
  onToevoegen: (naam: string, bucket: AssignableBucket) => void
  onVerwijderen: (id: string) => void
  onHernoemen: (id: string, naam: string) => void
}

export function PotjesBeheerDialog({ open, potjes, onSluiten, onToevoegen, onVerwijderen, onHernoemen }: Props) {
  const [openForm, setOpenForm] = useState<AssignableBucket | null>(null)
  const [newNaam, setNewNaam] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNaam, setEditNaam] = useState('')

  const handleToevoegen = (bucket: AssignableBucket) => {
    if (newNaam.trim()) {
      onToevoegen(newNaam.trim(), bucket)
      setNewNaam('')
      setOpenForm(null)
    }
  }

  const handleHernoemen = (id: string, originalNaam: string) => {
    const trimmed = editNaam.trim()
    if (trimmed && trimmed !== originalNaam) {
      onHernoemen(id, trimmed)
    }
    setEditingId(null)
    setEditNaam('')
  }

  return (
    <Dialog open={open} onClose={onSluiten} maxWidth="sm" fullWidth>
      <DialogTitle>Potjes beheren</DialogTitle>
      <DialogContent>
        {BUCKET_GROUPS.map(({ bucket, label }) => {
          const groepPotjes = potjes.filter((p) => p.bucket === bucket)
          return (
            <div key={bucket} className="mb-4">
              <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-600">
                {label}
              </Typography>

              {groepPotjes.length === 0 && openForm !== bucket && (
                <Typography variant="caption" color="text.secondary" className="ml-2">
                  Geen potjes
                </Typography>
              )}

              {groepPotjes.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1">
                  {editingId === p.id ? (
                    <>
                      <TextField
                        size="small"
                        value={editNaam}
                        onChange={(e) => setEditNaam(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleHernoemen(p.id, p.naam)
                          if (e.key === 'Escape') { setEditingId(null); setEditNaam('') }
                        }}
                        autoFocus
                        sx={{ flex: 1 }}
                      />
                      <Button size="small" onClick={() => handleHernoemen(p.id, p.naam)}>OK</Button>
                      <Button size="small" onClick={() => { setEditingId(null); setEditNaam('') }}>
                        Annuleren
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className="flex-1 cursor-pointer hover:underline"
                        onClick={() => { setEditingId(p.id); setEditNaam(p.naam) }}
                      >
                        {p.naam}
                      </span>
                      <IconButton
                        size="small"
                        aria-label={`Verwijder ${p.naam}`}
                        onClick={() => onVerwijderen(p.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </IconButton>
                    </>
                  )}
                </div>
              ))}

              {openForm === bucket ? (
                <div className="mt-1 flex items-center gap-2">
                  <TextField
                    size="small"
                    placeholder="Naam"
                    value={newNaam}
                    onChange={(e) => setNewNaam(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleToevoegen(bucket)
                      if (e.key === 'Escape') { setOpenForm(null); setNewNaam('') }
                    }}
                    autoFocus
                    sx={{ flex: 1 }}
                  />
                  <Button size="small" onClick={() => handleToevoegen(bucket)}>
                    Bevestigen
                  </Button>
                  <Button size="small" onClick={() => { setOpenForm(null); setNewNaam('') }}>
                    Annuleren
                  </Button>
                </div>
              ) : (
                <Button
                  size="small"
                  aria-label={`Nieuw potje voor ${label}`}
                  onClick={() => { setOpenForm(bucket); setNewNaam('') }}
                  sx={{ mt: 0.5 }}
                >
                  + Nieuw potje
                </Button>
              )}
            </div>
          )
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onSluiten}>Sluiten</Button>
      </DialogActions>
    </Dialog>
  )
}
