Splittr
=======

**Splittr** is a CSS and JavaScript library that implements a very simple GUI splitter for web applicactions.  Features include:

* Resizable and collapsible panels
* Lightweight: no external libraries (no jQuery or Prototype!)
* Compatible with W3C-compliant browsers
* Customizable look and feel

Want more features?  [Fork me on Github](https://github.com/vote539/splittr)!

## Usage

First, include the JavaScript and CSS libraries.

	<script type="text/javascript" src="splittr.min.js"></script>
	<link rel="stylesheet" type="text/css" href="splittr.css">

In your HTML, use the `data-splittr` attribute.  It should be of the following format:

	direction interactive initialBreadth1 initialBreadth2 ...

where `direction` is either "horizontal" or "vertical", `interactive` is either "dynamic" (movable boundaries) or "static" (non-movable boundaries), and `initialBreadthN` is the initial width/height of the Nth panel in the splitter.

**Important:** The object containing the `data-split` attribute *must* have a defined `width` and `height`, and it must be `position: relative`, `position: absolute`, or `position: fixed`.  All child elements will become `position: absolute`.

### Making Panels Collapsible

Panels may be made "collapsible", meaning that either of the bordering splitters has a button that enables the panel to be collapsed to zero width/height.  To enable a panel to be collapsilbe, add a `data-splittr-collapsible` attribute.

## Customizing Splitters

You may customize the look and size of the splitters.

### Splitter Breadth

In JavaScript, set the `window.splittr.barBreadth` any time before you run the `window.splittr.init()` function.  It should hold a number in pixels that represents the splitter's width/height.  Default is `5`.

### Splitter Colors

In CSS, override the `.splittr-bar` selector with your own colors.  For example, to make a bright blue splitter with black arrows, you could do:

	.splittr-bar{
		background: blue;
		color: black;
	}

You may need to mark the overrides with the `!important` flag.

## Example

The following example makes a panel group with three panels stacked on top of each other with splitters in-between each one.  The first two panels have collapse handles.

	<style type="text/css">
	#panel1{ width: 300px; height: 250px; border: 1px solid black; position: relative; }
	#panel2{ background-color: #666; }
	#panel3{ background-color: #999; }
	#panel4{ background-color: #CCC; }
	</style>
	<div data-splittr="horizontal dynamic 100 50" id="panel1">
		<div data-splittr-collapsible id="panel2">
			Alpha
		</div>
		<div data-splittr-collapsible id="panel3">
			Beta
		</div>
		<div id="panel4">
			Gamma
		</div>
	</div>

## Future Improvements

Features I hope to implement (or merge a pull request) include:

* Expanding collapsed panels