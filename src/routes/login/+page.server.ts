import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import { prisma } from '$lib/server/prisma';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_MS = 1000 * 60 * 10; // 10 minutes
const GENERIC_AUTH_ERROR = 'Incorrect username or password';
const RATE_LIMIT_ERROR = 'Too many attempts. Please try again later.';

const LoginSchema = z.object({
	username: z.string().min(1).max(255),
	password: z.string().min(8).max(255)
});

// Precompute a dummy hash once to normalize timing for unknown usernames.
// If a password is checked against this hash, it will take the same amount of time as a valid hash,
// preventing user enumeration via timing attacks.
const DUMMY_PASSWORD_HASH = await argon2.hash('invalid-password', {
	type: argon2.argon2id,
	memoryCost: 19456,
	timeCost: 2,
	parallelism: 1
});

function hashSessionToken(token: string): string {
	return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export const actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		// Resolve the caller's IP for rate-limiting.
		const ipAddress = getClientAddress();

		// Look up the current IP throttle state before any auth work.
		const loginAttempt = await prisma.loginAttempt.findUnique({
			where: { ipAddress }
		});

		// If the IP is currently locked out, fail fast with a generic message.
		if (loginAttempt?.lockoutExpiresAt && loginAttempt.lockoutExpiresAt.getTime() > Date.now()) {
			return fail(429, { error: RATE_LIMIT_ERROR });
		}

		const formData = Object.fromEntries(await request.formData());
		const parsed = LoginSchema.safeParse(formData);

		if (!parsed.success) {
			return fail(400, { error: GENERIC_AUTH_ERROR });
		}

		const { username, password } = parsed.data;

		const user = await prisma.user.findUnique({ where: { username } });

		// Use a constant-time verify regardless of whether the user exists.
		const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
		const passwordValid = await argon2.verify(passwordHash, password);

		if (!user || !passwordValid) {
			// Increment IP-based attempts and lock out if the threshold is reached.
			const nextAttempts = (loginAttempt?.attempts ?? 0) + 1;
			const lockoutExpiresAt =
				nextAttempts >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;

			await prisma.loginAttempt.upsert({
				where: { ipAddress },
				create: {
					ipAddress,
					attempts: nextAttempts,
					lockoutExpiresAt
				},
				update: {
					attempts: nextAttempts,
					lockoutExpiresAt
				}
			});

			return fail(400, { error: GENERIC_AUTH_ERROR });
		}

		// Successful login: reset any IP-based throttling state.
		await prisma.loginAttempt.upsert({
			where: { ipAddress },
			create: { ipAddress, attempts: 0, lockoutExpiresAt: null },
			update: { attempts: 0, lockoutExpiresAt: null }
		});

		// Always create a new session token on login to prevent fixation.
		const sessionToken = crypto.randomBytes(20).toString('hex');
		const sessionId = hashSessionToken(sessionToken);
		const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

		await prisma.session.create({
			data: {
				id: sessionId,
				userId: user.id,
				expiresAt
			}
		});

		cookies.set(SESSION_COOKIE_NAME, sessionToken, {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: process.env.NODE_ENV === 'production',
			expires: expiresAt
		});

		throw redirect(303, '/admin');
	}
};
