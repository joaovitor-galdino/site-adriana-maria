/// <reference path="../pb_data/types.d.ts" />

// Two-user authentication system: one administrator and one professional.
// - Adds the `profissional` role so both users can authenticate.
// - Lets the admin list every user (user management screen).
// - Turns off cascade-delete on every `owner` relation so removing a user
//   never wipes the studio content they created.
// - Opens content management to both roles (shared studio content).
migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  const roleField = users.fields.getByName('role');
  if (roleField) {
    roleField.values = ['admin', 'profissional'];
  }
  users.authRule = "role = 'admin' || role = 'profissional'";
  users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  users.createRule = null;
  users.updateRule = 'id = @request.auth.id && @request.body.role:changed = false';
  users.deleteRule = null;
  app.save(users);

  const both = "@request.auth.role = 'admin' || @request.auth.role = 'profissional'";
  const collections = ['services', 'gallery', 'contact_details', 'availability', 'appointments'];
  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name);
      const ownerField = col.fields.getByName('owner');
      if (ownerField) {
        ownerField.cascadeDelete = false;
      }
      // appointments is fully private; the rest keep their public read rules.
      if (name === 'appointments') {
        col.listRule = both;
        col.viewRule = both;
      }
      col.createRule = both;
      col.updateRule = both;
      col.deleteRule = both;
      app.save(col);
    } catch (_) {
      // Collection may not exist on a fresh database — skip it.
    }
  }
}, (app) => {
  const users = app.findCollectionByNameOrId('users');
  const roleField = users.fields.getByName('role');
  if (roleField) {
    roleField.values = ['admin'];
  }
  users.authRule = "role = 'admin'";
  users.listRule = 'id = @request.auth.id';
  users.viewRule = 'id = @request.auth.id';
  app.save(users);
});
