# webtreemap CLI

No frills treemap visualization from the command line. Includes built-in facilities for
visualizing space using on disk or in a JSON file, but the simple input format makes it
easy to create a treemap visualization of anything you like.

See a demo of what the visualization looks like [here][demo].

## Usage

Install with

    npm install -g webtreemap-cli

Then run with:

    treemap < my_data

Input data format is whitespace-separated lines of `size path`, where size
is a number and path is a '/'-delimited path. For example:

    $ cat my_data
    100 all
    50 all/thing1
    25 all/thing2

If the number is omitted, it is assumed to be `1`. This lets you visualize the number of
files in each directory using the `find` command, for example:

    find . -type f | treemap

Note that there's nothing file-system-specific about the data format -- it
just uses slash as a nesting delimiter.

## Special inputs

The previous section described the general input format. The `treemap` binary also includes
subcommands for a few specific use cases that come up frequently in practice.

### Disk usage of a directory

i.e. "why is node_modules so big!?"

    treemap du node_modules

### Space used in a JSON file

JSON is ubiquitous, but it's not known for making efficient use of space. You can visualize
why a JSON file is large using the `du:json` subcommand:

    treemap du:json file.json

For a [GeoJSON] file, for example, this can tell you whether feature geometries or properties
are using more bytes. If it's geometries, then [TopoJSON] might be helpful. If it's properties,
then you'll need to think more about how you're structuring your data.

### Space used in a source map

See [source-map-explorer].

## Options

<dl>
  <dt>`-f, --format [format]`</dt>
  <dd>Set the output format. By default this is HTML. You may also output JSON or text, which produces a format that may be fed back into `treemap`. This is useful if you want to use one of the special inputs but edit the results before visualization.</dd>

  <dt>`-o, --output [path]`</dt>
  <dd>Output to a file rather than opening a web browser or printing to stdout (depending on the output format). If `-o` is specified but not `-f`, then the output format will be set based on the output file name's extension.</dd>

  <dt>`--title [string]`</dt>
  <dd>Set the page title for HTML output</dd>
</dl>

## Development

Run:

    yarn build
    yarn demo

Develop:

    yarn watch
    yarn demo

Format code:

    yarn fmt

## Credits

This was forked from [evmar/treemap], which is [no longer actively maintained][evmar#37].
This is the same visualization used in [source-map-explorer].

## License

webtreemap is licensed under the Apache License v2.0. See `LICENSE.txt` for the
complete license text.

[demo]: http://evmar.github.io/webtreemap/
[evmar/treemap]: https://github.com/evmar/webtreemap
[source-map-explorer]: https://github.com/danvk/source-map-explorer
[evmar#37]: https://github.com/evmar/webtreemap/issues/37
[geojson]: https://geojson.org
[topojson]: https://github.com/topojson/topojson
