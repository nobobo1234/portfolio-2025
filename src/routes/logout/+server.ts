import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { prisma } from '$lib/server/prisma';

const SESSION_COOKIE_NAME = 'admin_session';

function hashSessionToken(token: string): string {
	return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export const GET = async ({ cookies }) => {
	const sessionToken = cookies.get(SESSION_COOKIE_NAME);

	if (sessionToken) {
		const sessionId = hashSessionToken(sessionToken);
		await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}

	throw redirect(303, '/');
};
