#!/usr/bin/env bun

// Bridge to the lldtdd engine for the demo's "Run" button. lldtdd is a real dependency now,
// resolved from node_modules like everything else -- the sibling-checkout era is over
// (.githooks/pre-commit made the same move). Still run as a subprocess by demo/server.js so a
// crash in parsing or translation reports as JSON instead of taking the dev server down.
//
// runDocument() would be simpler but returns only counts; the demo paints a status icon onto
// every claim line, so it needs the per-case results, which means composing the pipeline the
// way lldtdd's own runner does: parse, translate, synthesize, run.
//
// Usage: bun run devTools/lldRunner.js <path-to-file.lld.md>

const [, , targetFile] = process.argv;

/**
 *
 */
async function main() {
	if (!targetFile) {
		console.log(JSON.stringify({ error: 'usage: lldRunner.js <path-to-file.lld.md>' }));
		return;
	}

	try {
		const { parseFile, translate, synthesize, runSuite } = await import('lldtdd');

		const doc = await parseFile(targetFile);
		const translated = await translate(doc, { execute: true });
		const suite = await synthesize(translated);
		const result = await runSuite(suite);

		// An array, because lldMarkdown's resultsByDescription walks `for (const result of
		// runResult) visit(result.cases)` -- one document still arrives as a list of one.
		console.log(JSON.stringify([result]));
	} catch (error) {
		console.log(JSON.stringify({ error: error?.stack || String(error) }));
	}
}

await main();
