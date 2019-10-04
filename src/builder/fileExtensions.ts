const attachmentExtensions = ['.pdf', '.png', '.jpg', '.svg'];
export function isAttachment(path: string) {
  return attachmentExtensions.some(extension => path.endsWith(extension));
}

const documentExtensions = ['.md', '.wtcd'];
export function isDocument(path: string) {
  return documentExtensions.some(extension => path.endsWith(extension));
}
