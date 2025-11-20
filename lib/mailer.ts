import nodemailer from "nodemailer";

export type MailOptions = {
	to: string;
	subject: string;
	html: string;
	text?: string;
	from?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
	// Return cached transporter if already created
	if (transporter) {
		return transporter;
	}

	const host = process.env.SMTP_HOST;
	const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const secure = process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465";

	if (host && port && user && pass) {
		transporter = nodemailer.createTransport({
			host,
			port,
			secure, // true for 465, false for other ports
			auth: {
				user,
				pass,
			},
			// Additional options for better compatibility
			tls: {
				// Do not fail on invalid certs (useful for self-signed)
				rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
			},
		});

		// Verify connection on startup (optional, can be removed if causing issues)
		transporter.verify((error) => {
			if (error) {
				console.warn("[mailer] SMTP connection verification failed:", error.message);
			} else {
				console.log("[mailer] SMTP server is ready to send emails");
			}
		});

		return transporter;
	}

	// Fallback: log emails to console in development if SMTP not configured
	console.warn("[mailer] SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local");
	return null;
}

export async function sendMail(options: MailOptions): Promise<{ ok: boolean; error?: string; simulated?: boolean }> {
	const from = options.from || process.env.MAIL_FROM || "noreply@monydragon.com";
	const transport = getTransport();

	if (!transport) {
		console.warn("[mailer] SMTP not configured. Email not sent. Printing instead:");
		console.warn("To:", options.to);
		console.warn("Subject:", options.subject);
		console.warn("HTML:", options.html);
		if (options.text) {
			console.warn("Text:", options.text);
		}
		return { ok: true, simulated: true };
	}

	try {
		const info = await transport.sendMail({
			from,
			to: options.to,
			subject: options.subject,
			text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML if no text provided
			html: options.html,
		});

		console.log("[mailer] Email sent successfully:", info.messageId);
		return { ok: true };
	} catch (error: any) {
		console.error("[mailer] Failed to send email:", error.message);
		return { ok: false, error: error.message };
	}
}


