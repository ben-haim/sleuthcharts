var IDEX = (function(IDEX, $, undefined) 
{   
	var GENESIS_TIMESTAMP = 1385294400;
    var nxtURL = "http://127.0.0.1:7876/nxt?";
	var curChart;
	var xAxis;
	var priceAxis;
	var volumeAxis;

    var isDragging = false;
	var skynetKeysTick = [2,3,4,5,6]
	var skynetKeys = [3,4,5,6,7]

    IDEX.init = function()
    {
		curChart = new IDEX.Chart();
    }
	
	IDEX.SkyNETParams = function(obj) 
	{
		this.baseurl = "http://api.finhive.com/v1.0/run.cgi?";
		this.key = "9cf373ead4858e19bf93ae5ea238c4c796819cc883c877513f528b95721a1085";
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
        obj['section'] = "crypto";
        obj['run'] = "quotes";
        obj['mode'] = "bars";
        obj['exchg'] = "nxtae";
        obj['pair'] = id+"_NXT";
        obj['num'] = "600"
        obj['bars'] = "tick"
        obj['len'] = len
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
			
			ohlc.push(new IDEX.OHLC([pointDate, endTime, open, high, low, close]))
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
			"widthInit":"90%",
			
			"padding":{
				"top":50,
				"left":10,
			},
			
			"numTicks":8,
			"tickLength":4,
			"containerID":"xAxisLabels",
			"isXAxis":true,
		}
		var priceAxisOpt = {
			"chart":curChart,
			"heightInit":"60%",
			"widthInit":50,
			
			"padding":{
				"top":50,
				"left":20,
			},
			
			"minPadding":0.1,
			"maxPadding":0.05,
			
			"numTicks":7,
			"tickLength":7,
			"containerID":"yAxisLabels",
		}
		
		xAxis = new IDEX.Axis(xAxisOpt);
		priceAxis = new IDEX.Axis(priceAxisOpt)
		
		xAxis.resize()
		priceAxis.resize()
		
		var candleSeriesOpt = {
			"xAxis":xAxis,
			"yAxis":priceAxis,
		};
		var candleSeries = new IDEX.Series(candleSeriesOpt)
		
		candleSeries.height = candleSeries.yAxis.height;
		candleSeries.width = candleSeries.xAxis.width;
		candleSeries.pos['left'] = candleSeries.xAxis.pos['left'];

		priceAxis.pos['top'] = priceAxis.padding['top'];
		priceAxis.pos['bottom'] = priceAxis.pos['top'] + priceAxis.height;
		priceAxis.pos['left'] = xAxis.pos['left'] + xAxis.width + priceAxis.padding['left'];
		priceAxis.pos['right'] = priceAxis.pos['left'] + priceAxis.width;
		
		xAxis.pos['top'] = priceAxis.padding['top'] + priceAxis.height + xAxis.padding['top'];
		xAxis.pos['bottom'] = xAxis.pos['top'] + xAxis.height;
		xAxis.pos['left'] = xAxis.padding['left'];
		xAxis.pos['right'] = xAxis.pos['left'] + xAxis.width;
		
		console.log(xAxis)
		console.log(priceAxis)
		
	}
	
	function redraw()
	{
		calcPointWidth();
		drawCandleSticks();
		makePriceAxisLabels();
		makeTimeAxisLabels();
		priceSeriesLine();
	}
	
	function updateChart()
	{
        var params = {"requestType":"getTrades","asset":"15344649963748848799"};
		var barWidth = Number($("input[name=time_width]:checked").val());
		
		getData({}, barWidth).done(function(data)
		{
			console.log(data)
			var both = getStepOHLC(data.results);
			var ohlc = both[0]
			var vol = both[1]
			//console.log(both)
			//console.log(data)
			
			makeChart()
			
			curChart.barWidth = barWidth
			curChart.phases = ohlc

			calcPointWidth();
			drawCandleSticks();
			makePriceAxisLabels();
			makeTimeAxisLabels();
			priceSeriesLine();
		})
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
		
		xAxis.resize()
		priceAxis.resize()
		
		priceAxis.pos['top'] = priceAxis.padding['top'];
		priceAxis.pos['bottom'] = priceAxis.pos['top'] + priceAxis.height;
		priceAxis.pos['left'] = xAxis.pos['left'] + xAxis.width + priceAxis.padding['left'];
		priceAxis.pos['right'] = priceAxis.pos['left'] + priceAxis.width;
		
		xAxis.pos['top'] = priceAxis.padding['top'] + priceAxis.height + xAxis.padding['top'];
		xAxis.pos['bottom'] = xAxis.pos['top'] + xAxis.height;
		xAxis.pos['left'] = xAxis.padding['left'];
		xAxis.pos['right'] = xAxis.pos['left'] + xAxis.width;
		
		redraw()
	})

	
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
	

	function calcPointWidth()
	{
		var minWidth = 1;
		var padding = 1.5;
	    var width = Math.floor(xAxis.width / curChart.phases.length)
		width = width < minWidth ? minWidth : width;
		if (width > 3) padding = 2;
		if (width >= 5) padding = 3.5;
		if (width >= 10) padding = 5;
		if (width >= 20) padding = 10;
		if (width >= 100) padding = 20;
		
		xAxis.xStep = width + padding;
		xAxis.pointWidth = width;
		xAxis.pointPadding = padding;
		xAxis.numPoints = Math.floor(xAxis.width / xAxis.xStep);
		//console.log(String(xAxis.xStep) + "    " + String(xAxis.width) + String(xAxis.numPoints));
		curChart.visiblePhases = curChart.phases.slice((curChart.phases.length ) - xAxis.numPoints);
		
		xAxis.dataMin = curChart.phases[0].startTime;
		xAxis.dataMax = curChart.phases[curChart.phases.length-1].endTime
		xAxis.min = curChart.visiblePhases[0].startTime;
		xAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1].startTime
		
		//console.log(curChart.visiblePhases)
		
		var priceMinMax = getMinMax(curChart.visiblePhases)
		priceAxis.min = priceMinMax[1]
		priceAxis.max = priceMinMax[0]
		console.log("bar width:" + String(width))
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
			console.log("curmin: " + String(curMin))
			console.log("diff: " + String(diff))
			console.log("newMin: " + String(newMin))
			console.log("dataMax: " + String(dataMax))
			console.log("dataMin: " + String(dataMin))
		}
		else
		{
			var newMin = (curMin+diff < curMax) ? curMin+diff : curMin;
		}
		
		redrawXAxis(newMax, newMin)
		drawCandleSticks();
		makePriceAxisLabels();
		makeTimeAxisLabels();
		priceSeriesLine();
	}
	
	function redrawXAxis(newMax, newMin)
	{
		for (var i = 0; i < curChart.phases.length; i++)
		{
			var phase = curChart.phases[i];
			
			if ( phase.startTime >= newMin)
			{
				break;
			}
		}
		
		curChart.visiblePhases = curChart.phases.slice(i);
		xAxis.min = curChart.visiblePhases[0].startTime;
		xAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1].startTime
		//console.log(curChart.visiblePhases);
		
		var priceMinMax = getMinMax(curChart.visiblePhases)
		priceAxis.min = priceMinMax[1]
		priceAxis.max = priceMinMax[0]
		
		var minWidth = 1;
		var padding = 1.5;
	    var width = Math.floor(xAxis.width / curChart.visiblePhases.length)
		width = width < minWidth ? minWidth : width;
		if (width > 3) padding = 2;
		if (width >= 5) padding = 3.5;
		if (width >= 10) padding = 5;
		if (width >= 20) padding = 10;
		if (width >= 100) padding = 20;
		//console.log(String(xAxis.xStep) + "    " + String(xAxis.width) + String(xAxis.numPoints));	
		console.log("bar width:" + String(width))	
		xAxis.xStep = width + padding;
		xAxis.pointWidth = width;
		xAxis.pointPadding = padding;
		xAxis.numPoints = Math.floor(xAxis.width / xAxis.xStep);
	}
	

    function drawCandleSticks()
    {
	    $("#boxes").empty();
	    $("#volbars").empty();
	    $("#axis").empty();

		var xStart = xAxis.pos.left;
		var xPos = xStart;
		var phases = curChart.visiblePhases;
		var phasesLength = phases.length;

		console.log(curChart)
		var a = Date.now()
		//console.log(xAxis)
		var allPhases = []
	    for (var i = 0; i < phasesLength; i++)
		{
			var phase = phases[i];
			var closedHigher = phase.close > phase.open;
			var top = closedHigher ? phase.close : phase.open;
			var bottom = closedHigher ? phase.open : phase.close;
			
			var strokeColor = closedHigher ? "#6c6" : "#d00";
			var fillColor = closedHigher ?  "black" : "#a80808";

		    //var midline = priceAxis.getPos(phase.averagePrice);
		    var bottomBody = priceAxis.getPos(bottom);
		    var bottomLeg = priceAxis.getPos(phase.low);
		    var topBody = priceAxis.getPos(top);
		    var topLeg = priceAxis.getPos(phase.high);
			
			var left = xPos;
			var right = left + xAxis.pointWidth;
			var xMiddle = (left + right) / 2;
			//console.log(String(left) + " " + String(right) + " " + String(xMiddle))
			if (bottomBody - topBody < 1)
			{
				bottomBody += 0.5;
				topBody -= 0.5;
			}
			
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
			
			allPhases.push({"phase":phase, "pos":positions})
			
			var box = d3.select("#boxes").selectAll("path")
			.data(allPhases)
			.enter()
			.append("path")
			.attr("d", d.join(" "))
			.attr("fill", fillColor)
			.attr("stroke", strokeColor)
			.attr("stroke-width", "1")
			.attr('shape-rendering', "crispEdges")
			
		    xPos += xAxis.xStep;
	    }
		curChart.pointData = allPhases;
		
		//console.log(Date.now() - a)	
    }

	
	function getMinMax(phases)
	{
		var high = 0;
		var low = 0;
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				low = phases[i].low;
				high = phases[i].high;
			}
			else
			{
				low = phases[i].low < low ? phases[i].low : low;
				high = phases[i].high > high ? phases[i].high : high;
			}
		}
		return [high, low];
	}
	
	function makePriceAxisLabels()
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

	function makeTimeAxisLabels()
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

	    for(var i = 0; i < xAxis.numTicks; i++)
	    {
			if (i == 0 || i == xAxis.numTicks - 1)
				continue
			
			var label = {};
			label.text = formatTime(new Date(firstTick + (i * tickInterval)))
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

	function formatTimeDate(d)
	{
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
		  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];
		//console.log(d)
		var month = monthNames[d.getMonth()]
		var day = d.getDate()
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return month + ". " + day + " " + hours + ":" + minutes
	}
	
	function formatTime(d)
	{
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
		  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];
		//console.log(d)
		var month = monthNames[d.getMonth()]
		var day = d.getDate()
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return month + ". " + day 
	}
	

    $("#ex_chart").mousedown(function(e) 
    {
	    offsetX = $("#ex_chart").offset().left;
	    offsetY = $("#ex_chart").offset().top;
	    var xval = Math.round(e.pageX-offsetX);
	    var yval = Math.round(e.pageY-offsetY);
		
	    if(yval > 650 && yval < 0 && xval > 0 && xval < 1200)
	    {
		    var timespan = $("input[name=time_span]:checked").val();
		    if(timespan == 0) timespan = getNxtTime() - first;
		    var chwidth = timespan/(getNxtTime()-first)*1200;
		    if(xval < scrollpos && xval > scrollpos-chwidth && getNxtTime()-first > timespan)
		    {
			    isDragging = true;
			    draggingPos = xval-scrollpos+chwidth;
		    }
	    }
    })

	
	
	function priceSeriesLine()
	{
		$("#seriesLine").empty();
		
		var bbox = d3.select("#ex_chart")[0][0].getBoundingClientRect()	
		//console.log(bbox)
		
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", priceAxis.pos['bottom'] + 0.5)
		.attr("y2", priceAxis.pos['bottom'] + 0.5)
		.attr("stroke-width", 1)
		.attr("stroke", "#737373");
		
		d3.select("#seriesLine").append("line")
		.attr("x1", priceAxis.pos['left'] + 0.5)
		.attr("x2", priceAxis.pos['left'] + 0.5)
		.attr("y1", 0)
		.attr("y2", priceAxis.pos['bottom'])
		.attr("stroke-width", 1)
		.attr("stroke", "#737373");
		
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", xAxis.pos['top'] + 0.5)
		.attr("y2", xAxis.pos['top'] + 0.5)
		.attr("stroke-width", 1)
		.attr("stroke", "#737373");
		
		d3.select("#seriesLine").append("line")
		.attr("x1", 0 )
		.attr("x2", bbox.right)
		.attr("y1", xAxis.pos['bottom'] + 0.5)
		.attr("y2", xAxis.pos['bottom'] + 0.5)
		.attr("stroke-width", 1)
		.attr("stroke", "#737373");
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
				console.log(wheelDeltaY)
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
			
			$("#cursor_follow_x")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", insideY + 0.5)
			.attr("y2", insideY + 0.5)
			.attr("stroke-width", 1)
			.attr("stroke", "#D3D3D3");
			
			if (insideY >= priceAxis.padding.top && insideY <= priceAxis.pos.bottom)
			{
				var insidePriceY = insideY - priceAxis.padding.top;
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
				hideRenders()
				//$("#cursor_follow_price").text(""); 
				//$("#backbox_price").attr("width", 0);
			}
			
			if (index != prevIndex && index >= 0) //&& (closestTime % pointRange <= pointRange/2))
			{
				prevIndex = index;

				$("#cursor_follow_y")
				//.attr("x1", insideX + 0.5)
				//.attr("x2", insideX + 0.5)
				.attr("x1", closestPoint.pos.middle + 0.5)
				.attr("x2", closestPoint.pos.middle + 0.5)
				.attr("y1", 0)
				.attr("y2", height)
				.attr("stroke-width", 1)
				.attr("stroke", "#D3D3D3");
				
				
				if (insideX >= xAxis.padding.left && insideX <= xAxis.width + xAxis.padding.left)
				{
					var insideTimeX = insideX - xAxis.padding.left;
					var time = xAxis.getXVal(insideTimeX)
					time = Math.floor(time)
					time = formatTimeDate(new Date(time))
					
					var formattedXPos = insideX - 55
					
					$("#cursor_follow_time")
					//.text(time)
					.text(formatTimeDate(new Date(closestPoint.phase.startTime)))
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
					//$("#cursor_follow_time").text(""); 
					//$("#backbox_time").attr("width", 0);
					hideRenders()

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
			var xval = Math.round(e.pageX-offsetX);
			var yval = Math.round(e.pageY-offsetY);

			var timespan =  $("input[name=time_span]:checked").val();
			if(timespan == 0) timespan = getNxtTime() - first;
			var chwidth = timespan/(getNxtTime()-first)*1200;
			var newpos = xval-draggingPos;
			if(newpos < 0) newpos = 0;
			if(newpos+chwidth > 1200) newpos = 1200-chwidth;
			d3.select("#scroll").attr("x", newpos);
			scrollpos = newpos+chwidth;
			draw();
		}
    });
	
	
	function hideRenders()
	{
		$("#cursor_follow_x").attr("stroke-width", 0);
		$("#cursor_follow_y").attr("stroke-width", 0);
		$("#cursor_follow_time").text("");
		$("#cursor_follow_price").text(""); 
		$("#backbox_time").attr("width", 0);
		$("#backbox_price").attr("width", 0);
	}
	

	function convertNXTTime(timestamp)
	{
		return timestamp + GENESIS_TIMESTAMP
	}
	
	IDEX.constructFromObject = function(classInstance, obj)
	{
		if (obj)
		{
			for (var key in obj)
			{
				classInstance[key] = obj[key];
			}
		}
		
		return classInstance
	}
	
    function sendAjax(params) 
    {
	    var dfd = new $.Deferred();
	    var url = nxtURL
        console.log(params)
	    $.ajax
	    ({
	      type: "POST",
	      url: url,
	      data: params,
	      //contentType: 'application/json'
	    }).done(function(data)
	    {
		    data = $.parseJSON(data);
		    dfd.resolve(data);
		
	    }).fail(function(data)
	    {
		    console.log(params);
		    dfd.reject(data);
	    })

	    return dfd.promise();
    }

	function transformSVG(element, m) 
	{
		return element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m));
	};
	
	
    $(document).mouseup(function(e) 
	{
	    isDragging = false;
    })
	
	
	
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
