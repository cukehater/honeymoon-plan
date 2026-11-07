import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("adds BOM, CRLF and quotes special cells", () => {
    expect(toCsv([["날짜", "메모"], ["2026-12-05", 'a,"b"\nc'], [1, null]])).toBe(
      '﻿날짜,메모\r\n2026-12-05,"a,""b""\nc"\r\n1,\r\n',
    );
  });
});
