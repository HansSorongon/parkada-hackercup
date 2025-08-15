"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
}

function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hour, setHour] = React.useState<string>("09")
  const [minute, setMinute] = React.useState<string>("00")
  const [period, setPeriod] = React.useState<string>("AM")

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const [timeStr, periodStr] = value.split(" ")
      if (timeStr && periodStr) {
        const [h, m] = timeStr.split(":")
        setHour(h)
        setMinute(m)
        setPeriod(periodStr)
      }
    }
  }, [value])

  // Update parent when time changes
  React.useEffect(() => {
    const timeString = `${hour}:${minute} ${period}`
    if (onChange && timeString !== value) {
      onChange(timeString)
    }
  }, [hour, minute, period, onChange, value])

  // Generate hour options (01-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1
    return h.toString().padStart(2, "0")
  })

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      
      <Select value={hour} onValueChange={setHour}>
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">:</span>

      <Select value={minute} onValueChange={setMinute}>
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export { TimePicker }