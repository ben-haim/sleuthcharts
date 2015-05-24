var IDEX = (function(IDEX, $, undefined) 
{   
	var GENESIS_TIMESTAMP = 1385294400;
    var nxtURL = "http://127.0.0.1:7876/nxt?";
	var curChart;
	var xAxis;
	var priceAxis;
	var volAxis;

    var isDragging = false;
	var draggingPos = 0;
	
	var skynetKeysTick = [2,3,4,5,6]
	var skynetKeys = [3,4,5,6,7]

    IDEX.init = function()
    {
		curChart = new IDEX.Chart();
    }
	
	IDEX.SkyNETParams = function(obj) 
	{
		this.baseurl = "http://api.finhive.com/v1.0/run.cgi?";
		//this.key = "9cf373ead4858e19bf93ae5ea238c4c796819cc883c877513f528b95721a1085";
		this.key = "beta_test";

		this.section = "";
		this.run = "";
		this.mode = "";
		this.exchg = "";
		this.pair = "";
		this.num = "";
		this.bars = "";
        this.len = "";
		
		IDEX.constructFromObject(this, obj);
	}

    IDEX.SkyNETParams.prototype.makeURL = function()
    {
        var arr = []
        for (key in this)
        {
            if (this.hasOwnProperty(key))
                if (key != "baseurl")
                    arr.push(key+"="+this[key])
        }
        var s = arr.join("&")

        return this.baseurl+s
    }

	IDEX.OHLC = function(obj) 
	{
		var __construct = function(that) 
		{
			that.startTime = obj[0]
			that.endTime = obj[1]
			that.open = obj[2]
			that.high = obj[3]
			that.low = obj[4]
			that.close = obj[5]
			that.volu = obj[6]
		}(this)
	}
	
	IDEX.phaseData = function(obj) 
	{
		this.startTime = 0;
		this.endTime = 0;
		
		this.trades = [];
		this.averagePrice = 0;
		this.open = 0;
		this.high = 0;
		this.low = 0;
		this.close = 0;
		this.volume = 0;
	}
	
	IDEX.Chart = function(obj) 
	{
		this.baseid = "6854596569382794790"
		this.relid = "6932037131189568014"
		this.basename = "SkyNET"
		this.relname = "jl777hodl"
		this.isvirtual = false
		this.flip = false
		this.isNew = false
		
		this.tradeData = [];
		this.phases = [];
		
		this.timespan = 0;
		this.barWidth = 0;
		this.numBars = 0;
		
		this.startTime = 0;
		this.endTime = 0;
		this.maxTimespan = 0;
		this.visibleTimespan = 0;
		
		this.maxPrice = 0;
		this.minPrice = 0;

		this.maxAveragePrice = 0;
		this.minAveragePrice = 0;
		
		this.maxChange = 0;
		this.minChange = 0;
		
		this.maxVol = 0;
		
		IDEX.constructFromObject(this, obj);
	}
	
	function getData(options, len)
	{
		var dfd = new $.Deferred();
		var id = "15344649963748848799"
		
        var obj = {}
		//obj['run'] = "indicator"
        obj['run'] = "quotes";
        obj['section'] = "crypto";
        obj['mode'] = "bars";
        obj['exchg'] = "nxtae";
        obj['pair'] = id+"_NXT";
        obj['num'] = "600"
        obj['bars'] = "tick"
        obj['len'] = len
		
		//obj['icode'] = "ind_ema"
		//obj['ion'] = "cl"
		//obj['ilen'] = len
		//obj['inum'] = "600"
		//obj['iret'] = "merge"

        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()

		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	function getStepOHLC(data)
	{
		var ohlc = []
		var volume = []
		var dataLength = data.length
		var keys = skynetKeys
		var baseNXT = false
		
		for (var i = 0; i < dataLength; i++) 
		{
			var pointDate = data[i][0]*1000;
			var endTime = data[i][1]*1000;
			var open = data[i][keys[0]]
			var high = data[i][keys[1]]
			var low = data[i][keys[2]]
			var close = data[i][keys[3]]
			var volu = data[i][keys[4]]
			
			if (baseNXT)
			{
				data[i][keys[0]] =  Number((1 / close).toFixed(6))
				data[i][keys[1]] =  Number((1 / low).toFixed(6))
				data[i][keys[2]] =  Number((1 / high).toFixed(6))
				data[i][keys[3]] =  Number((1 / open).toFixed(6))
				data[i][keys[4]] =  Number((close * volu).toFixed(6))

				data[i] = ((i!= 0) && (data[i][keys[2]] < data[i-1][keys[2]]/5)) ? data[i-1] : data[i] // spike
			}
			else
			{
				data[i] = ((i!= 0) && (data[i][keys[1]] > data[i-1][keys[1]]*5)) ? data[i-1] : data[i] // spike
			}
			
			ohlc.push(new IDEX.OHLC([pointDate, endTime, open, high, low, close, volu]))
			volume.push({x:pointDate, y:volu});
		}

		return [ohlc, volume]
	}
	
    $("input[name=time_width]").change(function()
    {
	    updateChart();
    });
	
	function makeChart()
	{
		curChart = new IDEX.Chart();
		curChart.node = "#ex_chart";
		
		var xAxisOpt = {
			"chart":curChart,
			"heightInit":20,
			"widthInit":"100%",
			
			"padding":{
				"top":0,
				"left":10,
			},
			
			"numTicks":8,
			"tickLength":4,
			"containerID":"xAxisLabels",
			"isXAxis":true,
		}
		var priceAxisOpt = {
			"chart":curChart,
			"heightInit":"75%",
			"widthInit":50,
			
			"padding":{
				"top":25,
				"left":20,
			},
			
			"minPadding":0.1,
			"maxPadding":0.05,
			
			"numTicks":7,
			"tickLength":7,
			"containerID":"yAxisLabels",
		}
		
		var volAxisOpt = {
			"chart":curChart,
			"heightInit":"25%",
			"widthInit":50,
			
			"padding":{
				"top":20,
				"left":20,
			},
			
			"minPadding":0.1,
			"maxPadding":0.05,
			
			"numTicks":7,
			"tickLength":7,
			"containerID":"volAxisLabels",
		}
		
		xAxis = new IDEX.Axis(xAxisOpt);
		priceAxis = new IDEX.Axis(priceAxisOpt)
		volAxis = new IDEX.Axis(volAxisOpt)
		
		
		var candleSeriesOpt = {
			"xAxis":xAxis,
			"yAxis":priceAxis,
		};
		
		var volSeriesOpt = {
			"xAxis":xAxis,
			"yAxis":volAxis,
		};
		
		var candleSeries = new IDEX.Series(candleSeriesOpt)
		var volSeries = new IDEX.Series(volSeriesOpt)
		
		resizeAxis();

		candleSeries.height = candleSeries.yAxis.height;
		candleSeries.width = candleSeries.xAxis.width;
		candleSeries.pos['left'] = candleSeries.xAxis.pos['left'];

		console.log(xAxis)
		console.log(priceAxis)
		console.log(volAxis)
	}
	
	
	function resizeAxis()
	{
		priceAxis.resize()
		volAxis.resize()
		xAxis.resize()
		updateAxisPos();	
	}
	
	function updateAxisPos()
	{
		priceAxis.pos['top'] = priceAxis.padding['top'];
		priceAxis.pos['bottom'] = priceAxis.pos['top'] + priceAxis.height;
		priceAxis.pos['left'] = xAxis.pos['left'] + xAxis.width + priceAxis.padding['left'];
		priceAxis.pos['right'] = priceAxis.pos['left'] + priceAxis.width;
		
		volAxis.pos['top'] = priceAxis.pos['bottom'] + volAxis.padding['top'];
		volAxis.pos['bottom'] = volAxis.pos['top'] + volAxis.height;
		volAxis.pos['left'] = xAxis.pos['left'] + xAxis.width + volAxis.padding['left'];
		volAxis.pos['right'] = volAxis.pos['left'] + volAxis.width;
		
		xAxis.pos['top'] = volAxis.pos['bottom'] + xAxis.padding['top'];
		xAxis.pos['bottom'] = xAxis.pos['top'] + xAxis.height;
		xAxis.pos['left'] = xAxis.padding['left'];
		xAxis.pos['right'] = xAxis.pos['left'] + xAxis.width;	
	}
	
	function redraw()
	{
		drawCandleSticks();
		IDEX.makePriceAxisLabels(priceAxis);
		IDEX.makeVolAxisLabels(volAxis);
		IDEX.makeTimeAxisLabels(xAxis);
		drawInd();
		priceSeriesLine();
		highLowPrice();
	}

	function getInd(options, len)
	{
		var dfd = new $.Deferred();
		var id = "15344649963748848799"
		
        var obj = {}
		obj['run'] = "indicator"
        //obj['run'] = "quotes";
        obj['section'] = "crypto";
        obj['mode'] = "bars";
        obj['exchg'] = "nxtae";
        obj['pair'] = id+"_NXT";
        obj['num'] = "600"
        obj['bars'] = "tick"
        obj['len'] = len
		
		obj['icode'] = "ind_ema"
		obj['ion'] = "cl"
		obj['ilen'] = 7
		obj['inum'] = "600"
		obj['iret'] = "solo"

        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()

		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	var indi;
	function updateChart()
	{
        var params = {"requestType":"getTrades","asset":"15344649963748848799"};
		var barWidth = Number($("input[name=time_width]:checked").val());
		
		getData({}, barWidth).done(function(data)
		{
			/*var res = data.results
			data = data.results.data
			console.log(data)
			
			var lastTime = -1;
			var lastIndex = 0
			for (var i = 0; i < data.bar.length; i++)
			{
				var point = data.bar[i];
				if (point[0] < lastTime)
					lastIndex = i;
				lastTime = point[0]
			}
			console.log(lastIndex)
			data.bar = data.bar.splice(lastIndex)
			var both = getStepOHLC(data.bar);*/
			
			getInd({}, barWidth).done(function(ind)
			{
				console.log(ind)
				console.log(data)
				
				var lastTime = -1;
				var lastIndex = 0
				for (var i = 0; i < data.results.length; i++)
				{
					var point = data.results[i];
					if (point[0] < lastTime)
						lastIndex = i;
					lastTime = point[0]
				}
				console.log(lastIndex)
				data.results = data.results.slice(lastIndex)
				indi = ind.results.data.slice(lastIndex)
				
				var both = getStepOHLC(data.results);
				var ohlc = both[0]
				var vol = both[1]
				//console.log(both)
				//console.log(data)
				
				makeChart()
				
				curChart.barWidth = barWidth
				curChart.phases = ohlc

				initAxisRange();
				resizeAxis();
				redraw()
				resizeAxis();
				redraw()
				
			})
			
		})
	}
	
	function drawInd()
	{
		$("#ind").empty()
		
		var visInd = indi.slice(xAxis.minIndex, xAxis.maxIndex+1)
		var flow = []
		var positions = []

		for (var i = 0; i < visInd.length; i++)
		{
			var candle = curChart.pointData[i];
			var price = visInd[i];
			var pos = Math.floor(priceAxis.getPos(price));
			positions.push({"x":candle.pos.middle, "y":pos})
			if (i == 0)
			{
				
				flow.push("M")
				flow.push(candle.pos.middle)
				flow.push(pos)
			}
			else
			{
				flow.push("L")
				flow.push(candle.pos.middle)
				flow.push(pos)
			}
			
		}
		
		var lineFunc = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("basis")

		
		d3.select("#ind")
		.append("path")
		//.attr("d", flow.join(" "))
		.attr("d", lineFunc(positions))
		.attr("stroke", "#EDE22E")
		.attr("stroke-width", "1.5px")
		.attr("fill", "none")
		//.attr("shape-rendering", "crispEdges");
	}

	
	function initAxisRange()
	{
		var numShow = 30;
		var index = 0;
		var vis = []
		if (curChart.phases.length > numShow)
		{
			index = curChart.phases.length - numShow;
			vis = curChart.phases.slice(index);
		}
		else
		{
			vis = curChart.phases.slice(index);
		}
		
		if (calcPointWidth(vis) || true);
		{
			curChart.visiblePhases = vis
			xAxis.dataMin = curChart.phases[0].startTime;
			xAxis.dataMax = curChart.phases[curChart.phases.length-1].startTime
			xAxis.min = curChart.visiblePhases[0].startTime;
			xAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1].startTime
			xAxis.minIndex = index;
			xAxis.maxIndex = curChart.phases.length - 1;
			
			var priceMinMax = IDEX.getMinMax(curChart.visiblePhases)
			priceAxis.min = priceMinMax[1]
			priceAxis.max = priceMinMax[0]
			
			var volMinMax = IDEX.getMinMaxVol(curChart.visiblePhases)
			volAxis.min = 0 //volMinMax[0]
			volAxis.max = volMinMax[1]
		}
	}
	
	
	function shiftXAxis(shifts, direction)
	{
		var vis = []
		
		if (direction == false)
		{
			if (xAxis.minIndex > 0)
			{
				var startIndex = xAxis.minIndex - shifts;
				var endIndex = xAxis.maxIndex - shifts;
				vis = curChart.phases.slice(startIndex, endIndex+1);
			}
		}
		else
		{
			if (xAxis.maxIndex < curChart.phases.length - 1)
			{
				var startIndex = xAxis.minIndex + shifts;
				var endIndex = xAxis.maxIndex + shifts;
				vis = curChart.phases.slice(startIndex, endIndex+1);
			}
		}

		if (vis.length)
		{
			//console.log(xAxis.maxIndex)
			//console.log(curChart.phases.length - 1)
			//console.log(vis[0].startTime)
			//console.log(curChart.visiblePhases[0].startTime)			
			if (calcPointWidth(vis))
			{
				curChart.visiblePhases = vis;
				xAxis.minIndex = startIndex;
				xAxis.maxIndex = endIndex;
				xAxis.min = curChart.visiblePhases[0].startTime;
				xAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1].startTime
				
				var priceMinMax = IDEX.getMinMax(curChart.visiblePhases)
				priceAxis.min = priceMinMax[1]
				priceAxis.max = priceMinMax[0]
				
				var volMinMax = IDEX.getMinMaxVol(curChart.visiblePhases)
				volAxis.min = 0 //volMinMax[0]
				volAxis.max = volMinMax[1]
				//console.log(xAxis.maxIndex)
				//console.log(xAxis)


			}
		}

	}
	
	
	function redrawXAxis(newMax, newMin)
	{
		for (var i = 0; i < curChart.phases.length; i++)
		{
			var phase = curChart.phases[i];
			
			if (phase.startTime >= newMin)
			{
				if (i != 0)
					i--;
				break;
			}
		}
		
		var vis = curChart.phases.slice(i, xAxis.maxIndex + 1);
		
		if (calcPointWidth(vis))
		{
			curChart.visiblePhases = vis
			xAxis.minIndex = i;
			xAxis.maxIndex = xAxis.maxIndex;
			xAxis.min = curChart.visiblePhases[0].startTime;
			xAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1].startTime
			//console.log(curChart.visiblePhases);
			
			var priceMinMax = IDEX.getMinMax(curChart.visiblePhases)
			priceAxis.min = priceMinMax[1]
			priceAxis.max = priceMinMax[0]
			
			var volMinMax = IDEX.getMinMaxVol(curChart.visiblePhases)
			volAxis.min = 0 //volMinMax[0]
			volAxis.max = volMinMax[1]
		}
	}
	

	function zoomChart(isZoomOut)
	{
		var curMax = xAxis.max;
		var curMin = xAxis.min;
		var dataMax = xAxis.dataMax;
		var dataMin = xAxis.dataMin;
		var diff = (curMax - curMin) / 10;
		   
		var newMax = curMax;
		if (isZoomOut)
		{
			var newMin = (curMin-diff > dataMin) ? curMin-diff : dataMin;
			//console.log("curmin: " + String(curMin))
			//console.log("diff: " + String(diff))
			//console.log("newMin: " + String(newMin))
			//console.log("dataMax: " + String(dataMax))
			//console.log("dataMin: " + String(dataMin))
		}
		else
		{
			var newMin = (curMin + diff < curMax) ? curMin + diff : curMin;
		}
			
		redrawXAxis(newMax, newMin)
		resizeAxis()

		redraw()
	}
	
	function calcPointWidth(vis)
	{
		var minWidth = 1;
		var padding = 1;
	    var fullWidth = xAxis.width / vis.length
		if (fullWidth >= 3) padding = 2;
		if (fullWidth >= 5) padding = 3.5;
		if (fullWidth >= 10) padding = 5;
		if (fullWidth >= 20) padding = 10;
		if (fullWidth >= 100) padding = 20;

		var pointWidth = fullWidth - padding
		console.log(String(fullWidth) + " " + String(vis.length) + " " + String(pointWidth))
		//console.log(pointWidth)
		if (pointWidth < minWidth)
			return false
		//pointWidth = pointWidth < minWidth ? minWidth : width;
		
		//console.log(String(xAxis.xStep) + "    " + String(xAxis.width) + String(xAxis.numPoints));
		//var scale = padding / fullWidth;
		
		xAxis.xStep = fullWidth;
		xAxis.pointWidth = pointWidth;
		xAxis.pointPadding = padding;
		xAxis.numPoints = Math.floor(xAxis.width / xAxis.xStep);
		
		return true
		//console.log("w:"+String(width))
		//console.log(xAxis.width / curChart.visiblePhases.length)
		//console.log(padding)
		//console.log(curChart.visiblePhases.length)
		//console.log(xAxis.numPoints)
	}
	
	
	
	$(window).resize(function()
	{
		var height = $("#chartwrap").height();
		var width = $("#chartwrap").width();
		var bbox = d3.select("#ex_chart")[0][0].getBoundingClientRect()
		var bbox = d3.select("#boxes").node().getBBox();
		var bHeight = bbox.height;
		var bWidth = bbox.width;
		//console.log(bbox)
		//console.log(String(height) + " " + String(width))
		/*d3.select("#boxes").selectAll("path").each(function(d,i)
		{
			console.log(this)
			console.log(d)
		})*/
		
		resizeAxis()
		calcPointWidth()
		redraw()
	})


    function drawCandleSticks()
    {
	    $("#boxes").empty();
	    $("#volbars").empty();
	    $("#axis").empty();

		var xStart = xAxis.pos.left;
		var xPos = xStart;
		var phases = curChart.visiblePhases;
		var phasesLength = phases.length;

		//console.log(curChart)
		var a = Date.now()
		//console.log(xAxis)
		var allPhases = []
		var box = d3.select("#boxes")
		var volBars = d3.select("#volbars")

	    for (var i = 0; i < phasesLength; i++)
		{
			var phase = phases[i];
			var closedHigher = phase.close > phase.open;
			var top = closedHigher ? phase.close : phase.open;
			var bottom = closedHigher ? phase.open : phase.close;
			
			var strokeColor = closedHigher ? "#6c6" : "#d00";
			var fillColor = closedHigher ?  "transparent" : "#a80808";
			if (xAxis.pointWidth <= 2 && closedHigher)
			{
				//console.log(xAxis.pointWidth)
				fillColor = "transparent"
			}
			else
			{
				//console.log(xAxis.pointWidth)
			}
		    //var midline = priceAxis.getPos(phase.averagePrice);
		    var bottomBody = priceAxis.getPos(bottom);
		    var bottomLeg = priceAxis.getPos(phase.low);
		    var topBody = priceAxis.getPos(top);
		    var topLeg = priceAxis.getPos(phase.high);
			
			var left = xPos + 0.5;
			var right = (left + xAxis.pointWidth) - 0.5;
			var xMiddle = ((left - 0.5) + (right + 0.5)) / 2;
			//console.log(String(left) + " " + String(right) + " " + String(xMiddle))
			if (bottomBody - topBody < 1)
			{
				bottomBody += 0.5;
				topBody -= 0.5;
			}
			left += 0.5
			right += 0.5
			xMiddle += 0.5
			topLeg += 0.5
			topBody += 0.5
			bottomBody += 0.5
			bottomLeg += 0.5
			
			var d = [
				"M", left, topBody, 
				"L", left, bottomBody, 
				"L", right, bottomBody, 
				"L", right, topBody, 
				"Z", 
				"M", xMiddle, bottomBody, 
				"L", xMiddle, bottomLeg, 
				"M", xMiddle, topBody, 
				"L", xMiddle, topLeg
			]

			
			var positions = {}
			positions['left'] = left;
			positions['right'] = right;
			positions['middle'] = xMiddle;
			positions['topLeg'] = topLeg;
			positions['topBody'] = topBody;
			positions['bottomBody'] = bottomBody;
			positions['bottomLeg'] = bottomLeg;

			allPhases.push({"phase":phase, "pos":positions})
			
			box
			//.selectAll("path")
			//.data(allPhases)
			//.enter()
			.append("path")
			.attr("d", d.join(" "))
			.attr("fill", fillColor)
			.attr("stroke", strokeColor)
			.attr("stroke-width", 1)
			//.attr('shape-rendering', "crispEdges")
			
			var volTop = volAxis.getPos(phase.volu);
			var volHeight = volAxis.pos.bottom - volTop;
			
			volBars
			.append("rect")
			.attr("x", xPos + 1)
			.attr("y", volTop - 2)
			.attr("height", volHeight)
			.attr("width", xAxis.pointWidth - 0.5)
			.attr("fill", fillColor)
			.attr("stroke", strokeColor)
			.attr("stroke-width", 1)
			
			//console.log(volAxis.getPos(phase.volu));
			//console.log(phase.volu)
			
		    xPos += xAxis.xStep;
	    }

		//console.log(volAxis)
		curChart.pointData = allPhases;

		//console.log(Date.now() - a)	
    }


	function highLowPrice()
	{
		if (!xAxis)
			return
		var points = curChart.pointData
		var highestPrice = null;
		var lowestPrice = null;

		for (var i = 0; i < points.length; ++i)
		{
			if (highestPrice === null || points[i].phase.high >= highestPrice.phase.high)
			{
				highestPrice = points[i]
			}
			if (lowestPrice === null || points[i].phase.low <= lowestPrice.phase.low)
			{
				lowestPrice = points[i]
			}
		}
				
		var fontAttr = {
			"fill": "#B0B0B0",
			"font-family": "Helvetica",
			"font-size": "13px"
		}
		
		$("#highestPrice")
		.text("- " + String(highestPrice.phase.high))
		.attr('x', highestPrice.pos.middle)
		.attr('y', highestPrice.pos.topLeg - 2)
		.attr(fontAttr)
		
		$("#lowestPrice")
		.text("- " + String(lowestPrice.phase.low))
		.attr('x', lowestPrice.pos.middle)
		.attr('y', lowestPrice.pos.bottomLeg + 2)
		.attr(fontAttr)
	
	}
	
	
	function getPoint(value) 
	{
		var val = null;
		var points = curChart.visiblePhases;
		points = curChart.pointData;

		if (value >= points[points.length-1].pos.left)
		{
			val = points[points.length-1]
		}
		else if (value <= points[0].pos.left)
		{
			val = points[0]
		}
		else
		{
			for (var i = 0; i < points.length; i++) 
			{
				point = points[i]
				//console.log(point)
				if ( point.pos.left >= value) 
				{
					val = points[i-1]
					break;
				}
			}
		}
		
		//console.log(value)
		//console.log(val)
		//console.log(points)
		return val;
	}
	
	
	$("#chartwrap").on('mousewheel DOMMouseScroll', function(e)
	{
		if (!xAxis)
			return
		
		e.preventDefault();
		
		if ("type" in e && e.type == "DOMMouseScroll")
		{
			var wheelDeltaY = e['originalEvent']['detail'] > 0 ? -1 : 1;
			var clientX = e['originalEvent']['clientX'];
			var clientY = e['originalEvent']['clientY'];
		}
		else
		{
			var wheelDeltaY = e.originalEvent.wheelDeltaY;
			var clientX = e['clientX'];
			var clientY = e['clientY'];
		}
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = $("#ex_chart").offset().left;
		var offsetY = $("#ex_chart").offset().top;
		var insideX = mouseX - offsetX
		var insideY = mouseY - offsetY
		var height = xAxis.pos['bottom'];
		var width = priceAxis.pos['left']; //+ priceAxis.width
		
		//console.log(String(e.pageY) + "  " + String(offsetY));
		
		if ( insideY >= 0 && insideY <= height 
			&& insideX >= 0 && insideX <= width)
		{
			if (insideY >= priceAxis.padding.top && insideY <= priceAxis.pos.bottom
				&& insideX >= xAxis.padding.left && insideX <= xAxis.pos.right)
			{
				//var insidePriceY = insideY - priceAxis.padding.top;
				var isZoomOut = wheelDeltaY <= 0;
				//console.log(clientX)
				//console.log(clientY)
				//console.log(wheelDeltaY)
				zoomChart(isZoomOut);
			}
		}
	})


	var prevIndex = -1;
				
    $(document).on("mousemove", function(e)
    {
		if (!xAxis)
			return
		
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = $("#ex_chart").offset().left;
		var offsetY = $("#ex_chart").offset().top;
		var insideX = mouseX - offsetX
		var insideY = mouseY - offsetY

		var height = xAxis.pos['bottom'];
		var width = priceAxis.pos['left']; //+ priceAxis.width
		
		//console.log(String(e.pageY) + "  " + String(offsetY));
		
		if ( insideY >= 0 && insideY <= height 
			&& insideX >= 0 && insideX <= width)
		{
			//var insideTimeX = insideX - xAxis.padding.left;
			//var time = xAxis.getXVal(insideTimeX)
			//time = Math.floor(time)
			var closestPoint = getPoint(insideX)
			//console.log(closestPoint.phase.high)
			//console.log(new Date(closestPoint.phase.endTime))
			var index = curChart.visiblePhases.indexOf(closestPoint.phase)
			//console.log(index)
			var marketInfoText = 
			//"Date: " + String("a") + 
			"Open: " + closestPoint.phase.open + 
			"  High: " + closestPoint.phase.high + 
			"	Low: " + closestPoint.phase.low + 
			"  Close: " + closestPoint.phase.close + 
			"  Volume: " + closestPoint.phase.volu
			
			d3.select("#candleInfo")
			.text(marketInfoText)
			.attr("y", priceAxis.pos.top - 5)
			.attr("x", 10)
			.attr("fill", "#D3D3D3")
			.attr("font-family", "Helvetica")
			.attr("font-size", "13px")

			$("#cursor_follow_x")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", insideY + 0.5)
			.attr("y2", insideY + 0.5)
			.attr("stroke-width", 1)
			.attr("stroke", "#D3D3D3");
			
			if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom)
			{
				var insidePriceY = insideY - priceAxis.pos.top;
				var price = priceAxis.getPriceFromY(insidePriceY)
				price = price.toFixed(2)
				
				$("#cursor_follow_price")
				.text(price)
				.attr("y", insideY + 5)
				.attr("x", priceAxis.pos.left + 5)
				.attr("fill", "#D3D3D3")
				.attr("font-family", "Helvetica")
				.attr("font-size", "13px")

				
				var volrect = d3.select("#cursor_follow_price").node().getBBox();
				d3.select("#backbox_price")
				.attr("x", priceAxis.pos.left)
				.attr("y", volrect.y)
				.attr("width", priceAxis.width)
				.attr("height", volrect.height)
				.attr("fill", "black")
				.attr("stroke", "white")
				.attr("stroke-width", 1);
			}
			else
			{
				//hideRenders()
				$("#cursor_follow_price").text(""); 
				$("#backbox_price").attr("width", 0);
			}
			
			
			if (insideY >= volAxis.pos.top && insideY <= volAxis.pos.bottom)
			{
				var insideVolY = insideY - volAxis.pos.top;
				var vol = volAxis.getPriceFromY(insideVolY)
				vol = vol.toFixed(2)
				
				$("#cursor_follow_vol")
				.text(vol)
				.attr("y", insideY + 5)
				.attr("x", volAxis.pos.left + 5)
				.attr("fill", "#D3D3D3")
				.attr("font-family", "Helvetica")
				.attr("font-size", "13px")

				
				var volrect = d3.select("#cursor_follow_vol").node().getBBox();
				d3.select("#backbox_vol")
				.attr("x", volAxis.pos.left)
				.attr("y", volrect.y)
				.attr("width", volAxis.width)
				.attr("height", volrect.height)
				.attr("fill", "black")
				.attr("stroke", "white")
				.attr("stroke-width", 1);
			}
			else
			{
				$("#cursor_follow_vol").text(""); 
				$("#backbox_vol").attr("width", 0);
			}
			
			if (index != prevIndex && index >= 0) //&& (closestTime % pointRange <= pointRange/2))
			{
				prevIndex = index;

				$("#cursor_follow_y")
				//.attr("x1", insideX + 0.5)
				//.attr("x2", insideX + 0.5)
				.attr("x1", closestPoint.pos.middle)
				.attr("x2", closestPoint.pos.middle)
				.attr("y1", 0)
				.attr("y2", height)
				.attr("stroke-width", 1)
				.attr("stroke", "#D3D3D3");
				
				if (insideX >= xAxis.pos.left && insideX <= xAxis.pos.right)
				{
					var insideTimeX = insideX - xAxis.pos.left;
					var time = xAxis.getXVal(insideTimeX)
					time = Math.floor(time)
					time = IDEX.formatTimeDate(new Date(time))
					
					var formattedXPos = insideX - 55
					
					$("#cursor_follow_time")
					//.text(time)
					.text(IDEX.formatTimeDate(new Date(closestPoint.phase.startTime)))
					.attr("y", xAxis.pos.top + 15)
					.attr("x", insideX - 37)
					.attr("fill", "#D3D3D3")
					.attr("font-family", "Helvetica")
					.attr("font-size", "12px")
					
					var timerect = d3.select("#cursor_follow_time").node().getBBox();
					d3.select("#backbox_time")
					.attr("x", formattedXPos)
					.attr("y", xAxis.pos.top)
					.attr("width", 110)
					.attr("height", xAxis.height)
					.attr("fill", "black")
					.attr("stroke", "white")
					.attr("stroke-width", 0.5);
				}
				else
				{
					prevIndex = -1;
					$("#cursor_follow_time").text(""); 
					$("#backbox_time").attr("width", 0);
					//hideRenders()
				}
			}
		}
		else
		{
			prevIndex = -1;
			hideRenders();
		}

		if(isDragging)
		{
			var insideTimeX = insideX - xAxis.pos.left;
			var diff = insideTimeX - draggingPos;
			var direction = diff < 0
			diff = Math.abs(diff)
			
			if (diff != 0 && diff > xAxis.xStep)
			{
				//console.log("insideTimeX: " + String(insideTimeX))
				//console.log(draggingPos)
				//console.log(diff)
				//console.log(direction)
				
				var shifts = Math.floor(diff / xAxis.xStep)
				//console.log(shifts)
				draggingPos = insideTimeX
				shiftXAxis(shifts, direction)
				resizeAxis();
				redraw()
			}
		}
    });
	
	
    $("#ex_chart").mousedown(function(e) 
    {
		if (!xAxis)
			return
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = $("#ex_chart").offset().left;
		var offsetY = $("#ex_chart").offset().top;
		var insideX = mouseX - offsetX
		var insideY = mouseY - offsetY

		var height = xAxis.pos['bottom'];
		var width = priceAxis.pos['left']; //+ priceAxis.width
		
		
		if (insideY >= 0 && insideY <= height 
			&& insideX >= 0 && insideX <= width)
	    {
			if (insideY >= priceAxis.padding.top && insideY <= priceAxis.pos.bottom
				&& insideX >= xAxis.pos.left && insideX <= xAxis.pos.right)
			{
				$(this).css("cursor", "move");
				//console.log(e)
			    isDragging = true;
			    draggingPos = insideX - xAxis.pos.left;
			}
	    }
    })
	
    $("#ex_chart").mouseup(function(e) 
	{
		$(this).css("cursor", "default");
	    isDragging = false;
    })

	function priceSeriesLine()
	{
		$("#seriesLine").empty();
		
		var lineAttr = {
			"stroke-width": 1,
			"stroke": "#404040"
		}
		var bbox = d3.select("#ex_chart")[0][0].getBoundingClientRect()	
		//console.log(bbox)
		
		//priceaxis
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", priceAxis.pos['bottom'] + 0.5)
		.attr("y2", priceAxis.pos['bottom'] + 0.5)
		.attr(lineAttr)
		
		d3.select("#seriesLine").append("line")
		.attr("x1", priceAxis.pos['left'] + 0.5)
		.attr("x2", priceAxis.pos['left'] + 0.5)
		.attr("y1", 0)
		.attr("y2", priceAxis.pos['bottom'])
		.attr(lineAttr)
		
		//volaxis
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", volAxis.pos['bottom'] + 0.5)
		.attr("y2", volAxis.pos['bottom'] + 0.5)
		.attr(lineAttr)
		
		d3.select("#seriesLine").append("line")
		.attr("x1", volAxis.pos['left'] + 0.5)
		.attr("x2", volAxis.pos['left'] + 0.5)
		.attr("y1", 0)
		.attr("y2", volAxis.pos['bottom'])
		.attr(lineAttr)
		
		//xaxis
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", xAxis.pos['top'] + 0.5)
		.attr("y2", xAxis.pos['top'] + 0.5)
		.attr(lineAttr)
		
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", xAxis.pos['bottom'] + 0.5)
		.attr("y2", xAxis.pos['bottom'] + 0.5)
		.attr(lineAttr)
	}
	
	function hideRenders()
	{
		$("#cursor_follow_x").attr("stroke-width", 0);
		$("#cursor_follow_y").attr("stroke-width", 0);
		$("#cursor_follow_time").text("");
		$("#cursor_follow_price").text(""); 
		$("#backbox_time").attr("width", 0);
		$("#backbox_price").attr("width", 0);
		$("#cursor_follow_vol").text(""); 
		$("#backbox_vol").attr("width", 0);
		$("#candleInfo").text(""); 
	}
	

	var slip = 0
	function resize()
	{
		if (slip == 0)
		{
			d3.selectAll("#boxes path").attr("transform", "scale(1,0.7)")
			d3.select("#yAxisLabels").attr("transform", "scale(1,0.7)")
		}
		else
		{
			d3.selectAll("#boxes path").attr("transform", "scale(1,1)")
			d3.select("#yAxisLabels").attr("transform", "scale(1,1)")
		}
		
		slip = 1 - slip;
		
		var bb = $("#boxes")[0].getScreenCTM();
		var cc = d3.select("#boxes")[0][0].getCTM();
		var bbox = d3.select("#boxes").node().getBBox();
		console.log(bb)
		console.log(bbox)
	}

	
	function transformSVG(element, m) 
	{
		return element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m));
	};
	
	var line;
	var isDrawing = false;

	/*var vis = d3.select("#ex_chart")
		.on("mousedown", mousedown)
		.on("mouseup", mouseup)
		.on("mousemove", mousemove);*/

	//$("chartwrap").mousedown(function(){
	function mousedown()
	{
		var lineAttr = {
			"stroke-width": 1,
			"stroke": "#404040"
		}
		
		var m = d3.mouse(this);
		line = vis.append("line")
		.attr("x1", m[0])
		.attr("y1", m[1])
		.attr("x2", m[0])
		.attr("y2", m[1])
		.attr(lineAttr);
		isDrawing = true
	}

	function mousemove() 
	{
		if (isDrawing)
		{
			var m = d3.mouse(this);
			line.attr("x2", m[0])
				.attr("y2", m[1]);
	
		}
	}

	function mouseup() 
	{
		isDrawing = false;
	}
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));


$(window).load(function() 
{
    IDEX.init();

})




/*
	//console.log(new Date((Math.log(time) / Math.LN10) -  * xAxis.min));

	var a = []
	for (var i = 0; i < curChart.visiblePhases.length; i++)
	{
		var phase = curChart.visiblePhases[i];
		var times = phase.startTime;
		a.push(times)
	}
	var o = d3.scale.ordinal()
	.domain(a)
	//.range([a[0], a[a.length - 1]]);
	//.rangePoints([a[0], a[a.length - 1]]);
	.rangePoints([0, xAxis.width]);


	console.log(o.range())
	console.log(a)
	
	var axis = d3.svg.axis().scale(o)
	if ( x == 0 )
		
		d3.select("#a").append("g").call(axis)
	x = 1
			
			
	var iss = 0
	$("#clickme").on("click", function()
	{
		if (iss == 0)
		{
			d3.selectAll("#boxes path").attr("transform", "scale(1,0.7)")
			d3.select("#yAxisLabels").attr("transform", "scale(1,0.7)")
		}
		else
		{
			d3.selectAll("#boxes path").attr("transform", "scale(1,1)")
			d3.select("#yAxisLabels").attr("transform", "scale(1,1)")
		}
		
		iss = 1 - iss;
		
		var bb = $("#boxes")[0].getScreenCTM();
		var cc = d3.select("#boxes")[0][0].getCTM();
		var bbox = d3.select("#boxes").node().getBBox();
		console.log(bb)
		console.log(bbox)
	})
	
*/
