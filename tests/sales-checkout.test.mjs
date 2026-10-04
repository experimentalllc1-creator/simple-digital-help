import test from "node:test";
import assert from "node:assert/strict";
import { salesCheckoutState } from "../src/lib/sales-order.ts";

test("Roofing Contractors + Florida is the only purchasable Sales selection", () => {
  const state = salesCheckoutState(["roofing:florida"], [], true);
  assert.equal(state.canCheckout, true);
  assert.equal(state.order.totalCents, 9900);
  assert.equal(state.order.discoveryAssignments[0].customerType, "Roofing Contractors");
  assert.equal(state.order.discoveryAssignments[0].region, "Florida");
});
test("empty, Coming Soon and mixed selections fail closed", () => {
  for (const [assignments, universals] of [
    [[], []], [["hvac:florida"], []], [["roofing:texas"], []], [[], ["first-contact"]],
    [["roofing:florida", "hvac:florida"], []], [["roofing:florida"], ["first-contact"]],
    [["roofing:florida", "roofing:texas"], []], [["unknown:florida"], []],
  ]) {
    const state = salesCheckoutState(assignments, universals, true);
    assert.equal(state.canCheckout, false);
    assert.match(state.status, /Only available agents can be hired/);
  }
});
test("existing feature flags gate the Sales purchase", () => {
  const state = salesCheckoutState(["roofing:florida"], [], false);
  assert.equal(state.canCheckout, false);
  assert.equal(state.order.totalCents, 9900);
  assert.match(state.status, /unavailable/);
});
