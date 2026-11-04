import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterSchools,
  schoolLocation,
  sortSchools,
  storageUsage,
} from "./schoolList";

const school = (id: string, title: string, extra = {}) => ({
  id,
  title,
  description: "",
  city: "",
  country: "",
  ...extra,
});

test("sortSchools pins the default first, then sorts by name", () => {
  const list = [school("a", "Zeta"), school("b", "Alpha"), school("c", "Mid")];
  assert.deepEqual(sortSchools(list, "a").map((s) => s.id), ["a", "b", "c"]);
  assert.deepEqual(sortSchools(list, null).map((s) => s.id), ["b", "c", "a"]);
  assert.deepEqual(list.map((s) => s.id), ["a", "b", "c"], "no mutation");
});

test("filterSchools matches name, city, country and description", () => {
  const list = [
    school("a", "Tatuga Academy", { city: "Chiang Mai" }),
    school("b", "โรงเรียนบ้านสวน", { country: "Thailand" }),
    school("c", "Other", { description: "Science focus" }),
  ];
  assert.deepEqual(filterSchools(list, "  ").map((s) => s.id), ["a", "b", "c"]);
  assert.deepEqual(filterSchools(list, "chiang").map((s) => s.id), ["a"]);
  assert.deepEqual(filterSchools(list, "บ้าน").map((s) => s.id), ["b"]);
  assert.deepEqual(filterSchools(list, "THAI").map((s) => s.id), ["b"]);
  assert.deepEqual(filterSchools(list, "science").map((s) => s.id), ["c"]);
});

test("storageUsage caps percent and treats huge limits as unlimited", () => {
  const gb = 1024 ** 3;
  assert.deepEqual(
    storageUsage({ ...school("a", "A"), totalStorage: 3 * gb, limitTotalStorage: 15 * gb }),
    { used: 3 * gb, limit: 15 * gb, percent: 20 },
  );
  assert.equal(
    storageUsage({ ...school("a", "A"), totalStorage: 20 * gb, limitTotalStorage: 15 * gb }).percent,
    100,
  );
  assert.equal(
    storageUsage({ ...school("a", "A"), totalStorage: gb, limitTotalStorage: 10737418240000 }).limit,
    null,
  );
  assert.equal(storageUsage(school("a", "A")).limit, null);
});

test("schoolLocation joins the parts that exist", () => {
  assert.equal(schoolLocation(school("a", "A", { city: "Bangkok", country: "Thailand" })), "Bangkok, Thailand");
  assert.equal(schoolLocation(school("a", "A", { city: " Bangkok " })), "Bangkok");
  assert.equal(schoolLocation(school("a", "A")), "");
});
