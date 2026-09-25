/**
 * Browser page translation (Chrome / Google Translate, Edge, etc.) replaces
 * text nodes that React rendered with <font> elements. React still holds the
 * original node, so its next DOM update can call removeChild / insertBefore
 * with a node that no longer has the expected parent. The browser then
 * throws "NotFoundError: Failed to execute 'removeChild' / 'insertBefore' on
 * 'Node'" and the whole page drops to the error screen.
 *
 * This guard makes those two calls tolerate a re-parented or detached node
 * instead of throwing. It only changes behaviour in the case that would
 * otherwise throw, so the normal DOM path is untouched.
 * See https://github.com/facebook/react/issues/11538
 */

let installed = false;

function warn(message: string, node: Node | null) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[domTranslationGuard] ${message}`, node);
  }
}

export function installDomTranslationGuard() {
  if (installed || typeof Node !== "function" || !Node.prototype) return;
  installed = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(
    this: Node,
    child: T,
  ): T {
    if (child.parentNode !== this) {
      warn("removeChild skipped: node has a different parent", child);
      // Still remove the node if it only moved deeper (e.g. into <font>),
      // so stale content does not stay on screen.
      if (child.parentNode && this.contains(child)) {
        originalRemoveChild.call(child.parentNode, child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      warn(
        "insertBefore reference moved: inserting at nearest position",
        referenceNode,
      );
      // If the reference was wrapped (still inside this node), insert before
      // the wrapper that is our direct child. If it was detached, append so
      // the new content is never lost.
      let anchor: Node | null = referenceNode;
      while (anchor && anchor.parentNode !== this) {
        anchor = anchor.parentNode;
      }
      return originalInsertBefore.call(this, newNode, anchor) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
