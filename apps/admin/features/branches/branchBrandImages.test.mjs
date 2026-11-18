import test from "node:test";
import assert from "node:assert/strict";
import { getBrandFallbackImage } from "./branchBrandImages.mjs";

test("resolves public fallback images for supported brands and image types", () => {
  assert.equal(getBrandFallbackImage("Phê La", "logo"), "/image/phe-la/logo.jpg");
  assert.equal(getBrandFallbackImage("The Coffee House", "cover"), "/image/the-coffee-house/cover.jpg");
  assert.equal(getBrandFallbackImage("Milano Coffee", "menu"), "/image/milano-coffee/menu.png");
  assert.equal(getBrandFallbackImage("Phúc Long", "menu"), "/image/phuc-long/menu.jpg");
});

test("returns no fallback for unknown brands or image types", () => {
  assert.equal(getBrandFallbackImage("Thương hiệu khác", "logo"), "");
  assert.equal(getBrandFallbackImage("Phê La", "branch"), "");
});
