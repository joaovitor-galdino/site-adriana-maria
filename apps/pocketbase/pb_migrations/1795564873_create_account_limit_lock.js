/// <reference path="../pb_data/types.d.ts" />

// Creates a single-row `account_limit` collection used as a write lock so that
// concurrent user-create transactions serialize (see pb_hooks/user-limit.pb.js).
// The row is never exposed via the REST API — every rule on the collection is
// `null` (superuser-only). It holds no meaningful data; only its existence as a
// writable row matters.
migrate(
  (app) => {
    const collection = new Collection({
      type: "base",
      name: "account_limit",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "counter", type: "number" },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    });
    app.save(collection);

    // Seed the single lock row with a stable id (same in preview and live).
    const seedId = $security.sha256("account_limit:lock").substring(0, 15);
    const existing = app.findRecordsByFilter(
      "account_limit",
      "id = {:id}",
      "",
      1,
      0,
      { id: seedId },
    );
    if (existing.length === 0) {
      const record = new Record(collection);
      record.set("id", seedId);
      record.set("counter", 0);
      app.save(record);
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("account_limit");
      app.delete(collection);
    } catch (_) {
      // Already gone — nothing to revert.
    }
  },
);
