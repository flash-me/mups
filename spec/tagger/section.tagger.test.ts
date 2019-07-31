import {DocType} from '../../lib/models';
import {tagSection} from '../../lib/tagger/section.tagger';

test('tag all sections, singleline + multiline', () => {
	const section = `$$first marker$$ and a multine $$\nsecond marker$$`;

	const result = tagSection({kind: DocType.Raw, content: section}, '$$', 'em');

	expect(result.length).toBe(3);
	expect(result[0].value).toBe('<em>first marker</em>');
	expect(result[1].value).toBe(' and a multine ');
	expect(result[2].value).toBe('<em>\nsecond marker</em>');
});
