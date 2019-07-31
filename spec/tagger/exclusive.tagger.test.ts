import {DocType} from '../../lib/models';
import {tagExclusive} from '../../lib/tagger/exclusive.tagger';

test('should cut out all exclusive areas', () => {
	const content = '$$\nerster block\n$$\naemka\n$$ p1p2p3\nzweiter block\n$$\npfuidfadk\n$$\naköd',
	      res = tagExclusive({kind: DocType.Raw, value: content}, '$$', (content, param) => `<em>${content} | ${param}</em>`);

	console.log(res);
	expect(res.length).toBe(4);
});
