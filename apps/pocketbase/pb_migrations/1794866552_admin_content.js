/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  if (!users.fields.getByName('role')) users.fields.add(new SelectField({ name: 'role', maxSelect: 1, values: ['admin'] }));
  users.createRule = null;
  users.listRule = 'id = @request.auth.id';
  users.viewRule = 'id = @request.auth.id';
  users.updateRule = 'id = @request.auth.id && @request.body.role:changed = false';
  users.deleteRule = null;
  users.authRule = "role = 'admin'";
  app.save(users);
  const owner = { name: 'owner', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true };
  const dates = [{ name: 'created', type: 'autodate', onCreate: true, onUpdate: false }, { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }];
  const rules = {
    listRule: "@request.auth.role = 'admin' && owner = @request.auth.id",
    viewRule: "@request.auth.role = 'admin' && owner = @request.auth.id",
    createRule: "@request.auth.role = 'admin' && @request.body.owner = @request.auth.id",
    updateRule: "@request.auth.role = 'admin' && owner = @request.auth.id && @request.body.owner:changed = false",
    deleteRule: "@request.auth.role = 'admin' && owner = @request.auth.id"
  };
  const definitions = [
    ['services', [{ name: 'name', type: 'text', required: true, max: 150 }, { name: 'description', type: 'text', max: 5000 }]],
    ['gallery', [{ name: 'title', type: 'text', required: true, max: 150 }, { name: 'description', type: 'text', max: 2000 }, { name: 'image', type: 'file', required: true, maxSelect: 1, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], protected: true, thumbs: ['480x480', '800x600'] }]],
    ['contact_details', [{ name: 'professional_name', type: 'text', max: 150 }, { name: 'email', type: 'email' }, { name: 'phone', type: 'text', max: 30 }, { name: 'whatsapp', type: 'text', max: 30 }, { name: 'instagram', type: 'text', max: 100 }, { name: 'address', type: 'text', max: 500 }, { name: 'hours', type: 'text', max: 1000 }]]
  ];
  for (const [name, fields] of definitions) {
    let collection;
    try { collection = app.findCollectionByNameOrId(name); } catch (_) {
      collection = new Collection({ name, type: 'base', ...rules, fields: [owner, ...fields, ...dates], indexes: name === 'contact_details' ? ['CREATE UNIQUE INDEX idx_contact_details_owner ON contact_details (owner)'] : [] });
      app.save(collection);
    }
  }
}, (app) => {
  for (const name of ['contact_details', 'gallery', 'services']) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (_) { /* Already removed. */ }
  }
  const users = app.findCollectionByNameOrId('users');
  users.authRule = null;
  users.updateRule = 'id = @request.auth.id';
  users.fields.removeByName('role');
  app.save(users);
});
