import { parseTag } from './parseTag';
import { isAnyClosingTag } from './isAnyClosingTag';
import { isRemaining } from './isRemaining';

export function parseHTML(html) {
  let parsedHtml = [];
  while (isRemaining(html)) {
    let result = parseTag(
      html.substring(html.indexOf('<'), html.indexOf('>') + 1),
      html,
    );
    html = result.remaining;
    parsedHtml.push(result.contains);
    while (isAnyClosingTag(html)) {
      html = html.substring(html.indexOf('>') + 1);
    }
  }
  return parsedHtml;
}
