import * as hljs from 'highlight.js';
import {MarkupEngine} from './markup.engine';

export const GenFunc = (tag: string,	pre: string  = '',	post: string = '') =>
	(text: string) => `${pre}<${tag}>${text}</${tag}>${post}`;

export function AddFn(
	type: 'blk' | 'ln' | 'inl' | 'inc',
	marker: any,
	tag: string,
	pre: string  = '',
	post: string = ''
) {
	const fn = GenFunc(tag, pre, post);
	switch (type) {
		case 'blk':
			MarkupEngine.BlkFns.set(marker, fn);
			break;
		case 'ln':
			MarkupEngine.LnFns.set(marker, fn);
			break;
		case 'inl':
			MarkupEngine.InlFns.set(marker, fn);
			break;
		case 'inc':
			MarkupEngine.IncFns.set(marker, fn);
			break;
	}
}

export const IncImg = (content: string) => `<img src="${content}"/>`;

export const Highlight = (content: string, lang?: string) => {
	if (lang && hljs.getLanguage(lang.split(' ')[1])) {
		try {
      const value = hljs.highlight(lang.split(' ')[1], `${content}`).value;
      return `\n${value}`;
		} catch (e) { return `[[HIGHLIGHT.JS ERROR. ${e}`}
	}
	return `\n${content}`;
};
