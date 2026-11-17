import test from "node:test";
import assert from "node:assert/strict";
import { emptySuggestion, suggestionFields, validateSuggestion } from "./suggestionForm.mjs";

const complete = {
  name: "Nguyễn An", phone: "+84 901 234 567", brandName: "Thương hiệu mới",
  type: "Cà phê, Trà, Bánh", description: "Mô tả thương hiệu.",
  websiteUrl: "https://example.com", logoUrl: "https://example.com/logo.png",
  coverUrl: "https://example.com/cover.jpg", menuImageUrl: "https://example.com/menu.jpg",
  branchName: "Chi nhánh Quận 1", address: "12 Nguyễn Huệ, Bến Nghé, TP.HCM",
  branchPhone: "028 1234 5678", latitude: "10.77", longitude: "106.70",
  openingHours: "Thứ 2–Chủ nhật, 07:00–22:00", note: "",
};

test("each mandatory field blocks a new brand when absent or whitespace", () => {
  assert.deepEqual(validateSuggestion(complete, true), {});
  for (const field of suggestionFields) {
    for (const value of [undefined, "", "   "]) {
      assert.equal(validateSuggestion({ ...complete, [field.name]: value }, true)[field.name], "required", field.name);
    }
  }
  assert.equal(Object.keys(validateSuggestion(emptySuggestion, true)).length, suggestionFields.length);
});

test("existing brands still require all branch and contact details", () => {
  const branch = { ...complete };
  for (const field of suggestionFields.filter(field => field.brandOnly)) delete branch[field.name];
  assert.deepEqual(validateSuggestion(branch, false), {});
  assert.equal(validateSuggestion({ ...branch, address: " " }, false).address, "required");
  assert.equal(validateSuggestion({ ...branch, branchName: "" }, false).branchName, "required");
  assert.equal(validateSuggestion(branch, true).description, "required");
});

test("URLs require complete HTTP or HTTPS addresses", () => {
  for (const url of ["javascript:alert(1)", "data:image/png;base64,abc", "example.com/logo.jpg", "https:example.com", "https://bad host/image.jpg"]) {
    assert.equal(validateSuggestion({ ...complete, logoUrl: url }, true).logoUrl, "url", url);
  }
});

test("coordinates require numbers in range and accept zero", () => {
  assert.deepEqual(validateSuggestion({ ...complete, latitude: 0, longitude: 0 }, true), {});
  for (const latitude of ["NaN", "Infinity", "abc", 90.1, -90.1]) {
    assert.equal(validateSuggestion({ ...complete, latitude }, true).latitude, "coordinates");
  }
  assert.equal(validateSuggestion({ ...complete, longitude: 181 }, true).longitude, "coordinates");
});

test("both phone fields reject unusable numbers", () => {
  for (const field of ["phone", "branchPhone"]) {
    for (const value of ["abc123456789", "123", "1234567890123456", "+++123456789"]) {
      assert.equal(validateSuggestion({ ...complete, [field]: value }, true)[field], "phone");
    }
  }
});

test("length limits also apply to direct validation and optional notes", () => {
  for (const field of suggestionFields.filter(field => field.maxLength)) {
    assert.equal(validateSuggestion({ ...complete, [field.name]: "x".repeat(field.maxLength + 1) }, true)[field.name], "tooLong");
  }
  assert.equal(validateSuggestion({ ...complete, note: "x".repeat(2001) }, true).note, "tooLong");
});
