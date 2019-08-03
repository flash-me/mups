import {MarkupEngine} from './markup.engine';

MarkupEngine.BlockParamFnMap.set(undefined, content => `\n<code>${content}</code>`);
MarkupEngine.BlockParamFnMap.set('lang', content => `\n<pre>${content}</pre>`);

MarkupEngine.LineMarkerFnMap.set('#', content => `\n<h1>${content}</h1>`);
MarkupEngine.LineMarkerFnMap.set('##', content => `\n<h2>${content}</h2>`);
MarkupEngine.LineMarkerFnMap.set('###', content => `\n<h3>${content}</h3>`);

MarkupEngine.TagParamFnMap.set('img', content => `<img src="${content}"/>`);

MarkupEngine.InlineMarkerFnMap.set('**', (content: string) => `<b>${content}</b>`)
MarkupEngine.InlineMarkerFnMap.set('__', (content: string) => `<i>${content}</i>`);
MarkupEngine.InlineMarkerFnMap.set('++', (content: string) => `<sup>${content}</sup>`);

const str =
`this **++__is__++** markup
|||
this is a block
foo
|||
++this __**is** **not** a__ block
neither this aemka++
||| lang
asdlöfkaf
|||
test [[img||orosbuPicture]]
# foo
## dafka
### aemka
|||
|||`;

console.log(MarkupEngine.GetBlockParser()(str));
