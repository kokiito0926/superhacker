#!/usr/bin/env node

// >> $ node ./index.js list
// >> $ node ./index.js comment <id>
// >> $ node ./index.js comments <id>

import { argv } from "zx";
import { getItem, getCommentsRecursive, buildTree, listTopStories, getCommentsTree } from "./lib.js";

const command = argv._[0];
if (!command) {
	console.error(`Error: Command is required (list, comment, comments).`);
	process.exit(1);
}
// console.log(command);

const boardId = argv._[1];
const threadId = argv._[2];

if (command === "list") {
	const sortedStories = await listTopStories();
	console.log(JSON.stringify(sortedStories, null, 2));
} else if (command === "comment" || command === "item") {
	if (!boardId) {
		console.error("Error: ID is required.");
		process.exit(1);
	}

	const item = await getItem(parseInt(boardId));
	if (!item) {
		console.error(`Error: Item ${boardId} not found.`);
		process.exit(1);
	}
	console.log(JSON.stringify(item, null, 2));
} else if (command === "comments") {
	if (!boardId) {
		console.error("Error: Story/Comment ID is required.");
		process.exit(1);
	}

	const rootItem = await getItem(parseInt(boardId));
	if (!rootItem) {
		console.error(`Error: Root item ${boardId} not found.`);
		process.exit(1);
	}

	const treeObj = await getCommentsTree(boardId);
	console.log(JSON.stringify(treeObj, null, 2));
} else {
	console.error(`Error: Unknown command "${command}". Available commands: list, comment, comments.`);
	process.exit(1);
}
