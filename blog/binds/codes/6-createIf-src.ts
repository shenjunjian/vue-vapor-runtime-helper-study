import { renderEffect } from "./renderEffect";
import { DynamicFragment } from "./fragment";

export function createIf(
  condition: () => any,
  b1: BlockFn,
  b2?: BlockFn,
  once?: boolean
): Block {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  resetInsertionState();

  let frag: Block;
  if (once) {
    frag = condition() ? b1() : b2 ? b2() : [];
  } else {
    frag = new DynamicFragment("if");

    renderEffect(() => frag.update(condition() ? b1 : b2));
  }

  if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);

  return frag;
}
