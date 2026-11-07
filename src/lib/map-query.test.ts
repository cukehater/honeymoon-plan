import { describe, expect, it } from "vitest";
import { toMapQuery } from "./map-query";

describe("toMapQuery", () => {
  it("strips meal prefixes and parentheses, appends city", () => {
    expect(toMapQuery("점심: 카자 게데스 (Casa Guedes)", "meal", "porto")).toBe("카자 게데스 Porto");
    expect(toMapQuery("세트 포르테스 (7 Portes) 파에야", "meal", "barcelona")).toBe("세트 포르테스 파에야 Barcelona");
  });
  it("returns null for flights and rest", () => {
    expect(toMapQuery("포르투 → 바르셀로나 · VY1175", "flight", "porto")).toBeNull();
    expect(toMapQuery("숙소에서 휴식", "rest", "porto")).toBeNull();
  });
});
