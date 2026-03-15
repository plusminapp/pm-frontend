import { useState } from 'react'
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { FileDown, FileText, FileSpreadsheet } from 'lucide-react'
import { triggerCsvDownload } from '../export/exportCsv'
import { exportPdf } from '../export/exportPdf'
import type { CategorizedTransaction } from '../types'

interface Props {
  transacties: CategorizedTransaction[]
  jaar: number
}

export function ExportButtons({ transacties, jaar }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  const handleCsv = () => {
    triggerCsvDownload(transacties, jaar)
    setAnchor(null)
  }

  const handlePdf = () => {
    exportPdf(transacties, jaar)
    setAnchor(null)
  }

  return (
    <>
      <Button
        variant="contained"
        color="success"
        startIcon={<FileDown className="h-4 w-4" />}
        onClick={(e) => setAnchor(e.currentTarget)}
        size="small"
      >
        Exporteren
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={handleCsv}>
          <ListItemIcon><FileSpreadsheet className="h-4 w-4" /></ListItemIcon>
          <ListItemText>CSV downloaden</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePdf}>
          <ListItemIcon><FileText className="h-4 w-4" /></ListItemIcon>
          <ListItemText>PDF downloaden</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
