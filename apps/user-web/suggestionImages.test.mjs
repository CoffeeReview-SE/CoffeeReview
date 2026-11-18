import test from "node:test";
import assert from "node:assert/strict";
import { imageDataError, MAX_IMAGE_BYTES, readImageFile } from "./suggestionImages.mjs";
import { validateSuggestion } from "./suggestionForm.mjs";

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHHsAAAAASUVORK5CYII=";

test("uploaded PNG is accepted in every required image field", () => {
  assert.equal(imageDataError(png), null);
  const errors = validateSuggestion({ logoUrl: png, coverUrl: png, menuImageUrl: png }, true);
  for (const key of ["logoUrl", "coverUrl", "menuImageUrl"]) assert.equal(errors[key], undefined);
});

test("existing-brand proposals accept optional uploaded images and validate supplied images", () => {
  const errors = validateSuggestion({ logoUrl: png, coverUrl: png, menuImageUrl: "" }, false);
  assert.equal(errors.logoUrl, undefined);
  assert.equal(errors.coverUrl, undefined);
  assert.equal(errors.menuImageUrl, undefined);
  assert.equal(validateSuggestion({ logoUrl: "javascript:alert(1)" }, false).logoUrl, "url");
});

test("rejects SVG, malformed base64, and mismatched file contents", () => {
  for (const value of ["data:image/svg+xml;base64,PHN2Zz4=", "data:image/png;base64,%%%", "data:image/png;base64,YWJj", "data:image/jpeg;base64,aGVsbG8="]) {
    assert.equal(imageDataError(value), "imageType");
  }
});

test("size limit applies to encoded data and selected files", async () => {
  const bytes = Buffer.alloc(MAX_IMAGE_BYTES + 1);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(imageDataError(`data:image/png;base64,${bytes.toString("base64")}`), "imageSize");
  await assert.rejects(readImageFile(new Blob([bytes], { type: "image/png" })), /imageSize/);
});

test("selected files are inspected before reading them for upload", async () => {
  await assert.rejects(readImageFile(new Blob(["not a PNG"], { type: "image/png" })), /imageType/);
  await assert.rejects(readImageFile(new Blob(["<svg></svg>"], { type: "image/svg+xml" })), /imageType/);
});
