#!/usr/bin/env node

// >> $ node ./index.js list
// >> $ node ./index.js list --limit 5
// >> $ node ./index.js comment --id 2921983
// >> $ node ./index.js comments --id 8863 --format flat

import { minimist, argv } from "zx";

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

async function getItem(id) {
	if (!id) return null;
	const res = await fetch(`${BASE_URL}/item/${id}.json`);
	return res.json();
}

async function getCommentsRecursive(ids, allComments = []) {
	if (!ids || ids.length === 0) return allComments;

	const comments = await Promise.all(ids.map((id) => getItem(id)));

	for (const comment of comments) {
		if (comment && !comment.deleted) {
			allComments.push(comment);
			if (comment.kids) {
				await getCommentsRecursive(comment.kids, allComments);
			}
		}
	}
	return allComments;
}

function buildTree(list, parentId) {
	return list
		.filter((item) => item.parent === parentId)
		.map((item) => ({
			...item,
			replies: buildTree(list, item.id),
		}));
}

const command = argv._[0];
if (!command) {
	console.error(`Error: Command is required.`);
	process.exit(1);
}
// console.log(command);

const args = minimist(process.argv.slice(2));
const id = args.id;
const limit = args.limit ? parseInt(args.limit) : null;
const flat = args.format ? args.format === "flat" : false;

if (command === "list") {
	try {
		const idsResponse = await fetch(`${BASE_URL}/topstories.json`);
		let ids = await idsResponse.json();

		if (limit > 0) {
			ids = ids.slice(0, limit);
		}

		const stories = await Promise.all(ids.map((id) => getItem(id)));
		const sortedStories = stories.sort((a, b) => b.score - a.score);

		console.log(JSON.stringify(sortedStories, null, 2));
	} catch (e) {
		console.error(`Error fetching list: ${e.message}`);
		process.exit(1);
	}
} else if (command === "comment") {
	if (!id) {
		console.error("Error: ID is required via --id or stdin.");
		process.exit(1);
	}
	const item = await getItem(id);
	console.log(JSON.stringify(item, null, 2));
} else if (command === "comments") {
	if (!id) {
		console.error("Error: Story ID is required.");
		process.exit(1);
	}

	try {
		const rootItem = await getItem(id);
		if (!rootItem) {
			console.log(JSON.stringify([]));
			process.exit(0);
		}

		const flatComments = rootItem.kids ? await getCommentsRecursive(rootItem.kids) : [];
		// console.log(flatComments);

		if (flat) {
			console.log(JSON.stringify([rootItem, ...flatComments], null, 2));
		} else {
			console.log(
				JSON.stringify(
					{
						...rootItem,
						replies: buildTree(flatComments, parseInt(id)),
					},
					null,
					2,
				),
			);
		}
	} catch (e) {
		console.error(`Error fetching comments: ${e.message}`);
		process.exit(1);
	}
}
