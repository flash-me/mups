import { DocPart, DocType, IndexedMarker, MarkerFunction } from './models';

export class MarkupEngine {
  public static LineMarkerFnMap = new Map<string, MarkerFunction>();
  public static InlineMarkerFnMap = new Map<string, MarkerFunction>();
  public static BlockMarker = '|||';

  private constructor() { }

  public static render(fullDoc: string) {
    let parts = MarkupEngine.splitToParts(fullDoc);
    if (parts.length > 1) {
      parts = MarkupEngine.parseBlocks(parts, MarkupEngine.BlockMarker);
    }
    parts = MarkupEngine.parseLines(parts);
    parts = MarkupEngine.unifyRaw(parts);
    parts = MarkupEngine.ParseInline(parts);
    return parts;
  }

  public static splitToParts(fullDoc: string): Array<DocPart> {
    return fullDoc.split('\n').map(l => ({ value: l, kind: DocType.Raw }));
  }

  public static parseBlocksRegex(text: string, marker: string) {
    const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\n${escapedMarker}( .*)?\n((.|\n)*?)${escapedMarker}`, 'g');
    const matches = [...text.matchAll(regex)];

    if (matches.length < 1) { return text; }

    let result = text.substring(0, matches[0].index);

    for (let i = 0; i < matches.length; i++) {
      let cur = matches[i];
      if (i > 0) {
        let before = matches[i - 1];
        result += text.substring(before.index! + before[0].length, cur.index!);
      }
      if (cur[1]) {
        console.log('FOUND PARAMS: ', cur[1].trimLeft())
      }
      if (cur[2]) {
        result += cur[2];
        console.log('FOUND block: ', cur[2])
      }
    }

    result += text.substring(matches[matches.length - 1].length);
    return result;
  }

  public static parseBlocks(parts: Array<DocPart>, marker: string) {
    let first: number = NaN,
      result: Array<DocPart> = [];

    for (let i = 0; i < parts.length; i++) {
      let val = parts[i].value;

      if (val.startsWith(marker) && (val.charAt(marker.length) === ' ' || val.length === marker.length)) {

        if (!first) {
          result.push(parts[i]);
          first = -1;
        } else {
          const section = result.splice(first);
          const params = section.shift()!.value.split(' ', 2)[1];
          const value = section.map(p => p.value).join('\n');

          result.push({ value, params, kind: DocType.Block });
          first = NaN;
        }

      } else {
        result.push(parts[i]);
        first--;
      }
    }
    return result;
  }

  public static parseLines(parts: Array<DocPart>): Array<DocPart> {
    return parts.map(part => {
      const found = Array
        .from(MarkupEngine.LineMarkerFnMap.keys())
        .find(h => part.kind === DocType.Raw && part.value.startsWith(`${h} `));

      if (!found) { return part; }
      const strBetween = part.value.substring(found.length + 1);
      return { value: MarkupEngine.LineMarkerFnMap.get(found)!(strBetween), kind: DocType.Line };
    });
  }

  public static unifyRaw(parts: Array<DocPart>): Array<DocPart> {
    if (parts.length < 2) { return parts; }

    let result: Array<DocPart> = [];
    result.push(parts.shift()!);

    for (let part of parts) {
      let last = result[result.length - 1];
      if (part.kind === DocType.Raw &&
        last.kind === DocType.Raw) {
        last.value += `\n${part.value}`;
      } else {
        result.push(part);
      }
    }
    return result;
  }

  public static ParseInline(parts: Array<DocPart>) {
    const regex = MarkupEngine.GenRegexFromMarker(...(MarkupEngine.InlineMarkerFnMap.keys()));
    return parts.map(p => {
      if (p.kind === DocType.Block) { return p; }
      const matches = MarkupEngine.getAllMatches(p.value, regex);
      return { value: MarkupEngine.InlineText(p.value, matches), kind: p.kind };
    });
  }

  public static getAllMatches(text: string, regex: RegExp): Array<IndexedMarker> {
    return Array.from(text.matchAll(regex), v => ({ marker: v[0], idx: v.index! }));
  }

  public static GenRegexFromMarker(...marker: string[]): RegExp {
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
    const sanitizedMarker = marker.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    // create single regex by joining the marker
    return new RegExp(sanitizedMarker.join('|'), 'g');
  }

  public static InlineText(text: string, matches: Array<IndexedMarker>): string {
    if (matches.length < 2) { return text; }

    let pos = 0,
      first = -1,
      marker = '',
      result = text.substring(0, matches[0].idx);

    while (pos < matches.length) {
      let curr = matches[pos];

      if (first === -1) {
        first = curr.idx;
        marker = curr.marker;
        pos++;
        continue;
      }

      if (marker === curr.marker) {
        let fn = MarkupEngine.InlineMarkerFnMap.get(marker);
        let strBetween = text.substring(first + marker.length, curr.idx);
        let newMatches = matches.filter(m => m.marker !== marker);
        newMatches.forEach(m => m.idx = m.idx - first - marker.length);

        let recursedStr = MarkupEngine.InlineText(strBetween, newMatches);
        result += fn ? fn(recursedStr) : recursedStr;
        first = -1;

        if (pos + 1 !== matches.length) {
          result += text.substring(curr.idx + marker.length, matches[pos + 1].idx);
        }
      }
      pos++;
    }

    result += text.substring(matches[pos - 1].idx + matches[pos - 1].marker.length);
    return result;
  }
}
