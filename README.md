# sort_table.js
## Introduction
A lightweight library for html table generator.

The [Demo][] page

## Requirements
No.

And you need to require css and js of sort_table when you use it in browser.

	<script src="sort_table.min.js"></script>
	<link rel="stylesheet" type="text/css" href="sort_table.min.css">

## Usage
### Create a plot
1. set up a html container for table plot.(like a div with a *"sort_table"* id)

		<div id="sort_table" style="width:400;height:400"></div>
2. render it with colnames including titles and data inclucding data

		tab_view = new sort_table(document.querySelector('#sort_table'));
		tab_view.render({colnames:['t1','t2'],data:[['td11','td12'],['td21','td22']]});

## Change logs
* 0.0.1

	Initiate the project and a base function

[demo]:	http://wyubin.github.io/sort_table/
