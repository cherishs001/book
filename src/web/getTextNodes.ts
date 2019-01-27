export function getTextNodes(parent: HTMLElement, initArray?: Array<Text>) {
  const textNodes: Array<Text> = initArray || [];
  let pointer: Node | null = parent.firstChild;
  while (pointer !== null) {
    if (pointer instanceof HTMLElement) {
      getTextNodes(pointer, textNodes);
    }
    if (pointer instanceof Text) {
      textNodes.push(pointer);
    }
    pointer = pointer.nextSibling;
  }
  return textNodes;
}
