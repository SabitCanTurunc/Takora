import { describe, it, expect } from "vitest";
import { rolSeviyesi } from "./roller";

describe("tenant rolleri", () => {
  it("rol seviyeleri doğru sıralanır", () => {
    expect(rolSeviyesi("SAHIP")).toBeGreaterThan(rolSeviyesi("YONETICI"));
    expect(rolSeviyesi("YONETICI")).toBeGreaterThan(rolSeviyesi("CALISAN"));
  });
});