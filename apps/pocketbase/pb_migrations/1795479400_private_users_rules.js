/// <reference path="../pb_data/types.d.ts" />

// Equal-access, independent registration: both users hold the same 'admin'
// role and neither can see the other's record. Tightens the users list/view
// rules to self-only so no user can enumerate or read the other account.
// createRule stays null — registration goes through the /api/register server
// route (superuser), which the user-limit hook caps at two accounts.
migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  users.listRule = 'id = @request.auth.id';
  users.viewRule = 'id = @request.auth.id';
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId('users');
  users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  app.save(users);
});
