"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

function formatDateBR(date: Date) {
  const d = String(date.getDate()).padStart(2, "0")
  const m = MONTHS[date.getMonth()]
  const y = date.getFullYear()
  return `${d} de ${m} de ${y}`
}

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: (date: Date) => boolean
  fromDate?: Date
  toDate?: Date
}

export function DatePicker({ value, onChange, placeholder = "Selecione uma data", className, disabled, fromDate, toDate }: DatePickerProps) {
  const date = value ? new Date(value + "T12:00:00") : undefined

  const handleSelect = (d: Date | undefined) => {
    if (d) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      onChange?.(`${year}-${month}-${day}`)
    }
  }

  const isDisabled = (d: Date) => {
    if (disabled?.(d)) return true
    if (fromDate && d < fromDate) return true
    if (toDate && d > toDate) return true
    return false
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDateBR(date) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={isDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
