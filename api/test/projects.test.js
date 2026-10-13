import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

async function withServer(fn) {
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  try { await fn(base); } finally { server.close(); }
}
const post = (url, body) =>
  fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("creates and lists projects inside the data envelope", () =>
  withServer(async (base) => {
    const created = await post(`${base}/projects`, { name: "Alpha" });
    assert.equal(created.status, 201);
    const { data } = await created.json();
    assert.equal(data.name, "Alpha");
    const list = await (await fetch(`${base}/projects`)).json();
    assert.equal(list.data.length, 1);
  }));

test("invalid body returns the error envelope with field details", () =>
  withServer(async (base) => {
    const res = await post(`${base}/projects`, { name: "" });
    assert.equal(res.status, 400);
    const { error } = await res.json();
    assert.equal(error.code, "validation_error");
    assert.ok(error.details.name);
  }));

test("duplicate name returns 409", () =>
  withServer(async (base) => {
    await post(`${base}/projects`, { name: "Beta" });
    const res = await post(`${base}/projects`, { name: "beta" });
    assert.equal(res.status, 409);
  }));
