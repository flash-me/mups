export type MarkerFunction = (content: string, param?: string) => string;
export type DefaultFn = (str: string) => string;

export interface MatchedString {
	value: string;
	inner: string;
	marker: string;
	index: number;
	fn: MarkerFunction;
}

export class MarkupEngine {
	public static BlockParamFnMap = new Map<any, MarkerFunction>();
	public static LineMarkerFnMap = new Map<any, MarkerFunction>();
	public static TagParamFnMap = new Map<any, MarkerFunction>();
	public static InlineMarkerFnMap = new Map<any, MarkerFunction>();
	public static BlockMarker = '\\|\\|\\|';

	private constructor() { }

	private static ProcessMatches(
		text: string,
		matches: Array<MatchedString>,
		matchFn: MarkerFunction    = str => str,
		nonMatchFn: MarkerFunction = str => str
	): string {
		let result  = '',
		    lastPos = 0;
		for (let cur of matches) {
			result += nonMatchFn(text.substring(lastPos, cur.index));
			lastPos = cur.index + cur.value.length;
			if (cur.inner) {result += cur.fn(matchFn(cur.inner));}
		}
		result += nonMatchFn(text.substring(lastPos));
		return result;
	}

	public static GetBlockParser(): DefaultFn {
		const blockMarker = MarkupEngine.BlockMarker;
		const blockRegex = new RegExp(`\n${blockMarker}(?: (.*))?(\n(.|\n)*?)${blockMarker}`, 'g');
		const inlineParser = MarkupEngine.GetInlineParser();
		return (text: string) => MarkupEngine.ProcessMatches(
			text,
			MarkupEngine.GetMatches(text, blockRegex, MarkupEngine.BlockParamFnMap),
			str => str,
			MarkupEngine.GetLineParser(inlineParser)
		);
	}

	public static GetLineParser(inlineFn?: DefaultFn): DefaultFn {
		const lineMarkers = MarkupEngine.SanitizeMap(MarkupEngine.LineMarkerFnMap).join('|');
		const lineRegex = new RegExp(`\n(${lineMarkers}) (.*)`, 'g');
		const inlineParser: DefaultFn = inlineFn || MarkupEngine.GetInlineParser();
		const tagParser = MarkupEngine.GetTagParser(inlineParser);
		return (text: string) => MarkupEngine.ProcessMatches(
			text,
			MarkupEngine.GetMatches(text, lineRegex, MarkupEngine.LineMarkerFnMap),
			tagParser,
			tagParser
		);
	}

	public static GetTagParser(inlineFn?: DefaultFn): DefaultFn {
		const tagRegex = new RegExp(`\\[\\[(.*)\\|\\|(.*)]]`);
		const inlineParser = inlineFn || MarkupEngine.GetInlineParser();
		return (text: string) => MarkupEngine.ProcessMatches(
			text,
			MarkupEngine.GetMatches(text, tagRegex, MarkupEngine.TagParamFnMap),
			str => str,
			inlineParser
		)
	}

	public static GetInlineParser(): DefaultFn {
		const inlineMarkers = MarkupEngine.SanitizeMap(MarkupEngine.InlineMarkerFnMap);
		const inlineRegex = new RegExp(`(${inlineMarkers.join('|')})([\\s\\S]*?)\\1`, 'g');
		const inlineFn = (text: string) => MarkupEngine.ProcessMatches(
			text,
			MarkupEngine.GetMatches(text, inlineRegex, MarkupEngine.InlineMarkerFnMap),
			inlineFn
		);
		return inlineFn;
	}

	private static SanitizeMap(fnMap: Map<any, MarkerFunction>): Array<string> {
		return Array.from(fnMap.keys(), value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	}

	private static GetMatches(text: string, regex: RegExp, fnMap: Map<any, MarkerFunction>): Array<MatchedString> {
		return [...text.matchAll(regex)].map(match => ({
			index: match.index!,
			marker: match[1],
			inner: match[2],
			value: match[0],
			fn: fnMap.get(match[1]) || (str => str)
		}));
	}
}
