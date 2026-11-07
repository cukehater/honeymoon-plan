import { describe, expect, it } from "vitest";
import { centsToInput, formatDate, formatEur, formatKrw } from "./format";

describe("format", () => {
  it("formats won", () => {
    expect(formatKrw(1544)).toBe("1,544원");
    expect(formatKrw(9126845)).toBe("9,126,845원");
    expect(formatKrw(0)).toBe("0원");
  });
  it("formats euro cents", () => {
    expect(formatEur(6000)).toBe("€60");
    expect(formatEur(6050)).toBe("€60.50");
    expect(formatEur(5)).toBe("€0.05");
    expect(formatEur(246600)).toBe("€2,466");
  });
  it("formats date with weekday", () => {
    expect(formatDate("2026-12-06")).toBe("12/6 (일)");
    expect(formatDate("2026-11-30")).toBe("11/30 (월)");
  });
  it("formats cents for inputs", () => {
    expect(centsToInput(1250)).toBe("12.50");
    expect(centsToInput(6000)).toBe("60");
    expect(centsToInput(7)).toBe("0.07");
  });
});
