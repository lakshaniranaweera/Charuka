'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { settingsService } from '@/services/settings.service'
import type { DashboardSettingsRow, ThemeMode } from '@/types'

const COLOR_PRESETS: { label: string; primary: string; accent: string }[] = [
  { label: 'Ocean', primary: '221 83% 53%', accent: '262 83% 58%' },
  { label: 'Emerald', primary: '160 84% 39%', accent: '173 80% 40%' },
  { label: 'Sunset', primary: '17 88% 55%', accent: '340 82% 52%' },
  { label: 'Violet', primary: '262 83% 58%', accent: '291 64% 52%' },
  { label: 'Slate', primary: '215 28% 35%', accent: '221 83% 53%' },
]

function hslPreview(hsl: string) {
  return `hsl(${hsl})`
}

export function SettingsPanel({
  initialSettings,
}: {
  initialSettings: DashboardSettingsRow
}) {
  const [settings, setSettings] =
    React.useState<DashboardSettingsRow>(initialSettings)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState<'background' | 'logo' | null>(
    null
  )

  const save = async () => {
    setSaving(true)
    try {
      const updated = await settingsService.update({
        title: settings.title,
        theme: settings.theme,
        primary_color: settings.primary_color,
        accent_color: settings.accent_color,
        background_url: settings.background_url,
        logo_url: settings.logo_url,
      })
      setSettings(updated)
      toast.success('Settings saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const upload = async (kind: 'background' | 'logo', file?: File) => {
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File must be under 8MB')
      return
    }
    setUploading(kind)
    try {
      const url = await settingsService.uploadAsset(kind, file)
      setSettings((s) => ({
        ...s,
        [kind === 'background' ? 'background_url' : 'logo_url']: url,
      }))
      toast.success('Uploaded — remember to save')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize dashboard branding, theme and colors.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-base">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Dashboard title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Default theme</Label>
              <Select
                value={settings.theme}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    theme: e.target.value as ThemeMode,
                  }))
                }
                options={[
                  { label: 'System', value: 'system' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <UploadTile
                label="Logo"
                url={settings.logo_url}
                loading={uploading === 'logo'}
                onFile={(f) => upload('logo', f)}
              />
              <UploadTile
                label="Background"
                url={settings.background_url}
                loading={uploading === 'background'}
                onFile={(f) => upload('background', f)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-base">Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const active =
                  settings.primary_color === preset.primary &&
                  settings.accent_color === preset.accent
                return (
                  <button
                    key={preset.label}
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        primary_color: preset.primary,
                        accent_color: preset.accent,
                      }))
                    }
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-primary ring-2 ring-primary/40'
                        : 'border-border/60 hover:border-primary/40'
                    }`}
                  >
                    <span className="flex -space-x-2">
                      <span
                        className="h-6 w-6 rounded-full border-2 border-background"
                        style={{ background: hslPreview(preset.primary) }}
                      />
                      <span
                        className="h-6 w-6 rounded-full border-2 border-background"
                        style={{ background: hslPreview(preset.accent) }}
                      />
                    </span>
                    <span className="text-sm font-medium">{preset.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="primary">Primary (HSL)</Label>
                <Input
                  id="primary"
                  value={settings.primary_color}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      primary_color: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accent">Accent (HSL)</Label>
                <Input
                  id="accent"
                  value={settings.accent_color}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, accent_color: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save settings
        </Button>
      </div>
    </div>
  )
}

function UploadTile({
  label,
  url,
  loading,
  onFile,
}: {
  label: string
  url: string | null
  loading: boolean
  onFile: (file?: File) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background/40 transition hover:border-primary/50"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : url ? (
          <Image src={url} alt={label} fill className="object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
            Click to upload
          </span>
        )}
        {url && !loading && (
          <span className="absolute bottom-1 right-1 rounded-md bg-black/60 p-1 text-white">
            <Upload className="h-3 w-3" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  )
}
