import test from "node:test";
import assert from "node:assert/strict";
import { distanceToRoute, shouldReroute } from "./routeTracking.mjs";

const paths = [[[10, 106], [10, 106.02]]];
test("measures to the middle of a long segment, not only vertices", () => {
  assert.ok(distanceToRoute([10, 106.01], paths) < 0.01);
  assert.ok(Math.abs(distanceToRoute([10.001, 106.01], paths) - 111.19) < 1);
});
test("does not invent a segment between disconnected paths", () => {
  assert.ok(distanceToRoute([10, 106.01], [[[10, 106], [10, 106.001]], [[10, 106.019], [10, 106.02]]]) > 900);
});
test("handles repeated coordinates", () => {
  assert.ok(Number.isFinite(distanceToRoute([10.001, 106], [[[10, 106], [10, 106]]])));
});
const sample = { position: [10.001, 106.01], accuracy: 10, timestamp: 99000, paths, now: 100000, lastRequest: 60000, offRouteSince: 90000, mode: "motorcycle" };
test("reroutes only after sustained deviation and cooldown", () => {
  assert.equal(shouldReroute(sample), true);
  assert.equal(shouldReroute({ ...sample, offRouteSince: 95000 }), false);
  assert.equal(shouldReroute({ ...sample, lastRequest: 80000 }), false);
  assert.equal(shouldReroute({ ...sample, position: [10, 106.01] }), false);
});
test("ignores inaccurate and stale GPS", () => {
  assert.equal(shouldReroute({ ...sample, accuracy: 80 }), false);
  assert.equal(shouldReroute({ ...sample, timestamp: 80000 }), false);
});
test("walking uses a smaller deviation threshold", () => {
  const position = [10.0004, 106.01];
  assert.equal(shouldReroute({ ...sample, position, mode: "walk" }), true);
  assert.equal(shouldReroute({ ...sample, position }), false);
});
