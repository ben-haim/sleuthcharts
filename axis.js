
/*

		timeAxis = new IDEX.Axis();
		timeAxis.width = 900;
		timeAxis.height = 50;
		timeAxis.top = 650;
		timeAxis.left = 10;
		timeAxis.bottom = 700;
		timeAxis.numTicks = 8;
		
		priceAxis = new IDEX.Axis()
		priceAxis.height = 600;
		priceAxis.width = 90;
		priceAxis.bottom = 650;
		priceAxis.top = 50;
		priceAxis.left = 910;
		priceAxis.numTicks = 6;
		
*/

var IDEX = (function(IDEX, $, undefined) 
{   
	
	IDEX.Axis = function(obj) 
	{
		this.chart;
		this.height = 0;
		this.width = 0;
		this.heightInit = "";
		this.widthInit = "";
		
		this.pos = {
			"top":0,
			"bottom":0,
			"left":0,
			"right":0,
		},
			
		this.padding = {
			"top":0,
			"bottom":0,
			"left":0,
			"right":0,
		},
		
		this.dataMin = 0;
		this.dataMax = 0;
		this.min = 0;
		this.max = 0;
		this.minIndex = 0;
		this.maxIndex = 0;
		
		this.numTicks = 0;
		this.tickInterval = 0;
		this.tickLength = 0;
		
		this.labels = [];
		this.tickPositions = [];

		IDEX.constructFromObject(this, obj);
	}
	
	IDEX.Axis.prototype.resize = function(val, hw)
	{
		var bbox = d3.select("#ex_chart")[0][0].getBoundingClientRect();
		var wrapWidth = bbox.width;
		var wrapHeight = bbox.height;
		
		convertedHeight = this.resizeHW(this.heightInit, wrapHeight);
		convertedWidth = this.resizeHW(this.widthInit, wrapWidth);
		
		this.height = convertedHeight;
		this.width = convertedWidth;
	}
	
	IDEX.Axis.prototype.resizeHW = function(hw, wrapHW)
	{
		var strVal = String(hw);
		var hasPct = strVal.indexOf('%') >= 0;
		converted = hw
		
		if (hasPct)
		{
			var valNum = parseInt(strVal)/100			
			var converted = Math.round(valNum * Number(wrapHW));
		}
		
		return converted
	}
	
	
	IDEX.Axis.prototype.getPos = function(pointValue)
	{
		var paddedMax = this.max + (this.max * this.maxPadding)
		var paddedMin = this.min - (this.min * this.minPadding)

		var num = pointValue - paddedMin;
		var range = paddedMax - paddedMin;
		var ratio = num / range;
		var pos = Number((this.pos.bottom - (ratio * this.height)).toFixed(4));
		//console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
		return pos
	}
	
	/*IDEX.Axis.prototype.getPos = function(pointValue)
	{
		var num = pointValue - this.min;
		var range = this.max - this.min;
		var ratio = num / range;
		var pos = Number((this.pos.bottom - (ratio * this.height)).toFixed(4));
		console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
		return pos
	}*/
	
	
	IDEX.Axis.prototype.getPriceFromY = function(yPos)
	{
		var paddedMax = this.max + (this.max * this.maxPadding)
		var paddedMin = this.min - (this.min * this.minPadding)
		
		var range = paddedMax - paddedMin;
		var ratio = yPos / this.height;
		var num = ratio * range
		var price = paddedMax - num
		return price
	}
	
	/*IDEX.Axis.prototype.getPriceFromY = function(yPos)
	{
		var range = this.max - this.min;
		var ratio = yPos / this.height;
		var num = ratio * range
		var price = this.max - num
		return price
	}*/
	
	IDEX.Axis.prototype.getXVal = function(xPos)
	{
		//console.log(this.max)
		//console.log(this.min)
		var range = this.max - this.min;
		var ratio = xPos / this.width;
		var num = ratio * range;
		num = this.min + num;
		return num;
	}
	
	
	IDEX.Axis.prototype.makeLabels = function()
	{
		$("#"+this.containerID).empty();
		
		var labels = [];
		var range = this.max - this.min;
		var tickInterval = range / this.numTicks;
		
		var start = this.isXAxis ? 0 : this.height;
		var step = this.isXAxis ? (this.width / this.numTicks) : (this.height / this.numTicks)
		var fixedStep = this.isXAxis ? this.bottom : this.left

	    for(var i = 0; i < this.numTicks + 1; i++)
	    {
			var label = {};
			
			label.text = this.min + (i * tickInterval);
			label.x = start + (i * step);
			label.y = fixedStep;
			labels.push(label);
	    }
		
		var SVGTimeLabels = d3.select("#"+this.containerID).selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGTimeLabels
		.attr("x", function (d) { return d.x })
		.attr("y", function (d) { return d.y })
		.text(function (d) { return d.text })
		.attr("fill", "white");
	}
	
	
	IDEX.makePriceAxisLabels = function(priceAxis)
	{
		$("#yAxisLabels").empty();
		$("#yAxisTicks").empty();
		$("#yAxisGridLines").empty();
		
		var labels = [];
		
		var ticks = [];
		var tickLength = priceAxis.tickLength
		
		var gridLines = [];
		
		
		var firstTick = priceAxis.min - (priceAxis.min * priceAxis.minPadding);
		var lastTick = priceAxis.max + (priceAxis.max * priceAxis.maxPadding);
		var axisRange = lastTick - firstTick;
		
		
		var yStart = priceAxis.pos.bottom;
		var xPos = priceAxis.pos.left;
		
		var priceInterval = axisRange / (priceAxis.numTicks - 1);
		var heightInterval = Math.round(priceAxis.height / (priceAxis.numTicks - 1));
		
	    for (var i = 0; i < priceAxis.numTicks; i++)
	    {
			if (i == 0 || i == priceAxis.numTicks - 1)
				continue
			
			var label = {};
			label.text = String(Math.round(firstTick + (i * priceInterval)));
			label.y = yStart - (i * heightInterval);
			label.x = xPos;
			labels.push(label);
			
			var tick = {};
			tick.y = yStart - (i * heightInterval);
			tick.x = xPos;
			ticks.push(tick);
			
			var gridLine = {};
			gridLine.y = yStart - (i * heightInterval);
			gridLine.x = xPos;
			gridLines.push(gridLine);
		}

		var SVGLabels = d3.select("#yAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGLabels.attr("x", function (d) { return d.x + 10})
		.attr("y", function (d) { return d.y + 4})
		.text(function (d) { return d.text })
		.attr("fill", "white")
		.attr("fill", "#D3D3D3")
		.attr("font-family", "Helvetica")
		.attr("font-size", "13px")
		
		var SVGTicks = d3.select("#yAxisTicks").selectAll("line")
		.data(ticks)
		.enter()
		.append("line")
		
		SVGTicks
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x + tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr("stroke-width", 1)
		.attr("stroke", "white");
		
		var SVGGridLines = d3.select("#yAxisGridLines").selectAll("line")
		.data(gridLines)
		.enter()
		.append("line")
		
		SVGGridLines
		.attr("x1", function (d) { return 0 })
		.attr("x2", function (d) { return d.x })
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr("stroke-width", 0.5)
		.attr("stroke", "white")
		.attr("stroke-dasharray", "1,3");
	}
	
	
	IDEX.makeVolAxisLabels = function(volAxis)
	{
		$("#volAxisLabels").empty();
		$("#volAxisTicks").empty();
		$("#volAxisGridLines").empty();
		
		var labels = [];
		
		var ticks = [];
		var tickLength = volAxis.tickLength
		
		var gridLines = [];
		
		
		var firstTick = volAxis.min - (volAxis.min * volAxis.minPadding);
		var lastTick = volAxis.max + (volAxis.max * volAxis.maxPadding);
		var axisRange = lastTick - firstTick;
		
		
		var yStart = volAxis.pos.bottom;
		var xPos = volAxis.pos.left;
		
		var volInterval = axisRange / (volAxis.numTicks - 1);
		var heightInterval = Math.round(volAxis.height / (volAxis.numTicks - 1));
		
	    for (var i = 0; i < volAxis.numTicks; i++)
	    {
			if (i == 0 || i == volAxis.numTicks - 1)
				continue
			
			var label = {};
			label.text = String(Math.round(firstTick + (i * volInterval)));
			label.y = yStart - (i * heightInterval);
			label.x = xPos;
			labels.push(label);
			
			var tick = {};
			tick.y = yStart - (i * heightInterval);
			tick.x = xPos;
			ticks.push(tick);
			
			var gridLine = {};
			gridLine.y = yStart - (i * heightInterval);
			gridLine.x = xPos;
			gridLines.push(gridLine);
		}

		var SVGLabels = d3.select("#volAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGLabels.attr("x", function (d) { return d.x + 10})
		.attr("y", function (d) { return d.y + 4})
		.text(function (d) { return d.text })
		.attr("fill", "white")
		.attr("fill", "#D3D3D3")
		.attr("font-family", "Helvetica")
		.attr("font-size", "13px")
		
		var SVGTicks = d3.select("#volAxisTicks").selectAll("line")
		.data(ticks)
		.enter()
		.append("line")
		
		SVGTicks
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x + tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr("stroke-width", 1)
		.attr("stroke", "white");
		
		var SVGGridLines = d3.select("#volAxisGridLines").selectAll("line")
		.data(gridLines)
		.enter()
		.append("line")
		
		SVGGridLines
		.attr("x1", function (d) { return 0 })
		.attr("x2", function (d) { return d.x })
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr("stroke-width", 0.5)
		.attr("stroke", "white")
		.attr("stroke-dasharray", "1,3");
	}
	
	
	IDEX.makeTimeAxisLabels = function(xAxis)
	{
		$("#xAxisLabels").empty();
		$("#xAxisTicks").empty();

		var labels = [];
		
		var ticks = [];
		var tickLength = xAxis.tickLength
		
		
		var firstTick = xAxis.min;
		var lastTick = xAxis.max;
		var axisRange = lastTick - firstTick;
		
		var xStart = xAxis.pos.left;
		var yPos = xAxis.pos.top;
		
		var tickInterval = axisRange / (xAxis.numTicks - 1);
		var xInterval = xAxis.width / (xAxis.numTicks - 1);

	    for (var i = 0; i < xAxis.numTicks; i++)
	    {
			if (i == 0 || i == xAxis.numTicks - 1)
				continue
			
			var label = {};
			label.text = IDEX.formatTime(new Date(firstTick + (i * tickInterval)))
			label.x = xStart + (i * xInterval);
			label.y = yPos;
			labels.push(label);
			
			var tick = {};
			tick.x = xStart + (i * xInterval);
			tick.y = yPos;
			ticks.push(tick);
	    }
				
		var SVGTimeLabels = d3.select("#xAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGTimeLabels
		.attr("x", function (d) { return d.x - 20})
		.attr("y", function (d) { return d.y + 16 })
		.text(function (d) { return d.text })
		.attr("fill", "#D3D3D3")
		.attr("font-family", "Helvetica")
		.attr("font-size", "12px")
		
		
		var SVGTimeTicks = d3.select("#xAxisTicks").selectAll("line")
		.data(ticks)
		.enter()
		.append("line")
		
		SVGTimeTicks
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x })
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y + tickLength})
		.attr("stroke-width", 1)
		.attr("stroke", "white");
	}
	
	
	function getTickPositions(numTicks)
	{
	    for (var i = 0; i < xAxis.numTicks + 1; i++)
	    {
			var label = {};
			//console.log(new Date(firstTick + (i * tickInterval)).toJSON())
			label.text = firstTick + (i * tickInterval);
			label.x = xStart + (i * xInterval);
			label.y = yPos;
			labels.push(label);
	    }
	}
	
	return IDEX;
	
}(IDEX || {}, jQuery));