import {MarkupEngine} from './markup.engine';
import {MarkerFnPair} from './models';

const boldHandler: MarkerFnPair = {
	marker: '**',
	fn: (content: string) => `<b>${content}</b>`
};
const cursiveHandler: MarkerFnPair = {
	marker: '__',
	fn: (content: string) => `<i>${content}</i>`
};
const supHandler: MarkerFnPair = {
	marker: '++',
	fn: (content: string) => `<sup>${content}</sup>`
};

const mue = new MarkupEngine('|||', [], [boldHandler, cursiveHandler, supHandler]);

const mu = `this **++__is__++** markup
|||
this is a block
foo
|||
++this __**is** **not** a__ block
neither this aemka++
||| params!!!
asdlöfkaf
|||
test`;

console.log(mue.render(mu));
