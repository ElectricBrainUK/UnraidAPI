import { isRemaining } from './isRemaining';
import { hasChildren } from './hasChildren';
import { checkContents } from './checkContents';
import { isClosingTag } from './isClosingTag';
import { processTags } from './processTags';

export function parseTag(tag, remaining) {
  remaining = remaining.replace(tag, '');
  let object = {};
  const open = processTags(tag, object);

  if (!isClosingTag(remaining, open) && isRemaining(remaining)) {
    let result = {
      contains: [],
      remaining: 0,
    };

    let contentCheck = checkContents(remaining, object);
    remaining = contentCheck.remaining;
    object = contentCheck.object;
    while (hasChildren(remaining)) {
      if (remaining.indexOf('<img') === 0) {
        let img = {};
        processTags(
          remaining.substring(
            remaining.indexOf('<'),
            remaining.indexOf('>') + 1,
          ),
          img,
        );
        result.contains.push(img);
        remaining = remaining.substring(remaining.indexOf('>') + 1);
        continue;
      }
      let child = parseTag(
        remaining.substring(remaining.indexOf('<'), remaining.indexOf('>') + 1),
        remaining,
      );
      result.contains.push(child.contains);
      remaining = child.remaining;
      let contentCheck = checkContents(remaining, object);
      remaining = contentCheck.remaining;
      object = contentCheck.object;
    }
    if (result.remaining) {
      remaining = result.remaining;
    }
    object.children = result.contains;
  }
  if (isRemaining(remaining) && isClosingTag(remaining, open)) {
    let contentCheck = checkContents(remaining, object);
    remaining = contentCheck.remaining;
    object = contentCheck.object;
    remaining = remaining.substring(remaining.indexOf('>') + 1);
  }
  if (!isRemaining(remaining)) {
    remaining = '';
  }
  return { contains: object, remaining };
}
