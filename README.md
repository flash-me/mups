# <div align='center'>Doctrine</div>
## <div align='center'>A highly customizable markup parser</div>

### **Another parser? Why just not use markdown?**

This might a valid question at first. But didn't you ever found yourself bothering in following situation:
- You start writing your documentation / article / whatever in one of the standard tools like Markdown / Asciidoc etc. and after a while you want to do something specific, but it's just not possible and you start bothering about it?
- In case you are a developer, you start to look into that parsing engine expecting that you may extend it with some features you desperately need or want. After spending some time, you realize the whole concept of that parser is really complex, just to fullfill some specifications, that actually noone or a verly low percentage of people would actually need?
- You really hate some keywords and want to customize it yourself easily without getting into development. For example you don't want to `*` being used for *italic font* and `**` for **bold font**?

If you recognise any of these situations or if you are just curious about the capabilities of this parser, please continue!

### **What is so special about doctrine?**

- Well, the actual core part, `the parsing engine` is written in under 150 lines!<br>
- It is written in `TypeScript`!
- The only dependencies so far are typescript and highlight.js!
- You can **completely** define yourself, how to parse specific keywords or just leave them out if you don't want to.<br>
- You don't have to get into a lot of documentation or code in order to extend the functionalities.

The most basic form you need is:
- A **Marker**: the keyword the parser should catch. This can be any form of a string. Something like `**`, `!!`, or maybe `°°°`? It doesn't matter. Even a pattern like `!"§$%&' is possible. It's completely up to you.
- A **Callback**: This callback will retrieve the **content** and optionally a second argument **params**. Both of them are strings. And all you need to do is to return another string as the result!

Example:
For the **Marker** we want use `$$` and the content should be transformed to a div with a specific class: <br>
 ```ts
 (content: string) => `<div class='myCustomClass'>${content}</div>`
 ```
 And thats it! Now when you are going to use `$$` in your document, `Doctrine` will catch the marker and transform the content:
 ```
 This is not just another $$markdown$$ parser.

 Result ->

 This is not just another <div class'myCustomClass'>markdown</div>
 ```

### **What is the magic behind?**

Doctrine
