

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
		this.tickStep = 0;
		this.tickStepStart = 0;
		
		this.labels = [];
		this.tickPositions = [];
		this.showTicks = [];

		this.isXAxis = false;
		this.series = [];
		
		IDEX.constructFromObject(this, obj);
	}
	
	
	
	IDEX.Axis.prototype.resize = function(val, hw)
	{
		var bbox = d3.select("#ex_chart")[0][0].getBoundingClientRect();
		var wrapWidth = bbox.width;
		var wrapHeight = bbox.height;
			
		if (this.isXAxis)
		{
			var widest = 0;
			for (var i = 0; i < this.series.length; i++)
			{
				var yAxis = this.series[i].yAxis;
				
				if (yAxis.width > widest)
					widest = yAxis.width;
			}

			
			convertedHeight = this.resizeHW(this.heightInit, wrapHeight);
			convertedWidth = this.resizeHW("100%", wrapWidth);
			convertedWidth = convertedWidth - (widest + yAxis.padding.left) - this.padding.left;
		}
		else
		{
			var xAxis = this.series[0].xAxis;
			var len = this.series[0].xAxis.series.length;
			
			convertedHeight = this.resizeHW(this.heightInit, wrapHeight);
			convertedHeight = ((convertedHeight - (xAxis.height / len)) - (xAxis.padding.top / len)) - this.padding.top
			convertedWidth = this.resizeHW(this.widthInit, wrapWidth);	
		}
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
	
	IDEX.Axis.prototype.setYAxis = function(width)
	{
		this.widthInit = width
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
	
	var fontLabelAttr = {
		"fill": "#8C8C8C",
		"font-family": "Helvetica",
		"font-size": "12px"
	}
	
	var tickAttr = {
		"stroke": "white",
		"stroke-width": 0.5
	}
	
	var gridLineAttr = {
		"stroke": "#404040",
		"stroke-dasharray": "1,3",
		"stroke-width": 1

	}

	
	IDEX.makePriceAxisLabels = function(priceAxis)
	{
		$("#yAxisLabels").empty();
		$("#yAxisTicks").empty();
		$("#yAxisTicksRight").empty();
		$("#yAxisGridLines").empty();
		
		var ticks = [];
		var ticksRight = [];
		var tickLength = priceAxis.tickLength
		
		var labels = []
		var gridLines = [];
		
		var paddedMax = priceAxis.max + (priceAxis.max * (priceAxis.maxPadding))
		var paddedMin = priceAxis.min - (priceAxis.min * (priceAxis.minPadding))
		var scale = d3.scale.linear()
		.domain([paddedMin, paddedMax])
		.range([priceAxis.pos.bottom, priceAxis.pos.top])
		
		var tickVals = scale.ticks(10) //.map(o.tickFormat(8))
		
		var tickPositions = []
		
		for (var i = 0; i < tickVals.length; i++)
		{
			var p = priceAxis.getPos(tickVals[i])
			tickPositions.push(p)
		}
		var xPos = priceAxis.pos.left;
		
		var maxTextWidth = getMaxTextWidth(tickVals)
		var newAxisWidth = getNewAxisWidth(priceAxis, maxTextWidth)
		updateYAxisWidth(priceAxis, newAxisWidth)
		
	    for (var i = 0; i < tickPositions.length; i++)
	    {
			var yPos = tickPositions[i] + 0.5;
			var text = String(tickVals[i]);
			
			var label = makeLabel(xPos, yPos, text, maxTextWidth, priceAxis)
			labels.push(label);
			
			var tick = makeLeftTick(xPos, yPos);
			ticks.push(tick);
			
			var tickRight = makeRightTick(xPos, yPos, priceAxis);
			ticksRight.push(tickRight);
			
			var gridLine = makeGridLine(xPos, yPos);
			gridLines.push(gridLine);
		}

		var SVGLabels = d3.select("#yAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGLabels.attr("x", function (d) { return d.x + 10})
		.attr("y", function (d) { return d.y + 4})
		.text(function (d) { return d.text })
		.attr(fontLabelAttr)
		
		
		var SVGTicks = d3.select("#yAxisTicks").selectAll("line")
		.data(ticks)
		.enter()
		.append("line")
		
		SVGTicks
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x + tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(tickAttr)
		
		var SVGTicksRight = d3.select("#yAxisTicksRight").selectAll("line")
		.data(ticksRight)
		.enter()
		.append("line")
		
		SVGTicksRight
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x - tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(tickAttr)
		
		
		var SVGGridLines = d3.select("#yAxisGridLines").selectAll("line")
		.data(gridLines)
		.enter()
		.append("line")
		
		SVGGridLines
		.attr("x1", function (d) { return 0 })
		.attr("x2", function (d) { return d.x })
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(gridLineAttr)
	}
	
	
	IDEX.makeVolAxisLabels = function(volAxis)
	{
		$("#volAxisLabels").empty();
		$("#volAxisTicks").empty();
		$("#volAxisTicksRight").empty();
		$("#volAxisGridLines").empty();
		
		var ticks = [];
		var ticksRight = [];
		var tickLength = volAxis.tickLength
		
		var labels = []
		var gridLines = [];
		
		var paddedMax = volAxis.max + (volAxis.max * volAxis.maxPadding)
		var paddedMin = volAxis.min - (volAxis.min * volAxis.minPadding)
		var scale = d3.scale.linear()
		.domain([paddedMin, paddedMax])
		//.range([volAxis.pos.bottom, volAxis.pos.top])

		var tickVals = scale.ticks(4) //.map(o.tickFormat(8))
		
		var tickPositions = []
		for (var i = 0; i < tickVals.length; i++)
		{
			var p = volAxis.getPos(tickVals[i])
			tickPositions.push(p)
		}
		

		var xPos = volAxis.pos.left;
		

		var maxTextWidth = getMaxTextWidth(tickVals)
		var newAxisWidth = getNewAxisWidth(volAxis, maxTextWidth)
		updateYAxisWidth(volAxis, newAxisWidth)

		//console.log(String(textWid) + " " + String(tickLength*2) + " " + String(axisWidth))
		
	    for (var i = 0; i < tickPositions.length; i++)
	    {	
			if (tickVals[i] == 0)
				continue
			
			var yPos = tickPositions[i] + 0.5;
			var text = String(tickVals[i]);
			
			var label = makeLabel(xPos, yPos, text, maxTextWidth, volAxis)
			labels.push(label);
			
			var tick = makeLeftTick(xPos, yPos);
			ticks.push(tick);
			
			var tickRight = makeRightTick(xPos, yPos, volAxis);
			ticksRight.push(tickRight);
			
			var gridLine = makeGridLine(xPos, yPos);
			gridLines.push(gridLine);
		}

		var SVGLabels = d3.select("#volAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGLabels.attr("x", function (d) { return d.x })
		.attr("y", function (d) { return d.y + 4})
		.text(function (d) { return d.text })
		.attr(fontLabelAttr)
		//.attr("text-anchor", "end")
		//.attr("font-weight", "bold")
		//.attr("fill", "#737373")
		//.attr("font-family", "Helvetica")
		//.attr("font-size", "13px")
		
		var SVGTicks = d3.select("#volAxisTicks").selectAll("line")
		.data(ticks)
		.enter()
		.append("line")
		
		SVGTicks
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x + tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(tickAttr)
		
		var SVGTicksRight = d3.select("#volAxisTicksRight").selectAll("line")
		.data(ticksRight)
		.enter()
		.append("line")
		
		SVGTicksRight
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x - tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(tickAttr)
		
		var SVGGridLines = d3.select("#volAxisGridLines").selectAll("line")
		.data(gridLines)
		.enter()
		.append("line")
		
		SVGGridLines
		.attr("x1", function (d) { return 0 })
		.attr("x2", function (d) { return d.x })
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(gridLineAttr)
	}
	
	
	
	function makeLabel(xPos, yPos, text, maxTextWidth, axis)
	{
		var label = {};
		
		var axisWidth = axis.width;
		var tickLenth = axis.tickLength;
		var fixedTextPadding = 5
		
		var textWidth = getTextPixelWidth(text);
		var diff = maxTextWidth - textWidth 
		var shift = 0
		
		if (diff >= 1)
			shift = diff/2
		//console.log(axisWidth - textWidth)
		label.text = text;
		label.y = yPos;
		label.x = xPos + shift + 5 + axis.tickLength;
		
		return label;
	}
	
	function makeLeftTick(xPos, yPos)
	{
		var tick = {};
		
		tick.x = xPos;
		tick.y = yPos;
		
		return tick;
	}
	
	function makeRightTick(xPos, yPos, axis)
	{
		var tickRight = {};
		
		tickRight.y = yPos;
		tickRight.x = xPos + axis.width;
		
		return tickRight;
	}
	
	function makeGridLine(xPos, yPos)
	{
		var gridLine = {};
		
		gridLine.y = yPos;
		gridLine.x = xPos;
		
		return gridLine;
	}

	function getTextPixelWidth(text)
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		ctx.font = "12px Helvetica"; 
		
		return ctx.measureText(text).width;
	}
	
	function getMaxTextWidth(vals)
	{
		var max = 0
		
		for (var i = 0; i < vals.length; i++)
		{
			var text = String(vals[i]);
			var wid = getTextPixelWidth(text);
			
			if (wid > max)
				max = wid
		}
		
		return max
	}
	
	function getNewAxisWidth(yAxis, newWidth)
	{
		var textPadding = 5;
		var combinedWidth = newWidth + (yAxis.tickLength * 2) + (textPadding * 2)
		
		return combinedWidth
	}
	

	function updateYAxisWidth(yAxis, newWidth)
	{
		for (var i = 0; i < yAxis.series[0].xAxis.series.length; i++)
		{
			var otherAxis = yAxis.series[0].xAxis.series[i].yAxis
			if (otherAxis.width < newWidth)
				otherAxis.setYAxis(newWidth)
		}
	}
	
	
	IDEX.makeTimeAxisLabels = function(xAxis)
	{
		$("#xAxisLabels").empty();
		$("#xAxisTicks").empty();

		var labels = [];
		
		var ticks = [];
		var tickLength = xAxis.tickLength
		
		var tickStep = 6;
		var tickStepStart = 0;
		var chart = xAxis.chart

		if (xAxis.showTicks.length)
		{
			var index = -1;
			for (var i = 0; i < chart.pointData.length; i++)
			{
				var point = chart.pointData[i]
				for (var j = 0; j < xAxis.showTicks.length; j++)
				{
					var showTick = xAxis.showTicks[j];
					if (point.phase == showTick.phase)
					{
						index = i;
						break;
					}
				}
				
				if (index != -1)
					break;
			}
			if (index == -1)
			{
				xAxis.tickStepStart = 0;
			}
			else
			{
				xAxis.tickStepStart = index % tickStep;
			}
		}
		
		var showTicks = []
		
		if (tickStep >= chart.pointData.length)
		{
			var index = Math.floor((chart.pointData.length - 1) / 2)
			showTicks.push(chart.pointData[index])
		}
		else
		{
			var numTicks =  Math.floor(xAxis.width / tickStep) 
			var tickJump = Math.floor(numTicks / xAxis.xStep)

			var i = xAxis.tickStepStart;
			while (i < chart.pointData.length)
			{
				showTicks.push(chart.pointData[i])
				i += tickJump;
			}
		}
		xAxis.showTicks = showTicks
		
		var yPos = xAxis.pos.top;
		
		for (var i = 0; i < showTicks.length; i++)
		{
			var showTick = showTicks[i];
			var xPos = showTick.pos.middle;
			
			var label = {};
			label.text = IDEX.formatTime(new Date(showTick.phase.startTime))
			label.x = xPos
			label.y = yPos;
			labels.push(label);
			
			var tick = {};
			tick.x = xPos;
			tick.y = yPos;
			ticks.push(tick);
		}
		
		
		/*var firstTick = xAxis.min;
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
	    }*/
				
		var SVGTimeLabels = d3.select("#xAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGTimeLabels
		.attr("x", function (d) { return d.x - 20})
		.attr("y", function (d) { return d.y + 16 })
		.text(function (d) { return d.text })
		.attr("fill", "#737373")
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
		.attr(tickAttr)
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