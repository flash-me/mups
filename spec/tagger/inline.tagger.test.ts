import {tagInline} from '../../lib/tagger/inline.tagger';
import {DocType} from '../../lib/models';

test('should replace all inlinetags with tag', () => {
  const _expect = (str: string) => expect(tagInline({kind: DocType.Raw, value: str}).map(v => v.value).join(''));

  _expect('[[]]').toBe('[[]]');

  // noinspection HtmlUnknownTarget

  _expect('[[img|foo]]').toBe('<img src="foo"/>');
  // noinspection HtmlUnknownTarget
  _expect('[[a|foo|content]]').toBe('<a href="foo">content</a>');

  // noinspection HtmlUnknownTarget
  _expect('[[[[img|foo]]]]').toBe('[[<img src="foo"/>]]');
});
