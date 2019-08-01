export interface IndexedMarker {
	marker: string
	idx: number;
}

export type MarkerFunction = (content: string, param?: string) => string;

export class MarkupEngine {
	public static LineMarkerFnMap = new Map<string, MarkerFunction>();
	public static InlineMarkerFnMap = new Map<string, MarkerFunction>();
	public static BlockMarker = '|||';
	public static BlockParamFnMap = new Map<string, MarkerFunction>();

	private static _regex: RegExp;

	public static get Regex(): RegExp {
		if (!MarkupEngine._regex) {
			// Create Array from map and sanitize values
			// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
			const sanitizedMarker: Array<string> = Array.from(
				MarkupEngine.InlineMarkerFnMap.keys(),
				m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			);
			// create single regex by joining the marker
			MarkupEngine._regex = new RegExp(sanitizedMarker.join('|'), 'g');
		}
		return MarkupEngine._regex;
	}

	private constructor() { }

	public static render(fullDoc: string) {
		return MarkupEngine.ParseBlocks(MarkupEngine.ParseLines(MarkupEngine.PraseInline(MarkupEngine.PraseInline(fullDoc))));
	}

	public static ParseBlocks(text: string, parseInline: boolean = false) {
		const escapedMarker = MarkupEngine.BlockMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`\n${escapedMarker}( .*)?(\n(.|\n)*?)${escapedMarker}`, 'g');
		const matches = [...text.matchAll(regex)];

		const defaultFn = {get: () => (content: string) => `<code>${content}</code>`};

		return MarkupEngine.ProcessMatches(text, matches, defaultFn as any, parseInline);
	}

	private static ProcessMatches(text: string, matches: RegExpMatchArray[], fnMap: Map<string, MarkerFunction>, parseInline: boolean = false) {
		if (matches.length < 1) { return text; }

		let result  = '',
		    lastPos = 0;

		for (let i = 0; i < matches.length; i++) {
			let cur = matches[i];
			result += text.substring(lastPos, cur.index!);
			lastPos = cur.index! + cur[0].length;
			if (cur[2]) {
				const markerFn = fnMap.get(cur[1]);
				const strBetween = parseInline ? MarkupEngine.PraseInline(cur[2]) : cur[2];
				result += markerFn ? markerFn(strBetween) : strBetween;
				console.log('FOUND block: ', strBetween);
			}
		}
		result += text.substring(lastPos);
		return result;
	}

	public static ParseLines(text: string, parseInline: boolean = false): string {
		const sanitizedMarker: Array<string> = Array.from(
			MarkupEngine.LineMarkerFnMap.keys(),
			m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		);
		const regex = new RegExp(`\n(${sanitizedMarker.join('|')}) (.*)`, 'g');
		const matches = [...text.matchAll(regex)];

		return MarkupEngine.ProcessMatches(text, matches, MarkupEngine.LineMarkerFnMap, parseInline);
	}

	public static PraseInline(text: string) {
		return Array.from(
			MarkupEngine.InlineMarkerFnMap.keys(),
			m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		).reduce(
			(p, m) =>
				MarkupEngine.ProcessMatches(
					p,
					[...p.matchAll(new RegExp(`(${m})([\\s\\S]*?)\\1`, 'g'))],
					MarkupEngine.InlineMarkerFnMap,
					false
				),
			text
		);
	}

	// public static ParseInline(text: string) {
	// 	const matches = Array.from(text.matchAll(MarkupEngine.Regex), v => ({marker: v[0], idx: v.index!}));
	// 	return MarkupEngine.InlineText(text, matches);
	// }
	//
	// public static InlineText(text: string, matches: Array<IndexedMarker>): string {
	// 	if (matches.length < 2) { return text; }
	//
	// 	let pos    = 0,
	// 	    first  = -1,
	// 	    marker = '',
	// 	    result = text.substring(0, matches[0].idx);
	//
	// 	while (pos < matches.length) {
	// 		let curr = matches[pos];
	//
	// 		if (first === -1) {
	// 			first = curr.idx;
	// 			marker = curr.marker;
	// 			pos++;
	// 			continue;
	// 		}
	//
	// 		if (marker === curr.marker) {
	// 			let markerFn = MarkupEngine.InlineMarkerFnMap.get(marker);
	// 			let strBetween = text.substring(first + marker.length, curr.idx);
	// 			let newMatches = matches.filter(m => m.marker !== marker);
	// 			newMatches.forEach(m => m.idx = m.idx - first - marker.length);
	//
	// 			let recursedStr = MarkupEngine.InlineText(strBetween, newMatches);
	// 			result += markerFn ? markerFn(recursedStr) : recursedStr;
	// 			first = -1;
	//
	// 			if (pos + 1 !== matches.length) {
	// 				result += text.substring(curr.idx + marker.length, matches[pos + 1].idx);
	// 			}
	// 		}
	// 		pos++;
	// 	}
	//
	// 	result += text.substring(matches[pos - 1].idx + matches[pos - 1].marker.length);
	// 	return result;
	// }
}
