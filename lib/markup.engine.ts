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
	public static BlkFns = new Map<any, MarkerFunction>();
	public static LnFns = new Map<any, MarkerFunction>();
	public static IncFns = new Map<any, MarkerFunction>();
	public static InlFns = new Map<any, MarkerFunction>();
	public static BlkMrkr = '\\|\\|\\|';

	private static DefFn = (str: string) => str;

	private static GetInlRgx = (fnMap: Map<any, MarkerFunction> = MarkupEngine.InlFns) =>
		new RegExp(`(${MarkupEngine.SanMap(fnMap).join('|')})([\\s\\S]*?)\\1`, 'g');

	private static GetBlkRgx = () =>
		new RegExp(`\n${MarkupEngine.BlkMrkr}(?: (.*))?(\\n(.|\n)*?)${MarkupEngine.BlkMrkr}`, 'g');

	private static GetLnRgx = (fnMap: Map<any, MarkerFunction> = MarkupEngine.LnFns) =>
		new RegExp(`\n(${MarkupEngine.SanMap(fnMap).join('|')}) (.*)`, 'g');

	private constructor() { }

	private static ProcMatches(
		text: string,
		matches: Array<MatchedString>,
		matchFn: MarkerFunction    = MarkupEngine.DefFn,
		nonMatchFn: MarkerFunction = MarkupEngine.DefFn
	): string {
		let result  = '',
		    lastPos = 0;
		for (let cur of matches) {
			result += nonMatchFn(text.substring(lastPos, cur.index));
			lastPos = cur.index + cur.value.length;
			if (cur.inner) {result += cur.fn(matchFn(cur.inner), cur.marker);}
		}
		result += nonMatchFn(text.substring(lastPos));
		return result;
	}

	public static GetBlkParser = (
		matchFn: DefaultFn    = MarkupEngine.DefFn,
		nonMatchFn: DefaultFn = MarkupEngine.GetLnParser(),
		blkRgx: RegExp    = MarkupEngine.GetBlkRgx()
	): DefaultFn =>
		(text: string) => MarkupEngine.ProcMatches(
			text,
			MarkupEngine.GetMatches(text, blkRgx, MarkupEngine.BlkFns),
			matchFn,
			nonMatchFn
		);

	public static GetLnParser = (
		matchFn: DefaultFn = MarkupEngine.GetIncParser(),
		nonMatchFn?: DefaultFn,
		lnRgx: RegExp  = MarkupEngine.GetLnRgx()
	): DefaultFn =>
		(text: string) => MarkupEngine.ProcMatches(
			text,
			MarkupEngine.GetMatches(text, lnRgx, MarkupEngine.LnFns),
			matchFn,
			nonMatchFn || matchFn
		);

	public static GetIncParser = (
		matchFn: DefaultFn    = MarkupEngine.DefFn,
		nonMatchFn: DefaultFn = MarkupEngine.GetInlParser()
	): DefaultFn =>
		(text: string) => MarkupEngine.ProcMatches(
			text,
			MarkupEngine.GetMatches(text, new RegExp(`\\[\\[(.*)\\|\\|(.*)]]`), MarkupEngine.IncFns),
			matchFn,
			nonMatchFn
		);

	public static GetInlParser = (
		matchFn?: DefaultFn,
		nonMatchFn: DefaultFn = MarkupEngine.DefFn,
		inlRgx: RegExp   = MarkupEngine.GetInlRgx()
	): DefaultFn =>
		function inlineFn(text: string) {
			return MarkupEngine.ProcMatches(
				text,
				MarkupEngine.GetMatches(text, inlRgx, MarkupEngine.InlFns),
				matchFn || inlineFn,
				nonMatchFn
			);
		};

	private static SanMap(fnMap: Map<any, MarkerFunction>): Array<string> {
		return Array.from(fnMap.keys(), value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	}

	private static GetMatches(text: string, regex: RegExp, fnMap: Map<any, MarkerFunction>): Array<MatchedString> {
		return [...text.matchAll(regex)].map(match => ({
			index: match.index!,
			marker: match[1],
			inner: match[2],
			value: match[0],
			fn: fnMap.get((match[1] || '').split(' ')[0]) || (str => str)
		}));
	}
}
