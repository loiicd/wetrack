"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DateRangePicker = () => {
  const [fromQuery, setFromQuery] = useQueryState("dateFrom");
  const [toQuery, setToQuery] = useQueryState("dateTo");

  const date: DateRange | undefined =
    fromQuery || toQuery
      ? {
          from: fromQuery ? parseISO(fromQuery) : undefined,
          to: toQuery ? parseISO(toQuery) : undefined,
        }
      : undefined;

  const handleDateChange = (newDate: DateRange | undefined) => {
    setFromQuery(newDate?.from ? newDate.from.toISOString() : null);
    setToQuery(newDate?.to ? newDate.to.toISOString() : null);
  };

  return (
    <Field className="mx-auto">
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
