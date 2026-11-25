/// <reference path="../pb_data/types.d.ts" />

// Makes the `owner` relation optional on every content collection so a user
// account can be removed without deleting the studio content it created
// (required relations block deletion). Content survives with a dangling
// owner reference, and the shared access rules let both roles manage it.
migrate((app) => {
  const collections = ['services', 'gallery', 'contact_details', 'availability', 'appointments'];
  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name);
      const ownerField = col.fields.getByName('owner');
      if (ownerField) {
        ownerField.required = false;
      }
      app.save(col);
    } catch (_) {
      // Collection may not exist on a fresh database — skip it.
    }
  }
}, (app) => {
  const collections = ['services', 'gallery', 'contact_details', 'availability', 'appointments'];
  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name);
      const ownerField = col.fields.getByName('owner');
      if (ownerField) {
        ownerField.required = true;
      }
      app.save(col);
    } catch (_) {
      // Skip.
    }
  }
});
