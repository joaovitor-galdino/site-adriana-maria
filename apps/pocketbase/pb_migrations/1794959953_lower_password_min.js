/// <reference path="../pb_data/types.d.ts" />

// Lower the minimum password length on the `users` auth collection so the
// owner's chosen initial password (6 characters) is accepted by PocketBase
// validation. This collection has closed sign-up (createRule: null) and a
// single admin user, so the relaxed minimum only affects that account.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const passwordField = users.fields.getByName('password');
    passwordField.min = 6;
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const passwordField = users.fields.getByName('password');
    passwordField.min = 8;
    app.save(users);
  },
);
