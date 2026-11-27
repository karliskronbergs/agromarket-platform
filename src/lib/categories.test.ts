import { describe, expect, it } from "vitest";
import {
  buildCategoryTree,
  flattenCategoryTree,
  findCategoryPath,
  getSelfAndDescendantIds,
  hasCheckedAncestor,
  sumTopmostCheckedCounts,
  type CategoryRow,
} from "./categories";

// Mirrors the real taxonomy's shape closely enough to exercise it: a
// homogeneous root (Tehnika) and a heterogeneous one (Lopkopiba) whose
// branches are 3 levels deep, the exact shape that caused this session's
// "lower-level subcategories disappeared" and "double-counted selection"
// regressions.
const ROWS: CategoryRow[] = [
  { id: "lopkopiba", name_lv: "Lopkopība", name_en: "Livestock", parent_id: null },
  { id: "dzivnieki", name_lv: "Dzīvnieki", name_en: "Animals", parent_id: "lopkopiba" },
  { id: "liellopi", name_lv: "Liellopi", name_en: "Cattle", parent_id: "dzivnieki" },
  { id: "vaisli-buli", name_lv: "Vaislas buļļi", name_en: "Breeding bulls", parent_id: "liellopi" },
  { id: "vaisli-govis", name_lv: "Vaislas govis", name_en: "Breeding cows", parent_id: "liellopi" },
  { id: "aitas", name_lv: "Aitas", name_en: "Sheep", parent_id: "dzivnieki" },
  { id: "tehnika", name_lv: "Lauksaimniecības tehnika", name_en: "Machinery", parent_id: null },
  { id: "traktori", name_lv: "Traktori", name_en: "Tractors", parent_id: "tehnika" },
  // Points at a parent that isn't in this set -- buildCategoryTree treats
  // an unresolvable parent_id the same as no parent, rather than dropping
  // the row.
  { id: "orphan", name_lv: "Bāreņi", name_en: "Orphan", parent_id: "missing-parent" },
];

describe("buildCategoryTree", () => {
  it("nests every row under its real parent", () => {
    const tree = buildCategoryTree(ROWS);
    const lopkopiba = tree.find((n) => n.id === "lopkopiba")!;
    const dzivnieki = lopkopiba.children.find((n) => n.id === "dzivnieki")!;
    const liellopi = dzivnieki.children.find((n) => n.id === "liellopi")!;

    expect(dzivnieki.children.map((n) => n.id).sort()).toEqual(["aitas", "liellopi"]);
    expect(liellopi.children.map((n) => n.id).sort()).toEqual(["vaisli-buli", "vaisli-govis"]);
  });

  it("surfaces every genuine root, plus any row whose parent_id doesn't resolve", () => {
    const tree = buildCategoryTree(ROWS);
    expect(tree.map((n) => n.id).sort()).toEqual(["lopkopiba", "orphan", "tehnika"]);
  });

  it("gives every node its own children array, even leaves", () => {
    const tree = buildCategoryTree(ROWS);
    const traktori = tree.find((n) => n.id === "tehnika")!.children[0];
    expect(traktori.children).toEqual([]);
  });
});

describe("flattenCategoryTree", () => {
  it("lists every depth, not just direct children -- the regression this session hit", () => {
    const tree = buildCategoryTree(ROWS);
    const lopkopiba = tree.find((n) => n.id === "lopkopiba")!;
    const flat = flattenCategoryTree(lopkopiba.children);

    // All 5 descendants at every depth must be present, not just the
    // depth-1 "dzivnieki"/"aitas" level.
    expect(flat.map((e) => e.node.id).sort()).toEqual(
      ["aitas", "dzivnieki", "liellopi", "vaisli-buli", "vaisli-govis"].sort(),
    );
  });

  it("assigns depth relative to the children array passed in, not the whole tree", () => {
    const tree = buildCategoryTree(ROWS);
    const lopkopiba = tree.find((n) => n.id === "lopkopiba")!;
    const flat = flattenCategoryTree(lopkopiba.children);
    const depthOf = (id: string) => flat.find((e) => e.node.id === id)!.depth;

    expect(depthOf("dzivnieki")).toBe(0);
    expect(depthOf("aitas")).toBe(1);
    expect(depthOf("liellopi")).toBe(1);
    expect(depthOf("vaisli-buli")).toBe(2);
    expect(depthOf("vaisli-govis")).toBe(2);
  });

  it("preserves depth-first order (a node's own children follow it immediately)", () => {
    const tree = buildCategoryTree(ROWS);
    const lopkopiba = tree.find((n) => n.id === "lopkopiba")!;
    const order = flattenCategoryTree(lopkopiba.children).map((e) => e.node.id);
    expect(order.indexOf("liellopi")).toBeLessThan(order.indexOf("vaisli-buli"));
    expect(order.indexOf("dzivnieki")).toBeLessThan(order.indexOf("liellopi"));
  });

  it("returns an empty list for a leaf's (empty) children array", () => {
    expect(flattenCategoryTree([])).toEqual([]);
  });
});

describe("findCategoryPath", () => {
  const tree = buildCategoryTree(ROWS);

  it("returns the full root-to-target chain", () => {
    const path = findCategoryPath(tree, "vaisli-buli").map((n) => n.id);
    expect(path).toEqual(["lopkopiba", "dzivnieki", "liellopi", "vaisli-buli"]);
  });

  it("returns just the node itself when the target is already a root", () => {
    expect(findCategoryPath(tree, "tehnika").map((n) => n.id)).toEqual(["tehnika"]);
  });

  it("returns an empty path for an id that isn't in the tree", () => {
    expect(findCategoryPath(tree, "does-not-exist")).toEqual([]);
  });

  it("returns an empty path for a missing or null id", () => {
    expect(findCategoryPath(tree, undefined)).toEqual([]);
    expect(findCategoryPath(tree, null)).toEqual([]);
  });
});

describe("getSelfAndDescendantIds", () => {
  it("includes the root plus every descendant at every depth", () => {
    const ids = getSelfAndDescendantIds(ROWS, "lopkopiba");
    expect(ids.sort()).toEqual(
      ["lopkopiba", "dzivnieki", "liellopi", "vaisli-buli", "vaisli-govis", "aitas"].sort(),
    );
  });

  it("never includes a sibling root or its descendants", () => {
    const ids = getSelfAndDescendantIds(ROWS, "lopkopiba");
    expect(ids).not.toContain("tehnika");
    expect(ids).not.toContain("traktori");
  });

  it("returns just the id itself for a leaf category", () => {
    expect(getSelfAndDescendantIds(ROWS, "vaisli-buli")).toEqual(["vaisli-buli"]);
  });
});

describe("hasCheckedAncestor / sumTopmostCheckedCounts (double-count guard)", () => {
  const flat = flattenCategoryTree(buildCategoryTree(ROWS).find((n) => n.id === "lopkopiba")!.children);
  const descendantById = new Map(flat.map((e) => [e.node.id, e.node]));
  const counts: Record<string, number> = {
    dzivnieki: 12,
    liellopi: 7,
    "vaisli-buli": 3,
    "vaisli-govis": 4,
    aitas: 5,
  };

  it("does not flag a node whose ancestors are all unchecked", () => {
    const checked = new Set(["vaisli-buli"]);
    expect(hasCheckedAncestor("vaisli-buli", checked, descendantById, "lopkopiba")).toBe(false);
  });

  it("flags a node once its direct parent is checked", () => {
    const checked = new Set(["liellopi", "vaisli-buli"]);
    expect(hasCheckedAncestor("vaisli-buli", checked, descendantById, "lopkopiba")).toBe(true);
  });

  it("flags a node when a grandparent (not the direct parent) is checked", () => {
    const checked = new Set(["dzivnieki", "vaisli-buli"]);
    expect(hasCheckedAncestor("vaisli-buli", checked, descendantById, "lopkopiba")).toBe(true);
  });

  it("stops at rootId -- the root chip itself is never treated as a checked ancestor", () => {
    // "lopkopiba" is the root passed in, not a selectable row -- checking
    // it shouldn't be possible, but even if it were in the set, the walk
    // must not cross past rootId.
    const checked = new Set(["lopkopiba", "aitas"]);
    expect(hasCheckedAncestor("aitas", checked, descendantById, "lopkopiba")).toBe(false);
  });

  it("sums only the topmost checked id in each branch -- the exact bug this session fixed", () => {
    // Both "liellopi" and its own child "vaisli-buli" are checked at once,
    // which real users could do in the multi-select dropdown. The total
    // must count "liellopi" (12 includes vaisli-buli already) once, not
    // 7 + 3 = 10 on top of it.
    const checked = new Set(["liellopi", "vaisli-buli"]);
    expect(sumTopmostCheckedCounts(checked, descendantById, "lopkopiba", counts)).toBe(7);
  });

  it("adds counts across independent branches normally", () => {
    const checked = new Set(["liellopi", "aitas"]);
    expect(sumTopmostCheckedCounts(checked, descendantById, "lopkopiba", counts)).toBe(7 + 5);
  });

  it("falls back to 0 for a checked id with no count entry", () => {
    const checked = new Set(["vaisli-govis"]);
    expect(sumTopmostCheckedCounts(checked, descendantById, "lopkopiba", {})).toBe(0);
  });
});
