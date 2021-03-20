import { hasContents } from './hasContents';

export function checkContents(remaining: string, object) {
  if (hasContents(remaining)) {
    if (object.contents) {
      object.content += object.contents;
    } else {
      object.contents = remaining.substring(0, remaining.indexOf('<'));
    }
    remaining = remaining.substring(remaining.indexOf('<'));
  }
  return { remaining, object };
}
