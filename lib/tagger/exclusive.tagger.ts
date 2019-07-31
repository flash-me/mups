import {DocType, DocPart, MarkerFnPairFunction} from '../models';

/**
 * Looks for a given text for a pair of the pattern passed as marker. When found, the content between
 * Will be excluded from furth parsing. Afterwards the content will be passed to the handler function.
 * In markdown this is known as fenced code block
 * @param part {@link DocumentPart} containing the text to parse
 * @param marker The pattern to look for
 * @param handler A function that will be called with the content for each content
 */
export function tagExclusive(part: DocPart, marker: string, handler: MarkerFnPairFunction) {
	// quick return
	if (!part || !marker || !handler) { return [part]; }

	// split into lines and get those starting with the marker
	const lines = part.value.split('\n');
	const markerLines = lines
		.map((_line, idx) => idx)
		.filter(line => lines[line].startsWith(marker));

	// quick return
	if (markerLines.length < 2) { return [part]; }

	const result: Array<DocPart> = [];
	let lineIdx = 0;

	// if we have an odd amount of marker, skip the last one
	markerLines.length % 2 && markerLines.pop();

	for (let i = 0; i < markerLines.length; i+=2) {
		// all the lines not wrapped by marker
		if (lineIdx < markerLines[i]) {
			let rawLines = lines.slice(lineIdx, markerLines[i]).join('');
			result.push({
				kind: part.kind,
				value: rawLines
			});
			// update the current line
			lineIdx = markerLines[i];
		}
		// get the params if given
		const params = lines[markerLines[i]].split(' ')[1] || '',
		      sndIdx = markerLines[i+1];

		// Get the lines between the lines with the marker and trigger callback on that content
		let exclusiveLines = lines.slice(lineIdx + 1, sndIdx).join('');
		result.push({
			kind: DocType.Section,
			value: handler(exclusiveLines, params)
		});
		lineIdx = sndIdx + 1;
	}

	// add remaining range of text
	if (lineIdx < lines.length) {
		result.push({
			kind: DocType.Raw,
			value: lines.slice(lineIdx).join('\n')
		});
	}

	return result.filter(v => !!v.value); // filter empty strings
}


