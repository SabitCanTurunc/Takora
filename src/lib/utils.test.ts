import { describe, it, expect } from "vitest";
import { slugify, formatPara } from "./utils";

describe("utils", () => {
  it("slugify türkçe karakterleri dönüştürür", () => {
    expect(slugify("Yılmaz Oto Servis")).toBe("yilmaz-oto-servis");
  });

  it("formatPara try formatı döner", () => {
    expect(formatPara(1500)).toContain("1.500");
  });
});