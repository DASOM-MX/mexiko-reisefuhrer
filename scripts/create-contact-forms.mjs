#!/usr/bin/env node
/**
 * Creates the three contact forms (kontakt-de / kontakt-en / kontakt-es)
 * used by the homepage, through the forms plugin's admin API.
 *
 * Forms live in plugin storage, not in seed/seed.json, so run this once per
 * environment (local dev, production) after setup. Existing slugs are skipped.
 *
 *   EMDASH_URL=https://example.com EMDASH_TOKEN=ec_pat_... \
 *   NOTIFY_EMAIL=you@example.com node scripts/create-contact-forms.mjs
 *
 * EMDASH_TOKEN is an API token from Admin → Settings → API tokens.
 * Locally you can pass EMDASH_COOKIE (the session cookie) instead.
 * NOTIFY_EMAIL is optional: it can also be set later in Admin → Forms.
 */

const base = (process.env.EMDASH_URL ?? "http://localhost:4321").replace(/\/$/, "");
const notifyEmails = (process.env.NOTIFY_EMAIL ?? "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

const headers = { "Content-Type": "application/json", "X-EmDash-Request": "1" };
if (process.env.EMDASH_TOKEN) headers.Authorization = `Bearer ${process.env.EMDASH_TOKEN}`;
else if (process.env.EMDASH_COOKIE) headers.Cookie = process.env.EMDASH_COOKIE;
else {
	console.error("Set EMDASH_TOKEN (or EMDASH_COOKIE for local dev).");
	process.exit(1);
}

const COPY = {
	de: {
		name: "Kontakt (Deutsch)",
		fields: ["Name", "E-Mail", "Reisezeitraum und Wunschziele"],
		submit: "Anfrage senden",
		thanks: "Vielen Dank für Ihre Nachricht! Ich melde mich schnellstmöglich bei Ihnen.",
		autoSubject: "Ihre Anfrage bei Mexiko Reiseführer",
		autoBody:
			"Vielen Dank für Ihre Anfrage. Ich habe Ihre Nachricht erhalten und melde mich schnellstmöglich bei Ihnen.\n\nJuan José Garcia Arcos",
	},
	en: {
		name: "Contact (English)",
		fields: ["Name", "Email", "Travel dates and destinations"],
		submit: "Send request",
		thanks: "Thank you for your message! I’ll get back to you as soon as possible.",
		autoSubject: "Your request to Mexiko Reiseführer",
		autoBody:
			"Thank you for your request. I have received your message and will get back to you as soon as possible.\n\nJuan José Garcia Arcos",
	},
	es: {
		name: "Contacto (Español)",
		fields: ["Nombre", "Correo electrónico", "Fechas del viaje y destinos"],
		submit: "Enviar solicitud",
		thanks: "¡Gracias por tu mensaje! Te respondo lo antes posible.",
		autoSubject: "Tu solicitud a Mexiko Reiseführer",
		autoBody:
			"Gracias por tu solicitud. Recibí tu mensaje y te respondo lo antes posible.\n\nJuan José Garcia Arcos",
	},
};

async function call(route, body) {
	const res = await fetch(`${base}/_emdash/api/plugins/emdash-forms/${route}`, {
		method: "POST",
		headers,
		body: JSON.stringify(body ?? {}),
	});
	const json = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(`${route} → ${res.status} ${JSON.stringify(json)}`);
	return json.data ?? json;
}

const existing = await call("forms/list");
const existingSlugs = new Set((existing.items ?? existing.forms ?? existing ?? []).map((f) => f.slug));

for (const [locale, c] of Object.entries(COPY)) {
	const slug = `kontakt-${locale}`;
	if (existingSlugs.has(slug)) {
		console.log(`= ${slug} exists, skipped`);
		continue;
	}
	const [nameLabel, emailLabel, messageLabel] = c.fields;
	await call("forms/create", {
		name: c.name,
		slug,
		pages: [
			{
				fields: [
					{ id: "name", type: "text", name: "name", label: nameLabel, required: true, width: "half", validation: { minLength: 2, maxLength: 120 } },
					{ id: "email", type: "email", name: "email", label: emailLabel, required: true, width: "half" },
					{ id: "message", type: "textarea", name: "message", label: messageLabel, required: true, width: "full", validation: { minLength: 10, maxLength: 3000 } },
					{ id: "language", type: "hidden", name: "language", label: "Language", required: false, defaultValue: locale },
				],
			},
		],
		settings: {
			confirmationMessage: c.thanks,
			submitLabel: c.submit,
			notifyEmails,
			spamProtection: "honeypot",
			retentionDays: 0,
			autoresponder: { subject: c.autoSubject, body: c.autoBody },
		},
	});
	console.log(`+ ${slug} created`);
}
