	/* * The MIT License

Copyright (c) 2010, 2011, 2012 by Juergen Marsch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
export function NearByReturnData(){
	this.found = false;
	this.serie = null;
	this.datapoint = null;
	this.value = null;
	this.pos = null;
	this.label = null;
}
export function NearByData(){
	this.mouseX = null;
	this.mouseY = null;
	this.editActive = false;
	this.serie = null;
	this.datapoint = null;
	this.pos = null;
	this.value = null;
	this.label = null;
}
export function NearByReturn(){
	this.item = new NearByReturnData();
	this.edit = new NearByReturnData();
	this.found = function(){ return (this.item.found || this.edit.found); }
}
export function HighLighting(plot, eventHolder, findNearbyFNC, active){
	this.findNearby = findNearbyFNC;
	this.highlights = [];
	this.mouseItem = new NearByData();
	this.editMode = false;
	this.eventMode = 'replace';
	var hl = this;
	var options = plot.getOptions();
	if(options.series.editmode) hl.editMode = options.series.editmode;
	var target = $(plot.getCanvas()).parent();
	if(active && options.grid.hoverable)
	{ if(hl.eventMode=='replace')
    { eventHolder.unbind('mousemove').mousemove(onMouseMove); }
    else if (hl.eventMode=='append')
    { eventHolder.mousemove(onMouseMove); }
    else
    { eventHolder.unbind('mousemove').mousemove(onMouseMove); }
  }
	if(active && options.grid.clickable)
  { if(hl.eventMode=='replace')
    { eventHolder.unbind('click').click(onClick); }
    else if(hl.eventMode=='append')
    { eventHolder.click(onClick) ; }
    else
    { eventHolder.unbind('click').click(onClick); }
  }
	if(hl.editMode == true) target.mousedown(onMouseDown);
	function onMouseDown(e){
		var r;
		if(options.series.editmode) {
			var offset = plot.offset();
			var mouseX = parseInt(e.pageX - offset.left);
			var mouseY = parseInt(e.pageY - offset.top);
			hl.mouseItem.editActive = false;
			r = hl.findNearby(mouseX, mouseY);
			if(r.item.found == true) {
				hl.mouseItem.editActive = true;
				hl.mouseItem.serie = r.item.serie;
				hl.mouseItem.datapoint = r.item.datapoint;
				hl.mouseItem.label = r.item.label;
				hl.mouseItem.mouseX = mouseX;
				hl.mouseItem.mouseY = mouseY;
				target.mouseup(onMouseUp);
				target.unbind('mousedown');
			}
		}
	}
	function onMouseUp(e){
		var r;
		if(options.series.editmode==true && hl.mouseItem.editActive==true) {
			var offset = plot.offset();
			var mouseX = parseInt(e.pageX - offset.left);
			var mouseY = parseInt(e.pageY - offset.top);
			r = hl.findNearby(mouseX, mouseY);
			hl.mouseItem.editActive = false;
			if(r.edit.found==true)
			{	hl.mouseItem.mouseX = mouseX;
				hl.mouseItem.mouseY = mouseY;
				hl.mouseItem.value = r.edit.value;
				hl.mouseItem.pos = r.edit.pos;
			}
			plot.triggerRedrawOverlay();
			target.unbind('mouseup');
			target.mousedown(onMouseDown);
		}
		var pos = { pageX: e.pageX, pageY: e.pageY };
		target.trigger("datadrop", [pos, hl.mouseItem] );
	}
	function onMouseMove(e){ triggerClickHoverEvent('plothover', e);}
	function onClick(e){ triggerClickHoverEvent('plotclick', e);}
	function triggerClickHoverEvent(eventname, e){
		var r; var item;
		var offset = plot.offset();
		var mouseX = parseInt(e.pageX - offset.left);
		var mouseY = parseInt(e.pageY - offset.top);
		r = hl.findNearby(mouseX, mouseY);
		if(r.found()==true) {
			if(hl.mouseItem.editActive == true) {
				hl.mouseItem.mouseX = mouseX;
				hl.mouseItem.mouseY = mouseY;
				hl.mouseItem.value = r.edit.value;
				hl.mouseItem.pos = r.edit.pos;
				plot.triggerRedrawOverlay();
			}
			else {
				highlight(r);
				var pos = { pageX: e.pageX, pageY: e.pageY };
				target.trigger(eventname, [pos, r.item] );
			}
		}
		else {
			unhighlight();
		}
	}

	function highlight(nearByData){
		var i = indexOfHighlight(nearByData);
		if(i == -1){
			hl.highlights.push(nearByData);
			plot.triggerRedrawOverlay();
		}
	}
	function unhighlight(){
		hl.highlights = [];
		plot.triggerRedrawOverlay();
	}
	function indexOfHighlight(nearByData){
		for(var i = 0; i < hl.highlights.length; ++i){
			var h = hl.highlights[i];
			if (h.item.datapoint == nearByData.item.datapoint) return i;
		}
		return -1;
	}
}
