import {DocType, DocPart, InlineTagHandler} from '../models';

// pattern of the inlineTags: [[tag|anyText]]
const pattern: RegExp = /\[\[[^\[\]\n\r]*?]]/g;

/** Array of functions for specific tags */
const handlers: Array<InlineTagHandler> = [];

/**
 * Looks in a given text for inlineTags that follow the pattern '[[text]]' and calls handle functions on them
 * @param part {@link DocumentPart} containing the text to parse
 */
export function tagInline(part: DocPart): Array<DocPart> {
  if (!part || part.kind === DocType.Inline) { return [part]; }

  const matches = Array.from(part.value.matchAll(pattern));
  // the final string. We will push parts to it
  const result: Array<DocPart> = [];
  // cursor that locates to current position
  let cursor = 0;

  for (let match of matches) {
    // add the range between the last position and current match
    result.push({
      value: part.value.slice(cursor, match.index),
      kind: DocType.Raw
    });

    // update position
    cursor = match.index! + match[0].length;

    // cut brackets & get params from match
    const [tag, ...params] = match[0].slice(2, match.length - 3).split('|');

    // check if a handler exists and use it
    const handler = handlers.find(h => h.tag === tag);
    const handledText = handler && handler.fn(params);

    result.push({
      kind: handledText ? DocType.Inline : part.kind,
      value: handledText || match[0]
    });
  }

  // Add the remaining string after last match
  result.push({
    value: part.value.slice(cursor),
    kind: part.kind
  });
  return result.filter(dp => !!dp.value); // filter empty strings
}

/**
 * Function to register additional handler for specific tags. Overrides existing same tags
 * @param handler {@link InlineTagHandler} containing the tag and a function
 */
export function registerInlineTagHandler(handler: InlineTagHandler) {
  const existing = handlers.find(h => h.tag === handler.tag);
  if (existing) {
    existing.fn = handler.fn;
  } else {
    handlers.push(handler);
  }
}

/**
 * {@link InlineTagHandler} for skipping evaluation. Useful if you want to have the pattern [[]] in your markup.
 */
function handleSkipTag(params: Array<string>) {
  return `[[${params.join('|')}]]`;
}

/**
 * {@link InlineTagHandler} for Anchors. First item is the link, second one the content.
 * @param params The parameter provided within the InlineTag.
 */
function handleLinkTag(params: string[]): string | undefined {
  return params.length < 2
         ? undefined
         : `<a href="${params[0]}">${params[1] || ''}</a>`;
}

/**
 * {@link InlineTagHandler} for Image. Expects the src path as the single item
 * @param params The parameter provided within the InlineTag.
 */
function handleImgTag(params: string[]): string | undefined {
  return !params[0]
         ? undefined
         : `<img src="${params[0]}"/>`;
}

registerInlineTagHandler({tag: 'a', fn: handleLinkTag});
registerInlineTagHandler({tag: 'img', fn: handleImgTag});
registerInlineTagHandler({tag: 'skip', fn: handleSkipTag});

/**
 * Tagger for Image. Expects the src path
 */
// function handleImportTag(params: string[]): string {
//   if (params.length < 2) { throw new Error(`Expected at least 2 parameter but got ${params.length}`); }
//   const [path] = params;
//   if (!fs.existsSync(path)) { throw new Error(`File to import does not exists! CWD: ${process.cwd()}.  ${path}`); }
//   return fs.readFileSync(path, {encoding: 'utf8'});
// }
