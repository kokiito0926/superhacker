const BASE_URL = "https://hacker-news.firebaseio.com/v0";

export async function getItem(id) {
	if (!id) throw new Error("id is required");
	try {
		const res = await fetch(`${BASE_URL}/item/${id}.json`);
		if (!res.ok) {
			throw new Error(`Error fetching item ${id}: ${res.statusText}`);
		}
		return await res.json();
	} catch (error) {
		throw error;
	}
}

export async function getCommentsRecursive(ids, allComments = []) {
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

export function buildTree(list, parentId) {
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

export async function listTopStories(limit = 0) {
	const idsResponse = await fetch(`${BASE_URL}/topstories.json`);
	if (!idsResponse.ok) {
		throw new Error(`Error fetching top stories: ${idsResponse.statusText}`);
	}
	let ids = await idsResponse.json();
	if (limit > 0) ids = ids.slice(0, limit);

	const stories = await Promise.all(ids.map((id) => getItem(id)));
	const sortedStories = stories.filter((s) => s !== null).sort((a, b) => (b.score || 0) - (a.score || 0));
	return sortedStories;
}

export async function getCommentsTree(rootId) {
	if (!rootId) throw new Error("rootId is required");
	const rootItem = await getItem(parseInt(rootId));
	if (!rootItem) throw new Error(`Root item ${rootId} not found`);

	const flatComments = rootItem.kids ? await getCommentsRecursive(rootItem.kids) : [];
	const tree = buildTree(flatComments, parseInt(rootId));
	return {
		...rootItem,
		replies: tree,
	};
}
