import { json, withApi } from '@/lib/api.server';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';

// public-route: returns only whether a registration slot is still available.
// Registration requires BOTH a configured SETUP_TOKEN (Secret saved by the
// site owner) AND fewer than two existing users. No user data or count is
// exposed — just a boolean. POST so the response is never edge-cached (a
// stale `slotsAvailable: true` after the second signup would re-offer
// registration).
export const action = withApi(async () => {
	try {
		if (!process.env.SETUP_TOKEN) {
			return json({ slotsAvailable: false });
		}
		const result = await pocketbaseAdmin.listRecords('users', { perPage: 1 });
		return json({ slotsAvailable: result.totalItems < 2 });
	} catch {
		// If PocketBase is unreachable, do not offer registration.
		return json({ slotsAvailable: false });
	}
});
