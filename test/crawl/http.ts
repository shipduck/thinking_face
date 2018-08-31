import "mocha";
import { assert } from "chai";
import express from "express";
import { createServer } from "http";

import { crawlHttp, appendSession } from "../../src/crawl/http";

function createHttpServer() {
	const app = express();
	const server = createServer(app).listen();

	const address = server.address();

	if (typeof address === "string") {
		server.close();
		throw new Error("failed to create server with port");
	}

	after(() => {
		console.log("aaa");
		server.close();
	});

	app.listen(server);

	return Object.assign(app, {
		port: address.port,
		server,
	});
}

describe("crawl/http", () => {
	it("basic", done => {
		const server = createHttpServer();

		server.get("/", () => {
			done();
		});

		crawlHttp({
			url: `http://127.0.0.1:${server.port}/`,
			method: "GET",
		});
	});

	it("session", () => {
		const headers: string[] = [];
		appendSession(headers, {
			headers: {
				Auth: "test_auth"
			}
		});

		assert.include(headers, "Auth: test_auth");
	});
});
