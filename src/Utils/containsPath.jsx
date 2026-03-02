

export function findPathForString(root, s) {
  if (!root) return null;
  if (!s || s.length === 0) return null;

  function dfs(node, i, pathNodes) {
    if (!node) return null;
    if (node.value !== s[i]) return null;

    const nextPath = [...pathNodes, node];

    if (i === s.length - 1) return nextPath;

    return dfs(node.left, i + 1, nextPath) || dfs(node.right, i + 1, nextPath);
  }

  return dfs(root, 0, []);
}