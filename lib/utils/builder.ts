// export class TagBuilder{
//   str = `<${this.value}`;
//
//   constructor(private value: string) { }
//
//   public withId(id: string): Tag {
//     this.str += ` id='${id}'`;
//     return this;
//   }
//
//   public withClasses(...classes: Array<string>): Tag {
//     this.str += ` class='${classes.join(' ')}'`;
//     return this;
//   }
//
//   public buildSelfClosed(): string {
//     return this.str += '/>';
//   }
//
//   public build(inner: string): string {
//     return `${this.str}>${inner}</${this.value}>`;
//   }
// }
