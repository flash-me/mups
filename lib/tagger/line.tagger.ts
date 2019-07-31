import {DocType, DocPart, MarkerTagPair} from '../models';

export function tagLine(parts: Array<DocPart>, ...markerTagPairs: Array<MarkerTagPair>): Array<DocPart> {
	// quick return
	if (!parts.length || !markerTagPairs.length) { return parts; }

	/**
	 * Returns the used marker if available
	 * @param line The line to check
	 */
	const isTaggedLine = (line: string) =>
		markerTagPairs.find(({marker}) =>
			line.startsWith(marker) && line.charAt(marker.length) === ' ');

	const handledLines: Array<DocPart> = [];

	for (const part of parts) {

		// only process raw or block parts
		if (part.kind !== DocType.Raw && part.kind !== DocType.Block) {
			handledLines.push(part);
			continue;
		}

		// Split that part into lines
		const lines = part.value.split('\n');

		for (const line of lines) {
			const pair = isTaggedLine(line);
			if (pair) {
				handledLines.push({
					kind: DocType.Line,
					value: `<${pair.tag}>${line.substring(pair.marker.length + 1)}</${pair.tag}>\n`
				});
			} else {
				// If the current AND previous lines were non-taggedLines, merge them
				const previousLine = handledLines.slice(-1)[0],
				      str          = `${line}\n`;
				if (previousLine && previousLine.kind !== DocType.Line) {
					previousLine.value += str;
				} else {
					// Otherwise, just add another part
					handledLines.push({
						kind: part.kind,
						value: str
					});
				}
			}
		}
	}

	return handledLines;
}
