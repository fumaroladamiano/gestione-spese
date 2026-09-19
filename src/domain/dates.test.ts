import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  daysBetween,
  daysInMonth,
  formatDayHeader,
  formatLongDate,
  formatMonthName,
  formatMonthYear,
  formatRelativeDay,
  isISODate,
  isMonthKey,
  mondayBasedWeekday,
  monthRange,
  todayISO,
  toISODate,
  weekdayInitials,
} from "./dates";

const IT = { today: "Oggi", yesterday: "Ieri" };
const EN = { today: "Today", yesterday: "Yesterday" };
const TODAY = "2026-09-16"; // mercoledì

describe("date locali", () => {
  it("usa la data locale e non quella UTC", () => {
    expect(toISODate(new Date(2026, 8, 16, 23, 59))).toBe("2026-09-16");
    expect(todayISO(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
  });

  it("riconosce solo date reali", () => {
    expect(isISODate("2026-09-16")).toBe(true);
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("2026-9-16")).toBe(false);
    expect(isISODate(20260916)).toBe(false);
    expect(isMonthKey("2026-09")).toBe(true);
    expect(isMonthKey("2026-13")).toBe(false);
  });
});

describe("mesi", () => {
  it("calcola inizio e fine del mese", () => {
    expect(monthRange("2026-09")).toEqual({
      start: "2026-09-01",
      end: "2026-09-30",
    });
    expect(monthRange("2026-12")).toEqual({
      start: "2026-12-01",
      end: "2026-12-31",
    });
  });

  it("gestisce gli anni bisestili", () => {
    expect(daysInMonth("2028-02")).toBe(29);
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2100-02")).toBe(28);
  });

  it("passa al mese precedente e successivo anche a cavallo d'anno", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-03", -1)).toBe("2026-02");
  });

  it("conta i giorni tra due date", () => {
    expect(daysBetween("2026-09-01", "2026-09-16")).toBe(15);
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("etichette in italiano", () => {
  it("scrive la data estesa con l'iniziale maiuscola", () => {
    expect(formatLongDate(TODAY, "it")).toBe("Mercoledì 16 settembre");
  });

  it("usa Oggi e Ieri", () => {
    expect(formatRelativeDay(TODAY, TODAY, "it", IT)).toBe("Oggi");
    expect(formatRelativeDay("2026-09-15", TODAY, "it", IT)).toBe("Ieri");
    expect(formatRelativeDay("2026-09-14", TODAY, "it", IT)).toBe("14 set");
  });

  it("scrive le intestazioni dei giorni dello storico", () => {
    expect(formatDayHeader(TODAY, TODAY, "it", IT)).toBe("Oggi · mer 16 set");
    expect(formatDayHeader("2026-09-15", TODAY, "it", IT)).toBe(
      "Ieri · mar 15 set",
    );
    expect(formatDayHeader("2026-09-14", TODAY, "it", IT)).toBe(
      "Lunedì 14 settembre",
    );
    expect(formatDayHeader("2025-12-31", TODAY, "it", IT)).toBe(
      "Mercoledì 31 dicembre 2025",
    );
  });

  it("scrive i mesi", () => {
    expect(formatMonthName("2026-09", "it")).toBe("settembre");
    expect(formatMonthYear("2026-09", "it")).toBe("Settembre 2026");
  });
});

describe("etichette in inglese", () => {
  it("mette il giorno prima del mese", () => {
    expect(formatLongDate(TODAY, "en")).toBe("Wednesday 16 September");
    expect(formatDayHeader("2026-09-14", TODAY, "en", EN)).toBe(
      "Monday 14 September",
    );
  });

  it("usa Today e Yesterday", () => {
    expect(formatRelativeDay(TODAY, TODAY, "en", EN)).toBe("Today");
    expect(formatDayHeader("2026-09-15", TODAY, "en", EN)).toBe(
      "Yesterday · Tue 15 Sep",
    );
  });

  it("scrive i mesi", () => {
    expect(formatMonthName("2026-09", "en")).toBe("September");
    expect(formatMonthYear("2026-09", "en")).toBe("September 2026");
  });
});

describe("settimana da lunedì", () => {
  it("inizia da lunedì in entrambe le lingue", () => {
    expect(weekdayInitials("it")).toEqual(["L", "M", "M", "G", "V", "S", "D"]);
    expect(weekdayInitials("en")).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("numera i giorni partendo da lunedì", () => {
    expect(mondayBasedWeekday("2026-09-14")).toBe(0); // lunedì
    expect(mondayBasedWeekday("2026-09-20")).toBe(6); // domenica
  });
});
