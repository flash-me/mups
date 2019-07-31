import {MarkupEngine} from './markup.engine';

// MarkupEngine.InlineMarkerFnMap.set('**', (content: string) => `<b>${content}</b>`)
// MarkupEngine.InlineMarkerFnMap.set('__', (content: string) => `<i>${content}</i>`);
// MarkupEngine.InlineMarkerFnMap.set('++', (content: string) => `<sup>${content}</sup>`);


// const mu = `this **++__is__++** markup
// |||
// this is a block
// foo
// |||
// ++this __**is** **not** a__ block
// neither this aemka++
// ||| params!!!
// asdlöfkaf
// |||
// test`;

// console.log(MarkupEngine.render(mu));

const str =
`this **++__is__++** markup
|||
this is a block
foo
|||
++this __**is** **not** a__ block
neither this aemka++
||| params!!!
asdlöfkaf
|||
test
|||
|||`

// const regex = new RegExp(/\n\|\|\|( .*)?\n((.|\n)*?)\|\|\|/, 'g');

// const matches = str.matchAll(regex);

console.log(MarkupEngine.parseBlocksRegex(str, '|||'));
