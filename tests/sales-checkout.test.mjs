import test from "node:test";
import assert from "node:assert/strict";
import { salesCheckoutState } from "../src/lib/sales-order.ts";

test("Roofing Contractors + Florida retains its purchasable Sales selection", () => {
  const state = salesCheckoutState(["roofing:florida"], [], true);
  assert.equal(state.canCheckout, true);
  assert.equal(state.order.totalCents, 9900);
  assert.equal(state.order.discoveryAssignments[0].customerType, "Roofing Contractors");
  assert.equal(state.order.discoveryAssignments[0].region, "Florida");
});
test("empty, Coming Soon and mixed selections fail closed", () => {
  for (const [assignments, universals] of [
    [[], []], [["landscaping:florida"], []], [["landscaping:pacific-northwest"], []], [[], ["first-contact"]],
    [["roofing:florida", "landscaping:florida"], []], [["roofing:florida"], ["first-contact"]],
    [["unknown:florida"], []],
  ]) {
    const state = salesCheckoutState(assignments, universals, true);
    assert.equal(state.canCheckout, false);
    assert.match(state.status, /Only available agents can be hired/);
  }
});
test("Texas selects its own Milo package and multi-region totals remain intact", () => {
  const texas = salesCheckoutState(["roofing:texas"], [], true);
  assert.equal(texas.canCheckout, true);
  assert.equal(texas.productSlug, "milo-texas-roofing-contractors");
  assert.equal(texas.order.totalCents, 9900);
  assert.equal(texas.order.discoveryAssignments[0].region, "Texas");
  const both = salesCheckoutState(["roofing:florida", "roofing:texas"], [], true);
  assert.equal(both.order.totalCents, 19800);
  assert.equal(both.order.discoveryAssignments.length, 2);
  assert.equal(both.order.workspaceModel, "one-shared-sales-workspace-per-customer");
  assert.equal(both.canCheckout, true);
  assert.deepEqual(both.productSlugs, ["milo-florida-roofing-contractors", "milo-texas-roofing-contractors"]);
  assert.doesNotMatch(both.status, /separately/);
});
test("existing feature flags gate the Sales purchase", () => {
  const state = salesCheckoutState(["roofing:florida"], [], false);
  assert.equal(state.canCheckout, false);
  assert.equal(state.order.totalCents, 9900);
  assert.match(state.status, /unavailable/);
});
