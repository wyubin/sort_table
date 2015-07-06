module.id='sort_table';
// general object extend
require('../../lib/stdlib.array.js');
require('../../lib/stdlib.HTMLElement.js');
var extend = require('util')._extend;

/**
* create(new) sortable table view without jquery.
* @constructs sort_table
* @returns {Object} this sort_table object
*/
var sort_table = function (dom,args){
	this.doms={body:dom};
	this.args = extend({
		col_hide:{},
		col_revise:{},
		th_revise:null,
		th_sort:true,
		// tr_render based on data_row and index, return doms list <tr>
		tr_render:function(tr,ind){return tr.reduce(function(a,b){
			return a.concat(document.createElement('td').append_by_array([b]));
		},[])},
		tr_click:false
	},args);
	// initial event support type
	this.events = {click:{},attached:[]};
	this.data = {};
	this.init();
};
exports.sort_table = sort_table;
/**
* init process sort_table, add class
*/
sort_table.prototype.init = function(){
	var self= this;
	this.init_view();
	// init event register
	this.events.click = {
		'tbody>tr>td':function(e){self.row_selected_handler(e)},
		'thead>tr>th>div.th-inner':function(e){self.th_sort_handler(e)}
	};
}
/**
* init view constructs
*/
sort_table.prototype.init_view = function(){
	var self = this;
	this.doms.body.append_by_array([
		{name:'div',attr:{class:'mytable_thead'}},
		{name:'div',attr:{class:'mytable_inner'},child:[
			{name:'table',child:[{name:'thead'},{name:'tbody'}]}
		]}
	]);
	['table','thead','tbody'].map(function(v,ind){
		self.doms[v] = self.doms.body.querySelector(v);
	});
}
/**
* event handler for all events listened from doms.body, events list on this.events. this.events
* @param {object} e - event object from EventListener
*/
sort_table.prototype.event_han = function(e){
	var self=this,
		t_css;
	if(e.type in self.events){
		for(t_css in self.events[e.type]){
			if(e.target.matches(t_css)){
				self.events[e.type][t_css](e);
			}
		}
	}
}
/**
* initiate view events when it renders ready
*/
sort_table.prototype.set_events = function(){
	var self = this,i;
	for(i in this.events){
		if(this.events.attached.indexOf(i) == -1){
			this.doms.body.addEventListener(i,function(e){self.event_han(e)});
			this.events.attached.push(i);
		}
	}
}
/**
* table haed render method, based on self.args.col_hide and this.args.th_revise to render the table title
*/
sort_table.prototype.thead_ren = function(){
	var self=this;
	var htmls = this.data.colnames.reduce(function(a,b,ind){
		if(self.args.col_hide[i]){
			return a;
		}else{
			return a.concat([self.args.th_revise ? self.args.th_revise(b,ind,self.data.colnames):b]);
		}
	},[]);
	// add into thead
	this.doms.thead.innerHTML = '';
	this.doms.thead.append_by_array([{name:'tr',child:htmls.map(function(v,ind){
		return {name:'th',child:[{name:'div',attr:{class:'th-inner'},child:[v]}]};
	})}]);
}
/**
* align div.inner to tbody. align extra thead and real tbody,
* first, compare thead th iterally and reset jqTableB if jqTableH th > jqTableB th.
* after reset, get jqTableB th width and apply it to jqTableH th
*/
sort_table.prototype.thead_align = function(){
	var a_th_div = Array.prototype.slice.call(this.doms.thead.querySelectorAll('div.th-inner')),
	wth,wthd;
	a_th_div.map(function(v,ind){
		wth = v.getBoundingClientRect().width;
		wthd = v.parentNode.getBoundingClientRect().width;
		if(wthd>wth){
			v.parentNode.style.width = wthd;
		}
	});
	// adjust div back?!
	a_th_div.map(function(v){
		v.style.width = v.parentNode.getBoundingClientRect().width;
	});
}
/**
* data is [[]] append to tbody based on col_revised and tr_render and append it into tbody and bind row by jquery
* @param {Array} data - data from render(this.data.data)
* @return {object} this
*/
sort_table.prototype.append_rows = function(data){
	var self =this;
	var _data = data.transpose();
	// col revise first
	var _data_rev = [];
	for(var i=0;i<_data.length;i++){
		if(!this.args.col_hide[i]){
			var t_fun = this.args.col_revise[i];
			if(t_fun){
				_data_rev.push(_data[i].reduce(function(a,b,ind){return a.concat([t_fun(b,data[ind])])},[]));
			}else{
				_data_rev.push(_data[i]);
			}
		}
	}
	// append to tbody
	this.doms.tbody.append_by_array(_data_rev.transpose().map(function(v,ind){
		return {name:'tr',attr:{'data-irow':ind},child:self.args.tr_render(v,ind)}
	}));
	this.thead_align();
	return this;
}
/**
* the real render function
* @param {Array} data - data with data and colnames keys
* @return {object} this
*/
sort_table.prototype.render = function(data){
	var self = this;
	// add sort_table class to container
	this.doms.body.classList.add('sort_table');
	this.data=data;
	this.data.ind_col_show = data.colnames.range().reduce(function(a,b,ind){return self.args.col_hide[ind] ? a : a.concat([ind])},[]);
	this.set_events();
	this.thead_ren();
	this.doms.tbody.innerHTML='';
	this.append_rows(this.data.data);
	return this;
}
/**
* the sort handler(change sort notation and trigger tr_sort)
* @param {object} e - event object from EventListener
* @return {object} this
*/
sort_table.prototype.th_sort_handler = function(e){
	// setup condition
	var cl_th_div = e.target.classList,
		a_th = Array.prototype.slice.call(this.doms.thead.querySelectorAll('th div.th-inner')),
		col_ind = a_th.indexOf(e.target);
	var ind_rev = cl_th_div.contains('up');
	// if not first click
	if(!ind_rev==cl_th_div.contains('down')){
		cl_th_div.toggle('down');
	}
	cl_th_div.toggle('up');
	// remove other th sorting mark
	a_th.map(function(v,ind){
		if(ind!=col_ind){
			v.classList.remove('up');
			v.classList.remove('down');
		}
	});
	this.tr_sort({col_ind:col_ind,reverse:ind_rev});
	return this;
}
/**
* sort tr by col_ind in normal/reverse or fn with function(tr_data), opt is array with fn(sorting function), iCol and reverse. fn with input row of aaData after that will re-sort this.row2tr and reverse if bReverse==true and then tbody will hide -> re-append tr dom -> show
* @param {object} opt - {fn:fn(dataset,data),col_ind:int,reverse:bool}
* @return {object} this
*/
sort_table.prototype.tr_sort = function(opt){
	var self=this,
		a_tr = Array.prototype.slice.call(this.doms.tbody.querySelectorAll('tr')),
		t_args = {icol:opt.col_ind},
		t_comp;
	// data sort
	a_tr.sort(function(a,b){
		t_comp = [a,b].map(function(v){
			return opt.fn ? opt.fn(extend({},{dataset:v.dataset},t_args),self.data) : self.data.data[v.dataset.irow][opt.col_ind];
		});
		return (t_comp[0]>t_comp[1] == opt.reverse) ? 1:-1;
	});
	// re render tbody
	a_tr.map(function(v){self.doms.tbody.appendChild(v)});
}
/**
* the tr selected handler(classed the tr and )
* @param {object} e - event object from EventListener
* @return {object} this
*/
sort_table.prototype.row_selected_handler = function(e){
	// classed this tr first
	e.target.parentNode.classList.toggle('selected');
	var sel_trs = Array.prototype.slice.call(this.doms.tbody.querySelectorAll('tr.selected'));
	this.row_sel_call(sel_trs.map(function(v){
		return parseInt(v.dataset.irow);
	}));
	return this;
}
/**
* default row_sel callback
* @param {Array} inds_row - index of selected rows
* @return {object} this
*/
sort_table.prototype.row_sel_call = function(inds_row){
	// log selected data
	console.log(inds_row);
	return this;
}
