var IDEX = (function(IDEX, $, undefined) 
{   
	var GENESIS_TIMESTAMP = 1385294400;
    var nxtURL = "http://127.0.0.1:7876/nxt?";
	var curChart;
	var timeAxis;
	var priceAxis;
	var volumeAxis;

    var isDragging = false;
	
	
	
	
    IDEX.init = function()
    {
		curChart = new IDEX.Chart();
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
	
	IDEX.Axis = function(obj) 
	{
		this.height = 0;
		this.width = 0;
		
		this.top = 0;
		this.left = 0;
		this.bottom = 0;
		this.right = 0;
		this.padding = [];
		
		this.dataMin = 0;
		this.dataMax = 0;
		this.min = 0;
		this.max = 0;
		
		this.numTicks = 0;
		this.tickInterval = 0;
		
		this.labels = [];
		this.tickPositions = [];

		IDEX.constructFromObject(this, obj);
	}
	
	IDEX.Axis.prototype.getPos = function(pointValue)
	{
		var ratio = pointValue / curChart.maxPrice;
		var pos = Number((this.bottom - (ratio * this.height)).toFixed(4))
		//console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
		return pos
	}
	
	
    $("input[name=time_width]").change(function()
    {
	    updateChart();
    });
	
	
	function updateChart()
	{
        var params = {"requestType":"getTrades","asset":"17554243582654188572"};
		
        sendAjax(params).done(function(data)
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
			//updateHeightWidth();
			
			curChart.barWidth = Number($("input[name=time_width]:checked").val());
			curChart.tradeData = data.trades;
			
			formatChartData();
			groupData();
			getPhaseData();
			calcPointWidth();
			drawCandleSticks();
			makePriceAxisLabels();
			makeTimeAxisLabels();
        })
	}

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
		timeAxis.numPoints = timeAxis.width / timeAxis.xStep;
		//console.log(String(timeAxis.xStep) + "    " + String(timeAxis.width) + String(timeAxis.numPoints));
		curChart.visiblePhases = curChart.phases.slice((curChart.phases.length - 1) - timeAxis.numPoints);
		timeAxis.min = curChart.visiblePhases[0].timestamp;
		timeAxis.max = curChart.visiblePhases[curChart.visiblePhases.length-1]

	}
	
	function formatChartData()
	{
		curChart.startTime = convertNXTTime(curChart.tradeData[curChart.tradeData.length-1].timestamp)
		curChart.endTime = Math.floor(Date.now() / 1000);
		curChart.maxTimespan = curChart.endTime - curChart.startTime;
		curChart.visibleTimespan = (curChart.visibleTimespan == 0) ? curChart.maxTimespan : curChart.visibleTimespan
		curChart.numBars = Math.round(curChart.maxTimespan / curChart.barWidth);
	}
	

	function groupData()
	{
		var phase = new IDEX.phaseData();
		var len = curChart.tradeData.length;
		var phaseEnd = curChart.startTime + curChart.barWidth;
		curChart.tradeData.reverse();

	    for (var i = 0; i < len; i++)
	    {
		    var trade = curChart.tradeData[i];
			var timestamp = convertNXTTime(trade.timestamp)
			//console.log(String(phaseEnd) + "  " + String(trade.timestamp))

			trade.price = trade.priceNQT/Math.pow(10, 8 - trade.decimals);
			trade.quantity = trade.quantityQNT/Math.pow(10, trade.decimals);
			

			if (timestamp <= phaseEnd)
			{
				trade.timestamp = timestamp
				phase.trades.push(trade)
				continue;
			}
			else
			{

				phase.startTime = phaseEnd - curChart.barWidth;
				phase.endTime = phaseEnd;
				curChart.phases.push(phase)
				phase = new IDEX.phaseData()
				phaseEnd += curChart.barWidth;
				i--;
			}
	    }
		//curChart.phases = phases;
	}
	
	function getPhaseData()
	{
		var allPhasesLength = curChart.phases.length;
	    //var minChange = -1;
		//var maxChange = -1;
	    //var minAveragePrice = -1;
		//var maxAveragePrice = -1;
		//var prevAverage = 0;
		var maxPrice = -1;
		var minPrice = -1;
		var maxVol = 0;
		
	    for (var i = 0; i < allPhasesLength; i++)
	    {
			var phase = curChart.phases[i];
			var phaseTradesLength = phase.trades.length;
			//var averagePrice = -1;

			for (var j = 0; j < phaseTradesLength; j++)
			{
				var phaseTrade = phase.trades[j];
				var price = phaseTrade.price;
				var quantity = phaseTrade.quantity;
				
				phase.open = j == 0 ? price : phase.open;
				phase.high = price > phase.high ? price : phase.high;
				phase.low = (price < phase.low || j == 0) ? price : phase.low;
				phase.close = (j == phaseTradesLength - 1) ? price : phase.close
				phase.volume += quantity*price;
				//averagePrice += price
			}
			if (!phaseTradesLength)
			{
				phase.open = phase.high = phase.low = phase.close = curChart.phases[i-1].close;
				phase.empty = true;
			}
			
			//averagePrice = averagePrice == -1 ? prevAverage : averagePrice;
			//averagePrice = averagePrice == 0 ? averagePrice : averagePrice / phaseTradesLength
			
			//minAveragePrice = minAveragePrice == -1 || averagePrice < minAveragePrice ? averagePrice : minAveragePrice
			//maxAveragePrice = maxAveragePrice == -1 || averagePrice > maxAveragePrice ? averagePrice : maxAveragePrice
			
			minPrice = (phase.low < minPrice || minPrice == -1) ? phase.low : minPrice;
			maxPrice = phase.high > maxPrice ? phase.high : maxPrice;
			maxVol = phase.totalVolume > maxVol ? phase.totalVolume : maxVol;

			//var change = (Math.round(((averagePrice/prevAverage)-1)*100)/100)*100

		    //var change = prevAverage == 0 ? 0 : averagePrice - prevAverage;
			//minChange = (change < minChange || change == -1) ? change : minChange;
			//maxChange = (change > maxChange || change == -1) ? change : maxChange;
			
			//phase.change = change;
		    //prevAverage = averagePrice;
			//phase.averagePrice = averagePrice
		}
		
		curChart.maxVol = maxVol;
		curChart.maxPrice = maxPrice;
		curChart.minPrice = minPrice;
		//curChart.maxAveragePrice = maxAveragePrice;
		//curChart.minAveragePrice = minAveragePrice;
		//curChart.maxChange = maxChange;
		//curChart.minChange = minChange;
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

	
	function getLabelByStep(start, end, numLabels )
	{
		
		
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
		
		var both = getMinMax(curChart.visiblePhases)
		var firstPrice = both[1];
		var lastPrice = both[0];
		var priceRange = lastPrice - firstPrice;
		var priceInterval = priceRange / priceAxis.numTicks;
		
		var yStart = priceAxis.height;
		var heightInterval = priceAxis.height / priceAxis.numTicks;
		
		var xPos = priceAxis.left + priceAxisPadding;
		
	    for (var i = 0; i < priceAxis.numTicks; i++)
	    {
			var priceLabel = {};

			priceLabel.text = String(firstPrice + (i * priceInterval));
			priceLabel.y = yStart - (i * heightInterval);
			priceLabel.x = xPos;
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
		
		var firstTick = curChart.startTime;
		var lastTick = curChart.endTime;
		var axisRange = lastTick - firstTick;
		var tickInterval = axisRange / timeAxis.numTicks;
		
		var xStart = 0;
		var xInterval = timeAxis.width / timeAxis.numTicks;
		
		var yPos = timeAxis.bottom;

	    for(var i = 0; i < timeAxis.numTicks + 1; i++)
	    {
			var label = {};
			
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

	
	function formatTime(d)
	{
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return hours+":"+minutes
	}
	
	
	function makeVolumeAxisLabels()
	{
		/*var volLabels = [];
		
		var firstVol = 0;
		var lastVol = curChart.maxVol;
		var volRange = lastVol - firstVol;
		var priceInterval = priceRange / numPriceAxisTicks;
		
		d3.select("#axis").append("text")
		.attr("id", "price_"+id)
		.attr("x", width+xscales+10)
		.attr("y", axisy-2)
		.text(priceText)
		.attr("fill", "white");*/
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
		    var timespan =  $("input[name=time_span]:checked").val();
		    if(timespan == 0) timespan = getNxtTime() - first;
		    var chwidth = timespan/(getNxtTime()-first)*1200;
		    if(xval < scrollpos && xval > scrollpos-chwidth && getNxtTime()-first > timespan)
		    {
			    isDragging = true;
			    draggingPos = xval-scrollpos+chwidth;
		    }
	    }
    })


    $(document).on("mousemove", function(e)
    {
		offsetX = $("#ex_chart").offset().left;
		offsetY = $("#ex_chart").offset().top;
		var width = 1000;
		var xscales = 100;
		var height = 600;
		var scale = 0;
		var volscale = 0;
		if(e.pageY-offsetY > 0 && e.pageY-offsetY < height && e.pageX-offsetX > 0 && e.pageX-offsetX < 1200)
		{
			var xval = Math.floor(e.pageX-offsetX)+0.5;
			var yval = Math.floor(e.pageY-offsetY)+0.5;
			
			$("#cursor_follow_x").attr("x1", 0)
			.attr("x2", width+(xscales*2))
			.attr("y1", yval)
			.attr("y2", yval)
			.attr("stroke-width", 1)
			.attr("stroke", "white");

			$("#cursor_follow_y")
			.attr("y1", 0)
			.attr("y2", height+50)
			.attr("x1", xval)
			.attr("x2", xval)
			.attr("stroke-width", 1)
			.attr("stroke", "white");


			var vol = (height-yval)/volscale;
			vol = Math.round(vol * Math.pow(10, -Math.floor(Math.log10(vol)-2)))/Math.pow(10, -Math.floor(Math.log10(vol)-2));

			$("#cursor_follow_vol")
			.attr("y", yval-2)
			.attr("x", 10)
			.text(vol);
			
			var pc = (height-yval)/scale+0;
			pc = Math.round(pc * Math.pow(10, -Math.floor(Math.log10(pc)-2)))/Math.pow(10, -Math.floor(Math.log10(pc)-2));

			$("#cursor_follow_price").attr("y", yval-2).attr("x", width+xscales+10).text(pc);

			var volrect = d3.select("#cursor_follow_vol").node().getBBox();
			d3.select("#backbox_vol").attr("x", volrect.x).attr("y", volrect.y)
			.attr("width", volrect.width).attr("height", volrect.height)
			.attr("fill", "white");
			
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
	

/*


function setChange(id, posx, width, amount)
	{
		if (amount > 0)
		{
			d3.select("#bottom_scroll").append("rect").attr("id", id)
			.attr("x", Math.floor(posx + (width/2))+0.5).attr("width", width)
			.attr("y", 700.5).attr("height", Math.round(amount))
			.attr("fill", "red").attr("stroke", "black");
		}
		else
		{
			d3.select("#bottom_scroll").append("rect").attr("id", "ch_"+id)
			.attr("x", Math.floor(posx + (width/2))+0.5).attr("width", Math.round(width))
			.attr("y", 700.5-Math.round(-amount)).attr("height", Math.round(-amount))
			.attr("fill", "green").attr("stroke", "black");
		}
	}


	function addScrollChartRenders()
	{
		var show = (curChart.visibleTimeSpan/curChart.maxTimeSpan)*1200;
		$("#bottom_scroll").empty();
			
	    d3.select("#bottom_scroll").append("rect")
        .attr("id","scroll")
	    .attr("x", 1200-show)
        .attr("width", show)
	    .attr("y", 650)
        .attr("height", 100)
        .attr("fill", "lightgray");

	    d3.select("#bottom_scroll").append("line")
        .attr("id", "centerline")
	    .attr("x1", 0)
        .attr("x2", (width+(xscales*2)))
	    .attr("y1", 700.5)
        .attr("y2", 700.5)
	    .attr("stroke", "black");
	}


    function adjustScrollChart()
    {	
		var maxAvg = curChart.maxAveragePrice;
		var minAvg = curChart.minAveragePrice;
		var maxChange = curChart.maxChange;
		var minChange = curChart.minChange;
		var firstAvg = curChart.phases[0].averagePrice;
		
	    var changeWidth = 1200 / curChart.numBars;
	    var changeScale = (maxChange > (-minChange) ? 50 / maxChange : 50 / (-minChange)) * 0.95;
		
	    var fst = Math.round(653 + (94 - (firstAvg - minAvg) / (maxAvg - minAvg)*94));
	    var m = "M0 " + fst + " L" + Math.round(changeWidth / 2) + " " + fst + " ";

		var allPhasesLength = curChart.phases.length;
		
	    for (var i = 0; i < allPhasesLength; i++)
	    {
			var change = curChart.phases[i].change;
			var average = curChart.phases[i].averagePrice;
		    var b = (average - minAvg) / (maxAvg - minAvg) * 94;
			
		    setChange(i, (changeWidth * i) - (changeWidth / 2), (changeWidth / 4) * 3, changeScale * change);
		    m += "L" + Math.round(changeWidth * i + (changeWidth / 2)) + " " + Math.round(653 + (94 - b)) + " ";
	    }

	    d3.select("#bottom_scroll").append("path").attr("id", "bottom_path").attr("stroke", "white").attr("fill", "none").attr("stroke-width", 2);
	    d3.select("#bottom_path").attr("d", m);
    }
	
*/
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));


$(window).load(function() 
{
    IDEX.init();

})
