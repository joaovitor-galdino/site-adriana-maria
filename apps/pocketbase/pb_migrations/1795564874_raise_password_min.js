/// <reference path="../pb_data/types.d.ts" />

// Raise the minimum password length on the `users` auth collection from 6 to
// 12 characters for new accounts and password changes. Existing accounts are
// NOT re-validated or modified — they keep their current passwords and can
// still sign in. The minimum only applies to future writes (registration and
// password reset), so no user is locked out by this change.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const passwordField = users.fields.getByName("password");
    passwordField.min = 12;
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const passwordField = users.fields.getByName("password");
    passwordField.min = 6;
    app.save(users);
  },
);
