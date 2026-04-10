"use client";

import { addDays, format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

const DateRangePicker = () => {
  const [fromQuery, setFromQuery] = useQueryState("dateFrom");
  const [toQuery, setToQuery] = useQueryState("dateTo");
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const defaultFrom = new Date(new Date().getFullYear(), 0, 20);
    const defaultTo = addDays(defaultFrom, 20);

    const from = fromQuery ? parseISO(fromQuery) : defaultFrom;
    const to = toQuery ? parseISO(toQuery) : defaultTo;

    setDate({ from, to });
  }, []);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);

    if (newDate?.from) {
      setFromQuery(newDate.from.toISOString());
    }
    if (newDate?.to) {
      setToQuery(newDate.to.toISOString());
    }
  };

  return (
    <Field className="mx-auto w-60">
      <FieldLabel htmlFor="date-picker-range">Date Picker Range</FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
};

export default DateRangePicker;
