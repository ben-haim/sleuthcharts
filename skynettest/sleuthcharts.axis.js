

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
		
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext("2d");
		this.ctx.font = this.labels.fontSize + " Roboto"; 
	}
	
	
	IDEX.Axis.prototype.resizeXAxis = function()
	{
		var bbox = d3.select(this.chart.node)[0][0].getBoundingClientRect();
		var wrapWidth = bbox.width;
		var wrapHeight = bbox.height;

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

		
		this.height = convertedHeight;
		this.width = convertedWidth;
	}
	
	
	IDEX.Axis.prototype.resizeYAxis = function()
	{
		var bbox = d3.select(this.chart.node)[0][0].getBoundingClientRect();
		var wrapWidth = bbox.width;
		var wrapHeight = bbox.height;

		var xAxis = this.series[0].xAxis;
		var len = this.series[0].xAxis.series.length;
		
		convertedHeight = this.resizeHW(this.heightInit, wrapHeight);
		convertedHeight = ((convertedHeight - (xAxis.height / len)) - (xAxis.padding.top / len)) - this.padding.top
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
	
	
	IDEX.Axis.prototype.setYAxis = function(width)
	{
		this.widthInit = width
		this.width = width;
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
	
	
	IDEX.Axis.prototype.getXVal = function(xPos)
	{
		var range = this.max - this.min;
		var ratio = xPos / this.width;
		var num = ratio * range;
		num = this.min + num;
		return num;
	}
	
	
	IDEX.Axis.prototype.drawYAxisLines = function()
	{
		var chart = this.chart
		var bbox = d3.select(chart.node)[0][0].getBoundingClientRect()	
		
		var $axisGroup = $(chart.node).find(".sleuthYAxis[data-axisNum='" + String(this.axisIndex) +"']")
		var $axisLinesGroup = $axisGroup.find(".yAxisLines");
		var rawgroup = $axisLinesGroup.get()[0]
		
		var lineAttr = {
			"stroke-width": 1,
			"stroke": "#303030"
		}
		
		$axisLinesGroup.empty();

		d3.select(rawgroup).append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", this.pos['bottom'] + 0.5)
		.attr("y2", this.pos['bottom'] + 0.5)
		.attr(lineAttr)
		
		d3.select(rawgroup).append("line")
		.attr("x1", this.pos['left'] + 0.5)
		.attr("x2", this.pos['left'] + 0.5)
		.attr("y1", 0)
		.attr("y2", this.pos['bottom'])
		.attr(lineAttr)
		
	}
	
	IDEX.Axis.prototype.drawXAxisLines = function()
	{
		var chart = this.chart
		var bbox = d3.select(chart.node)[0][0].getBoundingClientRect()	
		
		var $axisGroup = $(chart.node).find(".sleuthXAxis[data-axisNum='" + String(this.axisIndex) +"']")
		var $axisLinesGroup = $axisGroup.find(".xAxisLines");
		var rawgroup = $axisLinesGroup.get()[0]
		
		var lineAttr = {
			"stroke-width": 1,
			"stroke": "#303030"
		}
		
		d3.select(rawgroup).append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", this.pos['top'] + 0.5)
		.attr("y2", this.pos['top'] + 0.5)
		.attr(lineAttr)
		
		d3.select(rawgroup).append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", this.pos['bottom'] + 0.5)
		.attr("y2", this.pos['bottom'] + 0.5)
		.attr(lineAttr)
	}
	

	IDEX.Axis.prototype.updateXMinMax = function(minIndex, maxIndex)
	{
		var vis = this.chart.visiblePhases;
		
		this.minIndex = minIndex;
		this.maxIndex = maxIndex;
		this.min = vis[0].startTime;
		this.max = vis[vis.length-1].startTime
	}
	
	
	IDEX.Axis.prototype.updateYMinMax = function(temp)
	{
		var vis = this.chart.visiblePhases;
		
		if (temp)
		{
			var minMax = IDEX.getMinMax(vis)
		}
		else
		{
			var minMax = IDEX.getMinMaxVol(vis)
		}
		
		this.min = minMax[0]
		this.max = minMax[1]
	}
	
	
	
	IDEX.Axis.prototype.calcPointWidth = function(vis)
	{
		var minWidth = 1;
		var padding = 1;
		
	    var fullWidth = this.width / vis.length
		
		if (fullWidth >= 3) padding = 2;
		if (fullWidth >= 5) padding = 3.5;
		if (fullWidth >= 10) padding = 5;
		if (fullWidth >= 20) padding = 10;
		if (fullWidth >= 100) padding = 20;

		var pointWidth = fullWidth - padding
		//console.log(String(fullWidth) + " " + String(vis.length) + " " + String(pointWidth) + " " + String(padding))
		
		//pointWidth = pointWidth < minWidth ? minWidth : width;
		if (pointWidth < minWidth)
			return false
		
		this.xStep = fullWidth;
		this.pointWidth = pointWidth;
		this.pointPadding = padding;
		this.numPoints = Math.ceil(this.width / this.xStep);
		
		return true
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
	
	
	IDEX.Axis.prototype.updateYAxisPos = function()
	{
		var chart = this.chart
		var xAxis = chart.xAxis[0]
		var axisIndex = this.axisIndex;
		
		var leftAdd = xAxis.padding['left'] + xAxis.width;
		var topAdd = 0;
		
		if (axisIndex > 1)
		{
			var otherAxis = chart.yAxis[axisIndex-2]
			topAdd += otherAxis.pos.bottom;
		}

		this.pos['top'] = this.padding['top'] + topAdd;
		this.pos['bottom'] = this.pos['top'] + this.height;
		this.pos['left'] =  + this.padding['left'] + leftAdd;
		this.pos['right'] = this.pos['left'] + this.width;
	}
	
	IDEX.Axis.prototype.updateXAxisPos = function()
	{
		var chart = this.chart
		var yAxis = chart.yAxis[chart.yAxis.length-1]

		this.pos['top'] = yAxis.pos['bottom'] + this.padding['top'];
		this.pos['bottom'] = this.pos['top'] + this.height;
		this.pos['left'] = this.padding['left'];
		this.pos['right'] = this.pos['left'] + this.width;	
	}
	
	IDEX.getNeededWidth = function(thisAxis)
	{
		var allSeries = thisAxis.series[0].xAxis.series
		var biggestWidth = 0;
		
		for (var i = 0; i < allSeries.length; i++)
		{
			var yAxis = allSeries[i].yAxis;
			
			var paddedMax = yAxis.max + (yAxis.max * (yAxis.maxPadding))
			var paddedMin = yAxis.min - (yAxis.min * (yAxis.minPadding))
			
			var scale = d3.scale.linear()
			.domain([paddedMin, paddedMax])
			.range([yAxis.height, yAxis.pos.top])
			
			var tickVals = scale.ticks(yAxis.numTicks) //.map(o.tickFormat(8))
			
			
			var maxTextWidth = getMaxTextWidth(tickVals, yAxis.labels.fontSize, yAxis.ctx)
			var newAxisWidth = getNewAxisWidth(yAxis, maxTextWidth)
			biggestWidth = newAxisWidth > biggestWidth ? newAxisWidth : biggestWidth;
		}
		for (var i = 0; i < allSeries.length; i++)
		{
			var yAxis = allSeries[i].yAxis
			yAxis.setYAxis(biggestWidth)
			//console.log(yAxis.height)
		}
	}
	
	
	IDEX.Axis.prototype.makeYAxis = function()
	{
		var fontLabelAttr = {
			"fill": this.labels.fontColor,
			"font-family": "Roboto",
			"font-size": this.labels.fontSize
		}
		
		var node = this.chart.node
		var $yAxisLabelsID = this.nodes.labels
		var $yAxisTicksID = this.nodes.ticksLeft
		var $yAxisTicksRightID = this.nodes.ticksRight
		var $yAxisGridLinesID = this.nodes.gridLines
		
		$yAxisLabelsID.empty();
		$yAxisTicksID.empty();
		$yAxisTicksRightID.empty();
		$yAxisGridLinesID.empty();
		
		var ticks = [];
		var ticksRight = [];
		var tickLength = this.tickLength
		
		var labels = []
		var gridLines = [];
		
		var paddedMax = this.max + (this.max * (this.maxPadding))
		var paddedMin = this.min - (this.min * (this.minPadding))
		
		var scale = d3.scale.linear()
		.domain([paddedMin, paddedMax])
		.range([this.height, this.pos.top])
		
		var tickVals = scale.ticks(this.numTicks) //.map(o.tickFormat(8))
		
		var tickPositions = []
		
		for (var i = 0; i < tickVals.length; i++)
		{
			//if (this.chart.isMain)
			//	tickVals[i] = Number(tickVals[i].toFixed(6));
			var maxDec = 8;
			var num = tickVals[i];
			var sind = String(num).search("e")
			if (sind != -1)
			{
				var partwhole = String(num).slice(0, sind)
				var partall = partwhole.split(".")
				if (partall.length == 1)
					partall.push("0")
				var exnum = String(num).slice(sind+1)
				var isneg = Number(exnum) < 0
				var pow = exnum.slice(1)
				//partall[0].length + partall[1].length
				num = "0." + (Array(Number(pow) - (0)).join("0")) + partall[0] + partall[1]

			}
			var all = String(num).split(".")
			var numDec = 0;
			var startDec = 0;
			//console.log(all[1])
			if (all.length == 2)
			{
				if (Number(all[0]) > 0)
				{
				}
				else
				{
					for (sing in all[1])
					{
						if (Number(all[1][sing]) > 0)
						{
							break
						}
						startDec++;
					}
				}
			}
			else
			{
				all.push("0")
			}


			var paddedDec = 3;
			var endDec = startDec + paddedDec
			//var avail = maxDec - numDec;
			if (endDec > maxDec)
				endDec = maxDec
			
			var strDec = Number("0."+all[1]).toFixed(endDec)
			var strAll = all[0] + "." + strDec.split(".")[1];
			tickVals[i] = Number(strAll)
			
			
			var p = this.getPos(tickVals[i])
			tickPositions.push(p)
		}
		
		var xPos = this.pos.left;
		
		var maxTextWidth = getMaxTextWidth(tickVals, this.labels.fontSize, this.ctx)
		var newAxisWidth = this.width
		
	    for (var i = 0; i < tickPositions.length; i++)
	    {
			if (tickVals[i] == 0)
				continue
			var yPos = tickPositions[i] + 0.5;
			var text = String(tickVals[i]);
			
			var label = makeLabel(xPos, yPos, text, maxTextWidth, this)
			labels.push(label);
			
			var tick = makeLeftTick(xPos, yPos);
			ticks.push(tick);
			
			var tickRight = makeRightTick(xPos, yPos, this);
			ticksRight.push(tickRight);
			
			var gridLine = makeGridLine(xPos, yPos);
			gridLines.push(gridLine);
		}

		var SVGLabels = d3.select($yAxisLabelsID.get()[0]).selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGLabels.attr("x", function (d) { return d.x })
		.attr("y", function (d) { return d.y + 4 })
		.text(function (d) { return d.text })
		.attr(fontLabelAttr)
		//.attr("text-anchor", "end")

		
		var SVGTicks = d3.select($yAxisTicksID.get()[0]).selectAll("line")
		.data(ticks)
		.enter()
		.append("line")
		
		SVGTicks
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x + tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(tickAttr)
		
		
		var SVGTicksRight = d3.select($yAxisTicksRightID.get()[0]).selectAll("line")
		.data(ticksRight)
		.enter()
		.append("line")
		
		SVGTicksRight
		.attr("x1", function (d) { return d.x })
		.attr("x2", function (d) { return d.x - tickLength})
		.attr("y1", function (d) { return d.y })
		.attr("y2", function (d) { return d.y })
		.attr(tickAttr)
		
		
		var SVGGridLines = d3.select($yAxisGridLinesID.get()[0]).selectAll("line")
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
	
	
	IDEX.Axis.prototype.makeXAxis = function()
	{
		var xAxis = this
		
		var fontLabelAttr = {
			"fill": "#737373",
			"font-family": "Roboto",
			"font-size": xAxis.labels.fontSize
		}
		
		var $xAxisLabelsID = xAxis.nodes.labels
		var $xAxisTicksID = xAxis.nodes.ticks
		
		$xAxisLabelsID.empty();
		$xAxisTicksID.empty();

		var labels = [];
		
		var ticks = [];
		var tickLength = xAxis.tickLength
		
		var tickStep = xAxis.tickStep;
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
			if (tickJump < 1)
				tickJump = 1
			
			var i = xAxis.tickStepStart;
			var len = chart.pointData.length;
			while (i < len)
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
		
				
		var SVGTimeLabels = d3.select($xAxisLabelsID.get()[0]).selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGTimeLabels
		.attr("x", function (d) { return d.x - 20})
		.attr("y", function (d) { return d.y + 16 })
		.text(function (d) { return d.text })
		.attr(fontLabelAttr)
		
		var SVGTimeTicks = d3.select($xAxisTicksID.get()[0]).selectAll("line")
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
	
	
	function makeLabel(xPos, yPos, text, maxTextWidth, axis)
	{
		var label = {};
		
		var axisWidth = axis.width;
		var tickLength = axis.tickLength;
		var fixedTextPadding = axis.labels.textPadding
		
		var textWidth =  axis.ctx.measureText(text).width;
		var diff = maxTextWidth - textWidth 
		var shift = 0
		
		var wrapWidth = (tickLength * 2) + (fixedTextPadding * 2)
		var pad = ((axis.width - wrapWidth) / 2) - (maxTextWidth / 2)
		
		if (diff >= 1)
			shift = diff/2
		
		if (pad >= 0.5)
			shift += pad
		/*console.log(axisWidth - textWidth)
		console.log(shift)
		console.log(fixedTextPadding)
		console.log(xPos)
		console.log(text)*/
		label.text = text;
		label.y = yPos;
		
		label.x = xPos + shift + fixedTextPadding + tickLength;
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
	

	function getTextPixelWidth(text, fontSize)
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		ctx.font = fontSize + " Roboto"; 
		
		return ctx.measureText(text).width;
	}
	
	
	function getMaxTextWidth(vals, fontSize, ctx)
	{
		var max = 0
		
		for (var i = 0; i < vals.length; i++)
		{
			var text = String(Number(vals[i].toPrecision(3)));
			var wid = ctx.measureText(text).width;
			
			if (wid > max)
				max = wid
		}
		
		return max
	}
	
	
	function getNewAxisWidth(yAxis, newWidth)
	{
		var textPadding = yAxis.labels.textPadding;
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
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));