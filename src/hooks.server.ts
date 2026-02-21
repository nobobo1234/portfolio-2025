import { redirect, type Handle } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { prisma } from '$lib/server/prisma';

export const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SLIDING_WINDOW_MS = 1000 * 60 * 60 * 24 * 15; // 15 days

function hashSessionToken(token: string): string {
	return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function getSessionCookieOptions(expiresAt: Date) {
	return {
		httpOnly: true,
		sameSite: 'lax' as const,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt
	};
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	let isAuthenticated = false;

	if (sessionToken) {
		const sessionId = hashSessionToken(sessionToken);
		const session = await prisma.session.findUnique({
			where: { id: sessionId },
			include: { user: true }
		});

		if (!session) {
			// Unknown session token: remove the cookie to reduce client confusion.
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		} else if (session.expiresAt.getTime() <= Date.now()) {
			// Expired session: remove from DB and clear the cookie.
			await prisma.session.delete({ where: { id: session.id } });
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		} else {
			// Valid session: attach a minimal user object to locals.
			event.locals.user = {
				id: session.user.id,
				username: session.user.username
			};
			isAuthenticated = true;

			// Sliding expiration: extend if within the renewal window.
			const timeRemaining = session.expiresAt.getTime() - Date.now();
			if (timeRemaining <= SLIDING_WINDOW_MS) {
				const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
				await prisma.session.update({
					where: { id: session.id },
					data: { expiresAt: newExpiresAt }
				});
				event.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(newExpiresAt));
			}
		}
	}

	// Centralized gatekeeper: block /admin for unauthenticated users.
	if (event.url.pathname.startsWith('/admin') && !isAuthenticated) {
		throw redirect(303, '/login');
	}

	if (event.url.pathname === '/login' && isAuthenticated) {
		// Prevent authenticated users from accessing the login page.
		throw redirect(303, '/admin');
	}

	const response = await resolve(event);

	// Security headers: enforce a hardened baseline for all routes.
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
};
