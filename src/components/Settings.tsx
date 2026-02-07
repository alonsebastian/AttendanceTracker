import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { useAttendanceStore } from '@/store/attendanceStore'
import { isValid, parseISO } from 'date-fns'
import { formatDateKey } from '@/lib/dateUtils'

export default function Settings() {
  const { dates, replaceAll, mergeWith } = useAttendanceStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const dataStr = JSON.stringify(dates, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance_backup.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Security: Limit file size to 5MB to prevent DoS
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Maximum size is 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string

        // Security: Parse with prototype pollution protection
        const importedDates = JSON.parse(content, (key, value) => {
          // Block prototype pollution attempts
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return undefined
          }
          return value
        })

        // Validate: must be an array of strings in YYYY-MM-DD format
        if (!Array.isArray(importedDates)) {
          alert('Invalid file: Expected an array of dates')
          return
        }

        // Security: Additional check for malicious properties
        if (importedDates.hasOwnProperty('__proto__') ||
            importedDates.hasOwnProperty('constructor')) {
          alert('Invalid file: Malicious content detected')
          return
        }

        // Security: Limit array size to prevent memory exhaustion (~27 years of daily attendance)
        const MAX_DATES = 10000
        if (importedDates.length > MAX_DATES) {
          alert(`Too many dates. Maximum allowed is ${MAX_DATES}.`)
          return
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/

        // Security: Validate both format AND semantic validity of dates
        const allValid = importedDates.every((d) => {
          if (typeof d !== 'string' || !dateRegex.test(d)) return false

          // Validate that it's a real date (prevents dates like 2025-13-45)
          const date = parseISO(d)
          if (!isValid(date)) return false

          // Ensure round-trip consistency
          return formatDateKey(date) === d
        })

        if (!allValid) {
          alert('Invalid file: All dates must be valid dates in YYYY-MM-DD format')
          return
        }

        // Ask user: replace or merge?
        const shouldReplace = window.confirm(
          'Replace all existing data?\n\nOK = Replace all\nCancel = Merge with existing'
        )

        if (shouldReplace) {
          replaceAll(importedDates)
        } else {
          mergeWith(importedDates)
        }

        alert(`Successfully imported ${importedDates.length} dates!`)
      } catch (error) {
        // Security: Don't leak implementation details in error messages
        console.error('Import error:', error)
        alert('Error reading file. Please ensure it is a valid JSON backup file.')
      }
    }

    reader.readAsText(file)

    // Reset input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleExport}
          variant="outline"
          className="w-full"
          style={{ minHeight: '44px' }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Backup
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
          style={{ minHeight: '44px' }}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Backup
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground">
          Current data: {dates.length} attendance day{dates.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  )
}
