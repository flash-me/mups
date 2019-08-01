import {MarkupEngine} from './markup.engine';

MarkupEngine.InlineMarkerFnMap.set('**', (content: string) => `<b>${content}</b>`)
MarkupEngine.InlineMarkerFnMap.set('__', (content: string) => `<i>${content}</i>`);
MarkupEngine.InlineMarkerFnMap.set('++', (content: string) => `<sup>${content}</sup>`);

MarkupEngine.LineMarkerFnMap.set('#', content => `<h1>${content}</h1>`);
MarkupEngine.LineMarkerFnMap.set('##', content => `<h2>${content}</h2>`);
MarkupEngine.LineMarkerFnMap.set('###', content => `<h3>${content}</h3>`);




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
# foo
## dafka
### aemka
|||
|||`

// const regex = new RegExp(/\n\|\|\|( .*)?\n((.|\n)*?)\|\|\|/, 'g');

// const matches = str.matchAll(regex);

// console.log(MarkupEngine.ParseBlocks(MarkupEngine.ParseLines(str)));
console.log(MarkupEngine.PraseInline(str));
