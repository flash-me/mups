import {tagLine} from '../../lib/tagger/line.tagger';
import {DocType} from '../../lib/models';

const toPart = (content: string, kind: number) => ([{kind, content}]);

test('tag lines starting with tag and keep others as it is', () => {
  let lines = ['first - no tag\n'];
  lines.push('# second - with tag\n');
  lines.push('third - no tag\n');
  lines.push('# fourth - with tag\n');
  lines.push('\n');

  let marker = '#', tag = 'h';
  let part = toPart(lines.join(''), DocType.Block);

  const result = tagLine(part, {marker, tag});

  expect(result[0].value).toBe(lines[0]);
  expect(result[1].value).toBe(`<h>second - with tag</h>\n`);
  expect(result[2].value).toBe(lines[2]);
  expect(result[3].value).toBe(`<h>fourth - with tag</h>\n`);
  expect(result[4].value).toBe(`${lines[4]}\n`);
});

test('only accept raw and block content', () => {
  let lines = ['first line}\n'];
  lines.push('# second line');

  const _expect = (kind: DocType) =>
    expect(tagLine(toPart(lines.join(''), kind), {marker: '#', tag: 'h'}).length);

  _expect(DocType.Raw).toBe(2);
  _expect(DocType.Block).toBe(2);
  _expect(DocType.Line).toBe(1);
  _expect(DocType.Inline).toBe(1);
  _expect(DocType.Section).toBe(1);
});

test('pattern must be `tag-empty-content`', () => {
  let lines = ['# Correct pattern\n'];
  lines.push(' # Wrong, starts with WS\n');
  lines.push('#Wrong, not whitespace\n');

  const result = tagLine(toPart(lines.join(''), DocType.Block), {marker: '#', tag: 'h'});

  expect(result[0].value).toBe('<h>Correct pattern</h>\n');
  expect(result[1].value).toBe(`${lines[1] + lines[2]}\n`);
});
