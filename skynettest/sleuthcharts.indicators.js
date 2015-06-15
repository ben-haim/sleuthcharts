

var IDEX = (function(IDEX, $, undefined) 
{   

	IDEX.Indicator = function(obj) 
	{
		this.base = "6854596569382794790";
		this.rel = "6932037131189568014";

		this.color = "";
		this.type = "EMA";
		this.price = "cl"
		this.len = "7";
		this.chart = "tick"
		this.chartSettings = "candlestick"

		
		IDEX.constructFromObject(this, obj);
	}


	IDEX.getBothInds = function(chart, settings)
	{
		var dfd = new $.Deferred();
		var d1 = new $.Deferred()
		var d2 = new $.Deferred()
		
		IDEX.getCandleInd(chart, settings).done(function(ind)
		{
			d1.resolve(ind)
		})
		
		IDEX.getVolInd(chart, settings).done(function(ind)
		{
			d2.resolve(ind)
		})
		
		$.when(d1, d2).done(function(ind1, ind2)
		{
			settings.candleInd[0].data = ind1[0]
			settings.candleInd[1].data = ind1[1]
			settings.volInd[0].data = ind2[0]
			settings.volInd[1].data = ind2[1]
			
			dfd.resolve([ind1, ind2])
		})
		
		return dfd.promise()
	}

	IDEX.getCandleInd = function(chart, settings)
	{
		var dfd = new $.Deferred();
		var d1 = new $.Deferred()
		var d2 = new $.Deferred()
		
		var indSettings1 = settings.candleInd[0]
		var indSettings2 = settings.candleInd[1]
		
		IDEX.getInd(indSettings1, settings).done(function(ind)
		{
			if (indSettings1.type == "bollin")
				var ret = ind.results.data.hi
			else
				var ret = ind.results.data.ind
			d1.resolve(ret)
		})
		
		IDEX.getInd(indSettings2, settings).done(function(ind)
		{
			if (indSettings2.type == "bollin")
				var ret = ind.results.data.lo
			else
				var ret = ind.results.data.ind
			d2.resolve(ret)
		})
		
		$.when(d1, d2).done(function(ind1, ind2)
		{
			dfd.resolve([ind1, ind2])
		})
		
		return dfd.promise()
	}
	

	IDEX.getVolInd = function(chart, settings)
	{
		var dfd = new $.Deferred();
		var d1 = new $.Deferred()
		var d2 = new $.Deferred()
		
		var indSettings1 = settings.volInd[0]
		var indSettings2 = settings.volInd[1]
		
		IDEX.getInd(indSettings1, settings).done(function(ind)
		{
			if (indSettings1.type == "bollin")
				var ret = ind.results.data.hi
			else
				var ret = ind.results.data.ind
			d1.resolve(ret)
		})
		
		IDEX.getInd(indSettings2, settings).done(function(ind)
		{
			if (indSettings2.type == "bollin")
				var ret = ind.results.data.lo
			else
				var ret = ind.results.data.ind
			d2.resolve(ret)
		})
		
		$.when(d1, d2).done(function(ind1, ind2)
		{
			dfd.resolve([ind1, ind2])
		})
		
		return dfd.promise()
	}
	
	IDEX.drawBothInds = function(chart)
	{
		var candleInd1 = chart.settings.candleInd[0]
		var candleInd2 = chart.settings.candleInd[1]
		var volInd1 = chart.settings.volInd[0]
		var volInd2 = chart.settings.volInd[1]
		
		IDEX.drawCandleInd(chart)
		IDEX.drawVolInd(chart)
	}
	
	
	IDEX.drawCandleInd = function(chart)
	{
		var candleInd1 = chart.settings.candleInd[0]
		var candleInd2 = chart.settings.candleInd[1]
		
		var selector = ".candleInd"
		var $el = $(chart.node).find(selector)
		$el.empty()
		//console.log($el)
		
		IDEX.drawInd(chart, candleInd1);
		IDEX.drawInd(chart, candleInd2);
	}
	
	IDEX.drawVolInd = function(chart)
	{
		var volInd1 = chart.settings.volInd[0]
		var volInd2 = chart.settings.volInd[1]
		
		var selector = ".volInd"
		var $el = $(chart.node).find(selector)
		$el.empty()
		//console.log($el)
		
		IDEX.drawInd(chart, volInd1);
		IDEX.drawInd(chart, volInd2);
	}
	
	
	IDEX.drawInd = function(chart, indSettings)
	{
		//var $volInds = $(chart.node).find(".volInd");

		var axisIndex = indSettings.axisIndex
		var selector = axisIndex == 1 ? ".volInd" : ".candleInd"
		var yAxis = chart.yAxis[axisIndex]
		var xAxis = chart.xAxis[0]
		
		var indData = indSettings.data;
		var allPoints = chart.pointData
		var visInd = indData.slice(xAxis.minIndex, xAxis.maxIndex+1)
		
		var positions = getIndPositions(allPoints, yAxis, visInd)
		
		
		var $el = $(chart.node).find(selector)
		//console.log($el)
		//$el.empty()
		
		var lineFunc = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("basis")

			
			
		var color = indSettings.color;
		
		d3.select($el.get()[0])
		.append("g")
		.append("path")
		//.attr("d", flow.join(" "))
		.attr("d", lineFunc(positions))
		.attr("stroke", color)
		.attr("stroke-width", "1.5px")
		.attr("fill", "none")
		//.attr("shape-rendering", "crispEdges");
	}
	
	
	function getIndPositions(allPoints, axis, data)
	{
		var dataLen = data.length;
		var positions = []
		
		for (var i = 0; i < dataLen; i++)
		{
			var candle = allPoints[i];
			var val = data[i];
			var pos = Math.floor(axis.getPos(val));
			
			positions.push({"x":candle.pos.middle, "y":pos})
			
			/*flow.push("M") //flow.push("L")
			flow.push(candle.pos.middle)
			flow.push(pos)*/
		}
		
		return positions;
	}
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
