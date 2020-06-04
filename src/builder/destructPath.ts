import { basename, relative } from 'path';
import { chaptersDir } from './dirs';

function removeExtension(name: string) {
  if (name.includes('.')) {
    name = name.substr(0, name.lastIndexOf('.'));
  }
  return name;
}

// Get basic displayName, displayIndex, name, relativePath from a full path
export function destructPath(fullPath: string): {
  displayName: string,
  displayIndex: number,
  sourceRelativePath: string,
} {
  const relativePath = relative(chaptersDir, fullPath);

  if (relativePath === '') {
    // Root
    return {
      displayName: '',
      displayIndex: 0,
      sourceRelativePath: relativePath,
    };
  }

  const name = basename(relativePath);

  let displayName;
  let displayIndex;

  const separatorIndex = name.indexOf(' - ');
  if (separatorIndex === -1) {
    displayIndex = +removeExtension(name);
    displayName = `第 ${displayIndex} 章`;
  } else {
    displayIndex = +name.substr(0, separatorIndex);
    displayName = removeExtension(name.substr(separatorIndex + 3));
  }

  return {
    displayName,
    displayIndex,
    sourceRelativePath: relativePath,
  };
}
