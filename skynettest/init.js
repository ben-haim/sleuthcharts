

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.chart;


	IDEX.init = function()
	{
		IDEX.chart = new IDEX.Chart();
		
		IDEX.getSkynet().done(function(data)
		{
		
		})

		IDEX.buildMainChartDom();
	}
	
	
	IDEX.buildMainChartDom = function()
	{
		var svg = IDEX.makeSVG()
		var $svgEl = $(svg.node())
		var id = "main_menu_chart"
		$svgEl.attr("id", id)
		$(".browse-chart-wrap").append($svgEl)
	}
	
	$(".chart-style").on("mouseover", function()
	{
		$(this).find(".dropdown-wrap").addClass("active");
		$(this).find(".dropdown-title").addClass("active");
	})
	
	$(".chart-style").on("mouseleave", function()
	{
		$(this).find(".dropdown-wrap").removeClass("active");
		$(this).find(".dropdown-title").removeClass("active");

	})
	

	IDEX.makeSVG = function()
	{
		//var $svg = $("<svg></svg>")
		var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		svg = d3.select($(svg).get()[0])
		//console.log(svg)
		
		svg
		.attr("height", "100%")
		.attr("width", "100%")
		.attr("class", "unselectable")
		.style({"background":"#090909"});
		//.style({"background":"black"});

		svg.append("g")
		.attr("class", "candleseries");
		
		svg.append("text")
		.attr("class", "candleInfo")
		.attr("data-axisnum", "1");
		
		
		var xAxis = 
		svg.append("g")
		.attr("class", "sleuthXAxis")
		.attr("data-axisnum", "1");
		
		xAxis.append("g")
		.attr("class", "xLabels");	
		
		xAxis.append("g")
		.attr("class", "xTicks");
		
		xAxis.append("g")
		.attr("class", "xAxisLines");
		
		var yAxis = 
		svg.append("g")
		.attr("class", "sleuthYAxis")
		.attr("data-axisnum", "1");
		
		yAxis.append("g")
		.attr("class", "yLabels");	
		
		yAxis.append("g")
		.attr("class", "yTicksLeft");
		
		yAxis.append("g")
		.attr("class", "yTicksRight");
		
		yAxis.append("g")
		.attr("class", "yGridLines");
		
		yAxis.append("g")
		.attr("class", "yAxisLines");
		
		var yAxis = 
		svg.append("g")
		.attr("class", "sleuthYAxis")
		.attr("data-axisnum", "2");
		
		yAxis.append("g")
		.attr("class", "yLabels");	
		
		yAxis.append("g")
		.attr("class", "yTicksLeft");
		
		yAxis.append("g")
		.attr("class", "yTicksRight");
		
		yAxis.append("g")
		.attr("class", "yGridLines");
		
		yAxis.append("g")
		.attr("class", "yAxisLines");
		
		
		
		svg.append("g")
		.attr("class", "volbars");
		
		svg.append("g")
		.attr("class", "seriesLine");
		
		svg.append("g")
		.attr("class", "mainline");
		
		svg.append("g")
		.attr("class", "boxes");
		
		
		var candleInd = 
		svg.append("g")
		.attr("class", "candleInd")
		
		candleInd.append("g")
		.attr("class", "ind");
		
		candleInd.append("g")
		.attr("class", "ind");
		
		
		var volInd = 
		svg.append("g")
		.attr("class", "volInd")
		
		volInd.append("g")
		.attr("class", "ind");
		
		volInd.append("g")
		.attr("class", "ind");
		
		
		
		var cursor = svg.append("g")
		.attr("class", "cursor_follow");
		
		cursor.append("line")
		.attr("class", "cursor_follow_x");
		
		cursor.append("line")
		.attr("class", "cursor_follow_y");

		var priceFollow = cursor.append("g")
		.attr("class", "yAxis-follow")
		.attr("data-axisnum", "1");
		
		priceFollow.append("path")
		.attr("class", "yAxis-follow-backbox");
		
		priceFollow.append("text")
		.attr("class", "yAxis-follow-text");
		
		
		var volFollow = cursor.append("g")
		.attr("class", "yAxis-follow")
		.attr("data-axisnum", "2");
		
		volFollow.append("path")
		.attr("class", "yAxis-follow-backbox");
		
		volFollow.append("text")
		.attr("class", "yAxis-follow-text");
		
		
		var timeFollow = cursor.append("g")
		.attr("class", "xAxis-follow");
		
		timeFollow.append("rect")
		.attr("class", "xAxis-follow-backbox");
		
		timeFollow.append("text")
		.attr("class", "xAxis-follow-text");
		
		
		svg.append("text")
		.attr("class", "highestPrice");
		
		svg.append("text")
		.attr("class", "lowestPrice");
		
		svg.append("text")
		.attr("class", "cur-market");

		
		return svg
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
	
	

	return IDEX;
		

}(IDEX || {}, jQuery));


$(window).load(function()
{

	IDEX.init();
})
