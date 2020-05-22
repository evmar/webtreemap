# webtreemap

> **New 2017-Oct-16**: master is now webtreemap v2, a complete rewrite with
> bug fixes, more features, and a different (simpler) API. If you're looking
> for the old webtreemap, see the [v1] branch.

[v1]: https://github.com/evmar/webtreemap/tree/v1

A simple treemap implementation using web technologies (DOM nodes, CSS styling
and transitions) rather than a big canvas/svg/plugin. It's usable as a library
as part of a larger web app, but it also includes a command-line app that dumps
a self-contained HTML file that displays a map.

Play with a [demo].

[demo]: http://evmar.github.io/webtreemap/

## Usage

### Web

The data format is a tree of `Node`, where each node is an object in the shape
described at the top of [tree.ts].

[tree.ts]: https://github.com/evmar/webtreemap/blob/master/src/tree.ts

```html
<script src='webtreemap.js'></script>
<script>
// Container must have its own width/height.
const container = document.getElementById('myContainer');
// See typings for full API definition.
webtreemap.render(container, data, options);
```

#### Options
| Option | Type | Default |
| ------------- |:-------------:| -----:|
| padding | [number, number, number, number] | [14, 3, 3, 3] | 
| lowerBound | number |  0.1 | 
| applyMutations | (node: Node) => void | () => void | 
| caption | (node: Node) => string | (node) => node.id || '') | 
| showNode | (node: Node, width: number, height: number) => boolean | (_, width, height) => (width > 20) && (height >= options.padding[0]) | 
| showChildren | (node: Node, width: number, height: number) => boolean  |  (_, width, height) => (width > 40) && (height > 40) | 


| Option | Description |
| ------------- |:-------------:|
| padding | In order: padding-top, padding-right, padding-bottom, padding-left of each node
| lowerBound | Lower bound of ratio that determines how many children can be displayed inside of a node. Example with a lower bound of 0.1: the total area taken up by displaying child nodes of any given node cannot be less than 10% of the area of its parent node. 
| applyMutations | A function that exposes a node as an argument after it's dom element has been assigned. Use this to add inline styles and classes. Example: (node) => { node.dom.style.color = 'blue' }
| caption | A function that takes a node as an argument and returns a string that is used to display as the caption for the node passed in.
| showNode | A function that takes a node, its width, and its height, and returns a boolean that determines if that node should be displayed. Fires after showChildren.
| showChildren | A function that takes a node, its width, and its height, and returns a boolean that determines if that node's children should be displayed. Fires before showNode.


### Command line

Install globally and run with

```sh
$ npm i -g webtreemap
$ webtreemap -o output_file < my_data
```

Or install locally run with:

```sh
$ npm i webtreemap
$ ./node_modules/.bin/webtreemap -o output_file < my_data
```

Input data format is space-separated lines of "size path", where size
is a number and path is a '/'-delimited path. For example:

```sh
$ cat my_data
100 all
50 all/thing1
25 all/thing2
```

This is exactly the output produced by `du`, so this works:

```sh
$ du -ab some_path | webtreemap -o out.html
```

But note that there's nothing file-system-specific about the data format -- it
just uses slash as a nesting delimiter.

## Development

The modules of webtreemap can be used both from the web and from the command
line, so the build has two layers. The command line app embeds the output
of the build into its output so it's a bit confusing.

To build everything, run `yarn run build`.

### Build layout

To hack on webtreemap, the pieces of the build are:

1.  `yarn run tsc` builds all the `.ts` files;
2.  `yarn run webpack` builds the UMD web version from JS of the above.

Because command line embeds the web version in its output, you need to
run step 2 before running the output of step 1. Also note we
intentionally don't use webpack's ts-loader because we want the
TypeScript output for the command-line app.

### Command line app

Use `yarn run tsc -w` to keep the npm-compatible JS up to date, then run e.g.:

```sh
$ du -ab node_modules/ | node build/src/cli.js --title 'node_modules usage' -o demo.html
```

## License

webtreemap is licensed under the Apache License v2.0. See `LICENSE.txt` for the
complete license text.
