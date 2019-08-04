import {MarkupEngine as ME} from './markup.engine';
import {AddFn, IncImg, Highlight} from './markup.utils';

AddFn('blk', undefined, 'code', '\n');
AddFn('ln', '#', 'h1', '\n');
AddFn('ln', '##', 'h2', '\n');
AddFn('ln', '###', 'h3', '\n');
AddFn('inl', '**', 'b');
AddFn('inl', '__', 'i');
AddFn('inl', '++', 'sup');
AddFn('inl', '--', 'sub');


ME.IncFns.set('img', IncImg);
ME.BlkFns.set('lang', Highlight);

const str =
`this **++__is__++** markup
|||
this is a block
foo
|||
++this __**is** **not** a__ block
neither this aemka++
||| lang ts
const foo: number = 3;
|||
test [[img||orosbuPicture]]
# foo
## dafka
### aemka
|||
|||`;

const parser = ME.GetBlkParser();
const result = parser(str);
console.log(result);
