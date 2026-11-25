/// <reference path="../pb_data/types.d.ts" />

// Backend enforcement of the two-user limit.
//
// Two layers:
//  1. `onRecordCreateRequest` — fast path: rejects early (before validation)
//     when two users already exist. Its count read is NOT locked, so under a
//     concurrent race two requests could both pass it. It exists only to fail
//     fast in the common sequential case.
//  2. `onRecordCreate` — the authoritative, atomic check. It runs INSIDE the
//     save transaction and acquires the database write lock (a no-op UPDATE on
//     the single `account_limit` lock row created by migration
//     1795564873_create_account_limit_lock.js) BEFORE counting. Two concurrent
//     create transactions therefore serialize: the second blocks on the UPDATE
//     until the first commits (its user INSERT included), then reads the updated
//     count and is rejected if the limit is reached. Throwing aborts the save
//     and rolls the transaction back, so no third user is ever persisted.
//
// The count excludes the record being created (`id != currentId`), so it is
// correct whether the hook fires before or after the INSERT. The hook fires for
// every user create — including superuser calls from the /api/register server
// route — so the cap holds regardless of how the record is created.

onRecordCreateRequest((e) => {
  const existing = $app.findRecordsByFilter("users", "id != ''", "", 100, 0);
  if (existing.length >= 2) {
    throw new BadRequestError("Não é permitido cadastrar mais de dois usuários.");
  }
  e.next();
}, "users");

onRecordCreate((e) => {
  const lockId = $security.sha256("account_limit:lock").substring(0, 15);
  // Acquire the database write lock BEFORE counting so that concurrent
  // create transactions serialize at this point.
  $app
    .db()
    .newQuery("UPDATE account_limit SET counter = counter WHERE id = {:id}")
    .bind({ id: lockId })
    .execute();
  // Count existing users excluding the record being created.
  const existing = $app.findRecordsByFilter(
    "users",
    "id != {:currentId}",
    "",
    100,
    0,
    { currentId: e.record.id },
  );
  if (existing.length >= 2) {
    throw new BadRequestError("Não é permitido cadastrar mais de dois usuários.");
  }
  e.next();
}, "users");
