/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  const owner = { name: 'owner', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true };
  const dates = [
    { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
  ];
  const adminRules = {
    listRule: "@request.auth.role = 'admin' && owner = @request.auth.id",
    viewRule: "@request.auth.role = 'admin' && owner = @request.auth.id",
    createRule: "@request.auth.role = 'admin' && @request.body.owner = @request.auth.id",
    updateRule: "@request.auth.role = 'admin' && owner = @request.auth.id && @request.body.owner:changed = false",
    deleteRule: "@request.auth.role = 'admin' && owner = @request.auth.id"
  };

  // Services: public read (the public site lists them) + price and procedure photo.
  const services = app.findCollectionByNameOrId('services');
  services.listRule = '';
  services.viewRule = '';
  if (!services.fields.getByName('price')) services.fields.add(new NumberField({ name: 'price', min: 0 }));
  if (!services.fields.getByName('image')) services.fields.add(new FileField({ name: 'image', maxSelect: 1, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], thumbs: ['480x480', '800x600'] }));
  app.save(services);

  // Gallery: public read; files become publicly viewable (no token needed).
  const gallery = app.findCollectionByNameOrId('gallery');
  gallery.listRule = '';
  gallery.viewRule = '';
  const galleryImage = gallery.fields.getByName('image');
  galleryImage.protected = false;
  app.save(gallery);

  // Contact details: public read + public presentation fields.
  const contact = app.findCollectionByNameOrId('contact_details');
  contact.listRule = '';
  contact.viewRule = '';
  if (!contact.fields.getByName('presentation')) contact.fields.add(new TextField({ name: 'presentation', max: 600 }));
  if (!contact.fields.getByName('story')) contact.fields.add(new TextField({ name: 'story', max: 5000 }));
  if (!contact.fields.getByName('photo')) contact.fields.add(new FileField({ name: 'photo', maxSelect: 1, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], thumbs: ['480x480', '800x600'] }));
  app.save(contact);

  // Appointments: registered and managed by the professional only.
  const appointments = new Collection({
    name: 'appointments', type: 'base', ...adminRules,
    fields: [
      owner,
      { name: 'client_name', type: 'text', required: true, max: 150 },
      { name: 'phone', type: 'text', max: 30 },
      { name: 'service', type: 'text', max: 150 },
      { name: 'date', type: 'date' },
      { name: 'time', type: 'text', max: 10 },
      { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['pendente', 'confirmado', 'concluído', 'cancelado'] },
      { name: 'notes', type: 'text', max: 1000 },
      ...dates
    ],
    indexes: []
  });
  app.save(appointments);

  // Availability: public read (opening hours on the public site), admin-managed.
  const availability = new Collection({
    name: 'availability', type: 'base',
    listRule: '', viewRule: '',
    createRule: adminRules.createRule, updateRule: adminRules.updateRule, deleteRule: adminRules.deleteRule,
    fields: [
      owner,
      { name: 'weekday', type: 'select', required: true, maxSelect: 1, values: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'] },
      { name: 'start_time', type: 'text', required: true, max: 5 },
      { name: 'end_time', type: 'text', required: true, max: 5 },
      { name: 'enabled', type: 'bool' },
      { name: 'note', type: 'text', max: 200 },
      ...dates
    ],
    indexes: []
  });
  app.save(availability);
}, (app) => {
  for (const name of ['availability', 'appointments']) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (_) { /* Already removed. */ }
  }
  const ownerRule = "@request.auth.role = 'admin' && owner = @request.auth.id";
  const services = app.findCollectionByNameOrId('services');
  services.listRule = ownerRule;
  services.viewRule = ownerRule;
  services.fields.removeByName('price');
  services.fields.removeByName('image');
  app.save(services);
  const gallery = app.findCollectionByNameOrId('gallery');
  gallery.listRule = ownerRule;
  gallery.viewRule = ownerRule;
  gallery.fields.getByName('image').protected = true;
  app.save(gallery);
  const contact = app.findCollectionByNameOrId('contact_details');
  contact.listRule = ownerRule;
  contact.viewRule = ownerRule;
  contact.fields.removeByName('presentation');
  contact.fields.removeByName('story');
  contact.fields.removeByName('photo');
  app.save(contact);
});
