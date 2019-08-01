export interface DocPart {
  value: string;
  kind: DocType;
  params?: string;
}

export enum DocType {
  Raw,
  Block,
  Line,
  Inline,
  Tag
}

export interface InlineTagHandler {
  tag: string,
  fn: (params: Array<string>) => string | undefined
}

