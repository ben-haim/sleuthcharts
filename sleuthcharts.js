var IDEX = (function(IDEX, $, undefined) 
{   
	var GENESIS_TIMESTAMP = 1385294400;
    var nxtURL = "http://127.0.0.1:7876/nxt?";
	var curChart;
	var timeAxis;
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
        obj['num'] = "400"
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
			console.log(both)
			console.log(data)
			makeChart()
			//updateHeightWidth();
			
			curChart.barWidth = barWidth
			curChart.phases = ohlc

			calcPointWidth();
			drawCandleSticks();
			makePriceAxisLabels();
			makeTimeAxisLabels();
		})
	}

	$(window).resize(function()
	{
		var height = $("#chartWrap").height();
		var width = $("#chartWrap").width();
	})
	
	function updateHeightWidth()
	{
		var bbox = d3.select("#ex_chart")[0][0].getBoundingClientRect()
		mainChartHeight = bbox.height;
		mainChartWidth = bbox.width;
		console.log(bbox)
	}

	function calcPointWidth()
	{
		var minWidth = 1;
		var padding = 2.5;
	    var width = timeAxis.width / curChart.phases.length
		width = width < minWidth ? minWidth : width;
		
		if (width > 5) padding = 3.5;
		if (width > 10) padding = 5;
		if (width > 20) padding = 10;
		if (width > 100) padding = 20;
		
		timeAxis.xStep = width + padding;
		timeAxis.pointWidth = width;
		timeAxis.pointPadding = padding;
		timeAxis.numPoints = Math.round(timeAxis.width / timeAxis.xStep);
		//console.log(String(timeAxis.xStep) + "    " + String(timeAxis.width) + String(timeAxis.numPoints));
		curChart.visiblePhases = curChart.phases.slice((curChart.phases.length ) - timeAxis.numPoints);
		
		timeAxis.min = curChart.visiblePhases[0].startTime;
		timeAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1].endTime
		
		console.log(curChart.visiblePhases)
		
		var priceMinMax = getMinMax(curChart.visiblePhases)
		priceAxis.min = priceMinMax[1]
		priceAxis.max = priceMinMax[0]

	}


    function drawCandleSticks()
    {
	    $("#boxes").empty();
	    $("#volbars").empty();
	    $("#axis").empty();

		var xStart = timeAxis.left;
		var xPos = xStart;
		var phases = curChart.visiblePhases;
		var phasesLength = phases.length;

		console.log(curChart)
		var a = Date.now()
		console.log(timeAxis)
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
			var right = left + timeAxis.pointWidth;
			var xMiddle = (left + right) / 2;
			
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

			d3.select("#boxes").append("path")
			.attr("d", d.join(" "))
			.attr("fill", fillColor)
			.attr("stroke", strokeColor)
			.attr("stroke-width", "1")
			.attr('shape-rendering', "crispEdges")

			/*d3.select("#volbars").append("rect")
			.attr("fill", "gray")
			.attr("x", xPos)
			.attr("width", xStep)
			.attr("y", height-ht)
			.attr("height", ht);*/
		    xPos += timeAxis.xStep;
	    }
		
		console.log(Date.now() - a)	
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
		
		var priceLabels = [];
		var priceAxisPadding = 0;
		
		var firstPrice = priceAxis.min;
		var lastPrice = priceAxis.max;
		var priceRange = lastPrice - firstPrice;
		var priceInterval = priceRange / priceAxis.numTicks;
		var yStart = priceAxis.bottom;
		var heightInterval = Math.round(priceAxis.height / priceAxis.numTicks);
		var xPos = priceAxis.left + priceAxisPadding;
		
	    for (var i = 0; i < priceAxis.numTicks + 1; i++)
	    {
			var priceLabel = {};

			priceLabel.text = String(Math.round(firstPrice + (i * priceInterval)));
			priceLabel.y = yStart - (i * heightInterval);
			priceLabel.x = xPos;
			//console.log(priceLabel.y)
			priceLabels.push(priceLabel);
		}

		var SVGPriceLabels = d3.select("#yAxisLabels").selectAll("text")
		.data(priceLabels)
		.enter()
		.append("text")
		
		SVGPriceLabels.attr("x", function (d) { return d.x })
		.attr("y", function (d) { return d.y })
		.text(function (d) { return d.text })
		.attr("fill", "white");
	}

	function makeTimeAxisLabels()
	{
		$("#xAxisLabels").empty();
		var labels = [];
		
		var firstTick = timeAxis.min;
		var lastTick = timeAxis.max;
		var axisRange = lastTick - firstTick;
		var tickInterval = axisRange / timeAxis.numTicks;
		
		var xStart = timeAxis.left;
		var xInterval = timeAxis.width / timeAxis.numTicks;
		
		var yPos = timeAxis.bottom;

	    for(var i = 0; i < timeAxis.numTicks + 1; i++)
	    {
			var label = {};
			//console.log(new Date(firstTick + (i * tickInterval)).toJSON())
			label.text = firstTick + (i * tickInterval);
			label.x = xStart + (i * xInterval);
			label.y = yPos;
			labels.push(label);
			
	    }
		
		//var time = new Date((date + GENESIS_TIMESTAMP)*1000);
		
		var SVGTimeLabels = d3.select("#xAxisLabels").selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		
		SVGTimeLabels
		.attr("x", function (d) { return d.x })
		.attr("y", function (d) { return d.y })
		.text(function (d) { return d.text })
		.attr("fill", "white");
	}

	function formatTimeDate(d)
	{
		console.log(d)
		var month = d.getMonth()
		var day = d.getDate()
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return month+":"+day
	}
	
	function formatTime(d)
	{
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return hours+":"+minutes
	}
	
	
	var iss = 0
	$("h3").on("click", function()
	{
		if (iss == 0)
			d3.selectAll("#boxes path").attr("transform", "scale(0.5,1)")
		else
			d3.selectAll("#boxes path").attr("transform", "scale(1,1)")
		
		iss = 1 - iss;
		
		var bb = $("#boxes")[0].getScreenCTM();
		var cc = d3.select("#boxes")[0][0].getCTM();
		var bbox = d3.select("#boxes").node().getBBox();
		console.log(bb)
		console.log(bbox)
	})

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

	
	function isInside(e)
	{
		var offset = $("#ex_chart").offset()
		var x = eX - chart.plotLeft - offset.left;
		var y = eY - chart.plotTop - offset.top;
		
		return chart.isInsidePlot(x, y);
		//var isInsideY = 
		
		//if(e.pageY - offsetY > 0 && e.pageY - offsetY <= height && e.pageX - offsetX > 0 && e.pageX - offsetX < 1200)

	}


    $(document).on("mousemove", function(e)
    {
		offsetX = $("#ex_chart").offset().left;
		offsetY = $("#ex_chart").offset().top;
		var width = 1000;
		var xscales = 100;
		var height = 700;
		var scale = 0;
		var volscale = 0;
		
		//console.log(String(e.pageY) + "  " + String(offsetY));
		
		if(e.pageY - offsetY > 0 && e.pageY - offsetY < height && e.pageX - offsetX > 0 && e.pageX - offsetX < 1200)
		{
			var xval = Math.floor(e.pageX - offsetX) + 0.5;
			var yval = Math.floor(e.pageY - offsetY) + 0.5;
			
			$("#cursor_follow_x").attr("x1", 0)
			.attr("x2", width)
			.attr("y1", yval)
			.attr("y2", yval)
			.attr("stroke-width", 1)
			.attr("stroke", "white");

			$("#cursor_follow_y")
			.attr("y1", 0)
			.attr("y2", height)
			.attr("x1", xval)
			.attr("x2", xval)
			.attr("stroke-width", 1)
			.attr("stroke", "white");

			
			var pc = (height-yval)/scale+0;
			pc = Math.round(pc * Math.pow(10, -Math.floor(Math.log10(pc)-2)))/Math.pow(10, -Math.floor(Math.log10(pc)-2));

			$("#cursor_follow_price").attr("y", yval-2).attr("x", width+xscales+10).text(pc);
			
			var volrect = d3.select("#cursor_follow_price").node().getBBox();
			d3.select("#backbox_price").attr("x", volrect.x).attr("y", volrect.y)
			.attr("width", volrect.width).attr("height", volrect.height)
			.attr("fill", "white")
		}
		else
		{
			$("#cursor_follow_x").attr("stroke-width", 1);
			$("#cursor_follow_y").attr("stroke-width", 1);
			$("#cursor_follow_vol").text("");
			$("#cursor_follow_price").text(""); 
			$("#backbox_vol").attr("width", 0);
			$("#backbox_price").attr("width", 0);
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
