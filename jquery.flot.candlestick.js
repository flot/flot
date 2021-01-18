/*
 * The MIT License

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
/*
Flot plugin for Candlestick data sets

  series: {
    candlestick: { active: false,
             show: false,
             barHeight: 2
    }
  }
data: [

  $.plot($("#placeholder"), [{ data: [ ... ], candlestick:{show: true} }])

*/
(function ($) {
	function NearByReturnData(){
		this.found = false;
		this.serie = null;
		this.datapoint = null;
		this.value = null;
		this.pos = null;
		this.label = null;
	}
	function NearByData(){
		this.mouseX = null;
		this.mouseY = null;
		this.editActive = false;
		this.serie = null;
		this.datapoint = null;
		this.pos = null;
		this.value = null;
		this.label = null;
	}
	function NearByReturn(){
		this.item = new NearByReturnData();
		this.edit = new NearByReturnData();
		this.found = function(){ return (this.item.found || this.edit.found); }
	}
	function HighLighting(plot, eventHolder, findNearbyFNC, active){
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

	var options = {
		series: {
			candlestick: {
				active: false
				,show: false
				,rangeWidth: 4
				,rangeColor: "rgb(0,128,128)"
				,upColor: "rgb(255,0,0)"
				,downColor: "rgb(0,255,0)"
				,neutralColor: "rgb(0,0,0)"
				,bodyWidth: "80%"
				,highlight: { opacity: 0.5 }
                ,ohlc: 0
			}
		}
	};
	function init(plot) {
		var data = null, canvas = null, target = null, axes = null, offset = null, hl = null,candlestick;
		var processed = false;
		plot.hooks.processOptions.push(processOptions);

		function processOptions(plot,options){
			if (options.series.candlestick.active){
			  options.legend.show = false;
				plot.hooks.draw.push(draw);
				plot.hooks.bindEvents.push(bindEvents);
				plot.hooks.drawOverlay.push(drawOverlay);
			}
		}
		function draw(plot, ctx){
			var series,w;
			canvas = plot.getCanvas();
			target = $(canvas).parent();
			axes = plot.getAxes();
			offset = plot.getPlotOffset();
			data = plot.getData();
			candlestick = data[0].candlestick;
			if (isNaN(candlestick.bodyWidth)) {
				var wx = Number.NEGATIVE_INFINITY;
				for(var i = 1; i < (data[0].data.length - 1); i++){
					wx = Math.max(wx, Math.abs(data[0].data[i][0] - data[0].data[i - 1][0]));
					w = parseFloat(candlestick.bodyWidth) * wx / 100;
					w = axes.xaxis.p2c(data[0].xaxis.min + w);
					candlestick.bodysize = w;
				}
			}
			else{ w = candlestick.bodyWidth;}
			for(var i = 0; i < data[0].data.length; i++){drawData(ctx,i,w);}
		}
		function drawData(ctx,i,w){
			var d = {x: data[0].data[i][0],start: data[0].data[i][1], end: data[1].data[i][1]
				, max: data[2].data[i][1], min: data[3].data[i][1]};
			drawDataRange(ctx,d);
			drawDataBody(ctx,d,w);
		}
		function drawDataRange(ctx,d){
			var x,y1,y2;
			x = offset.left + axes.xaxis.p2c(d.x);
			y1 = offset.top + axes.yaxis.p2c(d.min);
			y2 = offset.top + axes.yaxis.p2c(d.max);
			ctx.lineWidth = candlestick.rangeWidth;
			ctx.beginPath();
			ctx.strokeStyle = candlestick.rangeColor;
			ctx.moveTo(x,y1);
			ctx.lineTo(x,y2);
			ctx.stroke();
		}
		function drawDataBody(ctx,d,w){
			var x,y1,y2,c;
      x = offset.left + axes.xaxis.p2c(d.x - w / 2);
      y1 = offset.top + axes.yaxis.p2c(d.start);
      y2 = offset.top + axes.yaxis.p2c(d.end);

      if(candlestick.ohlc == 0){
          if(d.start > d.end) c = candlestick.upColor; else c = candlestick.downColor;
          if(d.start == d.end){
              c = candlestick.neutralColor;
              y2 = y1 + 2;
          }
          ctx.beginPath();
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.moveTo(x,y1);
          ctx.lineTo(x,y2);
          ctx.stroke();

          ctx.strokeStyle = '#000';
          ctx.lineWidth = '1';
          ctx.strokeRect(x-(w/2),y1, w, y2-y1);
      } else if (candlestick.ohlc == 1) {

          c = candlestick.neutralColor;

          ctx.beginPath();
          ctx.strokeStyle = c;
          ctx.lineWidth = 1;
          ctx.moveTo(x,y1);
          ctx.lineTo(x-w,y1);
          ctx.stroke();

          ctx.moveTo(x,y2);
          ctx.lineTo(x+w,y2);
          ctx.stroke();
      }
		}
		function bindEvents(plot, eventHolder){
			var r = null;
			var options = plot.getOptions();
			hl = new HighLighting(plot, eventHolder, findNearby, options.series.candlestick.active)
		}
		function findNearby(mousex, mousey){
			var series, r;
			axes = plot.getAxes();
			data = plot.getData()
			r = new NearByReturn();
			r.item = findNearByItem(mousex,mousey);
			return r;
			function findNearByItem(mousex,mousey){
				var r = new NearByReturnData();
				series = data[0];
				for (var j = 0; j < series.data.length; j++) {
					if (series.candlestick.show) {
						var dx = axes.xaxis.p2c(data[0].data[j][0]);
						var d1 = dx - series.candlestick.bodysize / 2;
						var d2 = dx + series.candlestick.bodysize / 2;
						if (mousex > d1 && mousex < d2) { r = CreateNearBy(0,j); };
					}
				}
				return r;
			}
			function CreateNearBy(i,j){
				var r = new NearByReturnData();
				r.found = true;
				r.serie = i;
				r.datapoint = j;
				r.label = data[0].data[j][0];
				r.value = [data[0].data[j][1],data[1].data[j][1],data[2].data[j][1],data[3].data[j][1]];
				return r;
			}
		}
		function drawOverlay(plot, octx){
			octx.save();
			octx.clearRect(0, 0, target.width(), target.height());
			for (i = 0; i < hl.highlights.length; ++i) {drawHighlight(hl.highlights[i]);}
			octx.restore();
			function drawHighlight(item){
				var s = data[item.item.serie];
				var c = "rgba(255, 255, 255, " + s.candlestick.highlight.opacity + ")";
				var x = offset.left + s.xaxis.p2c(item.item.label - s.candlestick.bodysize / 2);
				var y1 = offset.top + s.yaxis.p2c(s.yaxis.datamin);
				var y2 = offset.top + s.yaxis.p2c(s.yaxis.datamax);
				octx.beginPath();
				octx.strokeStyle = c;
				octx.lineWidth = s.candlestick.bodysize;
				octx.moveTo(x,y1);
				octx.lineTo(x,y2);
				octx.stroke();
			}
		}
	}
	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'candlestick',
		version: '0.2'
  });
})(jQuery);

