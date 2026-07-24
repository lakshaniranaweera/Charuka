'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { eventSchema, normalizeEventValues, type EventFormValues } from '@/lib/validators'
import { eventsService } from '@/services/events.service'
import type { EventRow } from '@/types'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: EventRow | null
}

function toDefaults(event?: EventRow | null): EventFormValues {
  return {
    event_date: event?.event_date ?? new Date().toISOString().slice(0, 10),
    event_name: event?.event_name ?? '',
    cost: event?.cost ?? 0,
    previsit_date: event?.previsit_date ?? '',
    production_date: event?.production_date ?? '',
    setup_date: event?.setup_date ?? '',
    location: event?.location ?? '',
    activation_manager: event?.activation_manager ?? '',
    remarks: event?.remarks ?? '',
  }
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
}: EventFormDialogProps) {
  const isEdit = Boolean(event)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: toDefaults(event),
  })

  React.useEffect(() => {
    if (open) reset(toDefaults(event))
  }, [open, event, reset])

  const onSubmit = async (values: EventFormValues) => {
    try {
      const payload = normalizeEventValues(values)
      if (isEdit && event) {
        await eventsService.update(event.id, payload)
        toast.success('Event updated')
      } else {
        await eventsService.create(payload)
        toast.success('Event created')
      }
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  const err = (field: keyof EventFormValues) =>
    errors[field] ? (
      <p className="text-xs text-destructive">{errors[field]?.message}</p>
    ) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this activation event.'
              : 'Create a new activation event. Records are stored permanently.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="event_name">Event name *</Label>
              <Input id="event_name" {...register('event_name')} />
              {err('event_name')}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event_date">Event date</Label>
              <Input id="event_date" type="date" {...register('event_date')} />
              {err('event_date')}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Cost (LKR)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                {...register('cost')}
              />
              {err('cost')}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="previsit_date">Previsit date</Label>
              <Input
                id="previsit_date"
                type="date"
                {...register('previsit_date')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="production_date">Production date</Label>
              <Input
                id="production_date"
                type="date"
                {...register('production_date')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup_date">Setup date</Label>
              <Input id="setup_date" type="date" {...register('setup_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="activation_manager">Activation manager</Label>
              <Input
                id="activation_manager"
                {...register('activation_manager')}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" rows={3} {...register('remarks')} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? 'Save changes' : 'Create event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
