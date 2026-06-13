"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  disabled?: (date: Date) => boolean
  fromDate?: Date
  toDate?: Date
  month?: Date
  onMonthChange?: (date: Date) => void
}

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function Calendar({ mode, selected, onSelect, disabled, fromDate, toDate, month: externalMonth, onMonthChange }: CalendarProps) {
  const today = new Date()
  const [internalMonth, setInternalMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const month = externalMonth ?? internalMonth

  const setMonth = (d: Date) => {
    if (onMonthChange) onMonthChange(d)
    else setInternalMonth(d)
  }

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const daysInMonth = getDaysInMonth(year, monthIndex)
  const firstDay = getFirstDayOfMonth(year, monthIndex)

  const prevMonth = () => setMonth(new Date(year, monthIndex - 1, 1))
  const nextMonth = () => setMonth(new Date(year, monthIndex + 1, 1))

  const isDisabled = (day: number) => {
    if (!disabled) return false
    const d = new Date(year, monthIndex, day)
    return disabled(d)
  }

  const handleSelect = (day: number) => {
    if (isDisabled(day)) return
    onSelect?.(new Date(year, monthIndex, day))
  }

  const weeks: number[][] = []
  let days: number[] = []
  for (let i = 0; i < firstDay; i++) days.push(0)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  while (days.length > 0) {
    weeks.push(days.splice(0, 7))
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {MONTHS[monthIndex]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-xs">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-muted-foreground font-medium">{d}</div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (day === 0) return <div key={`${wi}-${di}`} />
            const date = new Date(year, monthIndex, day)
            const isSelected = selected && isSameDay(date, selected)
            const isToday = isSameDay(date, today)
            const dayDisabled = isDisabled(day)
            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={dayDisabled}
                onClick={() => handleSelect(day)}
                className={cn(
                  "py-1.5 text-sm rounded-md transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && isToday && "bg-accent text-accent-foreground",
                  !isSelected && !isToday && "hover:bg-muted",
                  dayDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                {day}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
