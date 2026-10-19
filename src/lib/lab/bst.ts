// Binary search tree operations for the visualizer. Every operation returns a new tree
// (nodes on the changed path are copied), so the UI can simply swap the root.

export interface TreeNode {
  /** Stable identity for animation; survives a value swap during two-child deletion. */
  id: number;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Levels the drawing has room for (root = level 1). */
export const MAX_LEVELS = 5;

export interface OpResult {
  root: TreeNode | null;
  /** Ids of the nodes visited, in order, for the step-by-step highlight. */
  path: number[];
  error?: string;
  /** Node the operation ended on (inserted or found). */
  targetId?: number;
}

let nextId = 1;

class TreeError extends Error {}

export function insert(root: TreeNode | null, value: number): OpResult {
  const path: number[] = [];
  let targetId: number | undefined;

  const go = (node: TreeNode | null, depth: number): TreeNode => {
    if (!node) {
      if (depth >= MAX_LEVELS) {
        throw new TreeError(`${value} would sit on level ${depth + 1}; the display holds ${MAX_LEVELS}.`);
      }
      targetId = nextId++;
      return { id: targetId, value, left: null, right: null };
    }
    path.push(node.id);
    if (value === node.value) throw new TreeError(`${value} is already in the tree.`);
    return value < node.value
      ? { ...node, left: go(node.left, depth + 1) }
      : { ...node, right: go(node.right, depth + 1) };
  };

  try {
    return { root: go(root, 0), path, targetId };
  } catch (err) {
    if (err instanceof TreeError) return { root, path, error: err.message };
    throw err;
  }
}

export function remove(root: TreeNode | null, value: number): OpResult {
  const path: number[] = [];
  let targetId: number | undefined;

  const removeMin = (node: TreeNode): TreeNode | null =>
    node.left ? { ...node, left: removeMin(node.left) } : node.right;

  const go = (node: TreeNode | null): TreeNode | null => {
    if (!node) throw new TreeError(`${value} is not in the tree.`);
    path.push(node.id);
    if (value < node.value) return { ...node, left: go(node.left) };
    if (value > node.value) return { ...node, right: go(node.right) };

    targetId = node.id;
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    // Two children: take the in-order successor's value, then delete the successor.
    let successor = node.right;
    while (successor.left) successor = successor.left;
    return { ...node, value: successor.value, right: removeMin(node.right) };
  };

  try {
    return { root: go(root), path, targetId };
  } catch (err) {
    if (err instanceof TreeError) return { root, path, error: err.message };
    throw err;
  }
}

export function search(root: TreeNode | null, value: number): OpResult {
  const path: number[] = [];
  let node = root;
  while (node) {
    path.push(node.id);
    if (value === node.value) return { root, path, targetId: node.id };
    node = value < node.value ? node.left : node.right;
  }
  return { root, path, error: `${value} is not in the tree.` };
}

export type TraversalKind = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

/** Nodes in traversal order. */
export function traverse(root: TreeNode | null, kind: TraversalKind): TreeNode[] {
  const out: TreeNode[] = [];
  if (kind === 'levelorder') {
    const queue = root ? [root] : [];
    while (queue.length) {
      const node = queue.shift()!;
      out.push(node);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return out;
  }
  const visit = (node: TreeNode | null) => {
    if (!node) return;
    if (kind === 'preorder') out.push(node);
    visit(node.left);
    if (kind === 'inorder') out.push(node);
    visit(node.right);
    if (kind === 'postorder') out.push(node);
  };
  visit(root);
  return out;
}

export function height(root: TreeNode | null): number {
  return root ? 1 + Math.max(height(root.left), height(root.right)) : 0;
}

export interface PlacedNode {
  id: number;
  value: number;
  x: number;
  y: number;
  parent: { x: number; y: number } | null;
}

/**
 * Positions by path, not by size: each level halves the horizontal offset, so inserting a node
 * never moves the nodes already drawn.
 */
export function layout(root: TreeNode | null, width: number, top: number, levelGap: number): PlacedNode[] {
  const out: PlacedNode[] = [];
  const place = (node: TreeNode | null, depth: number, x: number, parent: PlacedNode['parent']) => {
    if (!node) return;
    const y = top + depth * levelGap;
    out.push({ id: node.id, value: node.value, x, y, parent });
    const offset = width / 2 ** (depth + 2);
    place(node.left, depth + 1, x - offset, { x, y });
    place(node.right, depth + 1, x + offset, { x, y });
  };
  place(root, 0, width / 2, null);
  return out;
}
