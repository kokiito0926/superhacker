#!/usr/bin/env node

// >> $ node ./index.js list
// >> $ node ./index.js list --limit 5
// >> $ node ./index.js comment --id 2921983
// >> $ node ./index.js comments --id 8863 --format flat

import { argv } from "zx";

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

async function getItem(id) {
	if (!id) return null;
	try {
		const res = await fetch(`${BASE_URL}/item/${id}.json`);
		if (!res.ok) {
			console.error(`Error fetching item ${id}: ${res.statusText}`);
			return null;
		}
		return await res.json();
	} catch (error) {
		console.error(`Error fetching item ${id}: ${error.message}`);
		return null;
	}
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
	const map = new Map();
	for (const item of list) {
		map.set(item.id, { ...item, replies: [] });
	}

	const tree = [];
	for (const item of list) {
		if (item.parent === parentId) {
			tree.push(map.get(item.id));
		} else {
			const parent = map.get(item.parent);
			if (parent) {
				parent.replies.push(map.get(item.id));
			}
		}
	}
	return tree;
}

const command = argv._[0];
if (!command) {
	console.error(`Error: Command is required (list, comment, comments).`);
	process.exit(1);
}
// console.log(command);

const id = argv?.id ? parseInt(argv.id) : null;
const limit = argv?.limit ? parseInt(argv?.limit) : null;
const flat = argv?.format ? argv?.format === "flat" : false;

if (command === "list") {
	const idsResponse = await fetch(`${BASE_URL}/topstories.json`);
	if (!idsResponse.ok) {
		console.error(`Error fetching top stories: ${idsResponse.statusText}`);
		process.exit(1);
	}
	let ids = await idsResponse.json();

	if (limit > 0) {
		ids = ids.slice(0, limit);
	}

	const stories = await Promise.all(ids.map((id) => getItem(id)));
	const sortedStories = stories
		.filter((s) => s !== null)
		.sort((a, b) => (b.score || 0) - (a.score || 0));

	console.log(JSON.stringify(sortedStories, null, 2));
} else if (command === "comment" || command === "item") {
	if (!id) {
		console.error("Error: ID is required via --id.");
		process.exit(1);
	}
	const item = await getItem(id);
	if (!item) {
		console.error(`Error: Item ${id} not found.`);
		process.exit(1);
	}
	console.log(JSON.stringify(item, null, 2));
} else if (command === "comments") {
	if (!id) {
		console.error("Error: Story/Comment ID is required via --id.");
		process.exit(1);
	}

	const rootItem = await getItem(id);
	if (!rootItem) {
		console.error(`Error: Root item ${id} not found.`);
		process.exit(1);
	}

	const flatComments = rootItem.kids ? await getCommentsRecursive(rootItem.kids) : [];
	// console.log(flatComments);

	if (flat) {
		console.log(JSON.stringify([rootItem, ...flatComments], null, 2));
	} else {
		const tree = buildTree(flatComments, id);
		console.log(
			JSON.stringify(
				{
					...rootItem,
					replies: tree,
				},
				null,
				2,
			),
		);
	}
} else {
	console.error(`Error: Unknown command "${command}". Available commands: list, comment, comments.`);
	process.exit(1);
}
