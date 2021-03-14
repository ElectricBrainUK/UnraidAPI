import { clean } from './clean';

export function processTags(tag, object) {
  tag = tag.replace('>', '');
  let tagParts = tag.split(' ');
  let open = tagParts.shift().substring(1);
  object.tags = {};
  if (tagParts && tagParts.length > 0) {
    tagParts
      .map((part) => {
        let tags = part.split('=');
        return { name: clean(tags[0]), value: clean(tags[1]) };
      })
      .forEach((tag) => {
        object.tags[tag.name] = tag.value;
      });
  }
  object.tags.html = open;
  return open;
}
