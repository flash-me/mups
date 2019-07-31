import {DocType, DocPart, MarkerTagPair} from '../models';

/**
 * Looks for a given text if it contains a pair of marker and replaces them with HTML tags
 * @param parts {@link DocumentPart} containing the text to parse
 * @param markerTagPairs The markern with a specific pattern to look for
 */
export function tagSection(parts: Array<DocPart>, ...markerTagPairs: Array<MarkerTagPair>): Array<DocPart> {
	// quick return
	if (!parts.length || !markerTagPairs.length) { return parts; }

	const getKindFromMatch = (idx: number) => {
		let pos = 0;
		for (const part of parts) {
			pos += part.value.length;
			if (pos > idx) {
				return part.kind;
			}
		}
		return DocType.Raw;
	};

	// The full text
	const fullText = parts.map(p => p.value).join('');
	// the final string. We will push parts to it
	const result: Array<DocPart> = [];
	// cursor that locates to current position
	let cursor = 0;
	// All matches
	const matches = [];


	for (const {marker} of markerTagPairs) {
		matches.push(
		       ...Array.from(fullText.matchAll(new RegExp(escapeRegExp(marker), 'g')))
		);
	}
	// Quick return
	if (!matches.length || matches.length < 2) { return parts; }

	// filter out the exclusive and lines marker
	const openMatches = new Map<string, number>();
	let level = 0;
	for (let i = 0; i < matches.length; i += 2) {
		const kind = getKindFromMatch(matches[i].index!)
	}


	// Add remaining range of text
	result.push({
		value: part.content.slice(cursor),
		kind: part.kind
	});

	return result.filter(v => !!v.value);  // filter empty strings
}

/*
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 */
function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
