"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimeSlot {
  id: string
  time: string
  isBooked: boolean
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
  className?: string
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  className,
}: TimeSlotPickerProps) {
  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 gap-2", className)}>
      {slots.length > 0 ? (
        slots.map((slot) => (
          <Button
            key={slot.id}
            type="button"
            variant={selectedSlot === slot.time ? "default" : "outline"}
            className={`${slot.isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={slot.isBooked}
            onClick={() => onSelectSlot(slot.time)}
          >
            {slot.time}
          </Button>
        ))
      ) : (
        <p className="col-span-4 text-center text-muted-foreground py-2">
          No available slots
        </p>
      )}
    </div>
  )
}
