import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	user: {
		additionalFields: {
			role: {
				type: ["user", "admin"],
				required: false,
				defaultValue: "user",
				input: false, // don't allow user to set role
			},
			lang: {
				type: "string",
				required: false,
				defaultValue: "en",
			},
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3000"],
	emailAndPassword: {
		enabled: true,
	},
	rateLimit: {
		window: 60,
		max: 20,
		customRules: {
			"/sign-in/email": { window: 60, max: 5 },
			"/sign-up/email": { window: 60, max: 3 },
			"/forget-password": { window: 60, max: 3 },
		},
	},
	// Social providers — configure via env vars; disabled if not set
	...(process.env.GITHUB_CLIENT_ID && {
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
			...(process.env.GOOGLE_CLIENT_ID && {
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
				},
			}),
		},
	}),
	advanced: {
		defaultCookieAttributes: {
			sameSite: "lax",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [tanstackStartCookies()],
});
