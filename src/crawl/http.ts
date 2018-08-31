import fetch from "node-fetch";
import { ISession } from "./session";
import FormData from "form-data";
import URL from "url";

export interface Options {
	url: string;
	method: "GET" | "POST",
	params?: {[key: string]: string};
	session?: ISession;
}

export function appendSession(headers: string[], session: ISession) {
	if (session.headers) {
		for (const key of Object.keys(session.headers)) {
			headers.push(`${key}: ${session.headers[key]}`);
		}
	}
	if (session.cookies) {
		const cookies: string[] = [];
		for (const key of Object.keys(session.cookies)) {
			cookies.push(`${key}=${session.cookies[key]}`);
		}
		headers.push(`Cookie: ${cookies.join(";")}`);
	}
}

export async function crawlHttp(options: Options) {
	const url = URL.parse(options.url);
	let form: FormData | undefined;
	const { params } = options;
	if (params) {
		if (options.method === "POST") {
			form = new FormData();
			for (const key of Object.keys(params)) {
				form.append(key, params[key]);
			}
		}
		else {
			url.query = [
				url.query,
				...Object.keys(
					params
				).map(
					key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
				)
			].join("&");
		}
	}

	const headers: string[] = [];
	if (form) {
		headers.push(`Content-Length: ${form.getLengthSync()}`);
	}
	if (options.session) {
		appendSession(headers, options.session);
	}

	return fetch(URL.format(url), {
		method: options.method,
		headers,
		body: form,
	});
}
