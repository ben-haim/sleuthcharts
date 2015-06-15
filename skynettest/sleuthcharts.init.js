var IDEX = (function(IDEX, $, undefined) 
{   
	Sleuthcharts = {};
	
	(function(Sleuthcharts) 
	{
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

			this.series = []
			this.xAxis = []
			this.yAxis = []
			
			this.draggingPos = 0;
			this.isDragging = false;
			
			this.isMain = false;
			this.chartType = "candlestick";
			
			this.settings = {};
			this.marketInfoFontSize = "13px"
			
			this.colorone = "#410947"
			this.colortwo = "#B726C7"
			IDEX.constructFromObject(this, obj);
			//this.addChart(this);

		}

		IDEX.Chart.prototype = 
		{
			
			allCharts:[],
			
			addChart: function(chart)
			{
				//console.log(chart)
				this.allCharts.push(chart)
			},
			
			removeChart: function(chart)
			{
				
			}
		}


		IDEX.initMainChart = function(chart) 
		{
			//siteOptions = (typeof siteOptions === "undefined") ? {} : siteOptions;
			
			
			var obj = IDEX.getXAxisNodes(chart.node, 1)
			if (chart.isMain)
			{
				var volAxisHeight = "25%"
				var priceAxisHeight = "75%"
			}
			else
			{
				var volAxisHeight = "30%"
				var priceAxisHeight = "70%"
			}
			
			var xAxisOpt = {
				"chart":chart,
				"heightInit":20,
				"widthInit":"100%",
				
				"range":40,
				"minRange":40,
				
				"padding":{
					"top":0,
					"left":10,
				},
				
				"numTicks":8,
				"tickLength":4,
				"tickStep":6,

				"labels":{
					"fontSize":"12px",	
					"containerID":"xAxisLabels",
				},
				
				"nodes":obj,
				
				"isXAxis":true,
			}
			
			var obj = IDEX.getYAxisNodes(chart.node, 1)
			var priceAxisOpt = {
				"chart":chart,
				"axisIndex":1,
				"heightInit":priceAxisHeight,
				"widthInit":50,
				
				"padding":{
					"top":35,
					"left":20,
				},
				
				"minPadding":0.05,
				"maxPadding":0.05,
				
				"numTicks":10,
				"tickLength":7,
				
				"labels":{
					"textPadding":5,
					"fontSize":"13px",
					"fontColor":"#8C8C8C",
					"containerID":"yAxisLabels",
				},
				
				"nodes":obj,

			}
			
			var obj = IDEX.getYAxisNodes(chart.node, 2)
			var volAxisOpt = {
				"chart":chart,
				"axisIndex":2,
				"heightInit":volAxisHeight,
				"widthInit":50,
				
				"padding":{
					"top":20,
					"left":20,
				},
				
				"minPadding":0.1,
				"maxPadding":0.05,
				
				"numTicks":3,
				"tickLength":7,
				
				"labels":{
					"textPadding":5,
					"fontSize":"13px",
					"fontColor":"#8C8C8C",
					"containerID":"volAxisLabels",
				},
				
				"nodes":obj,
				
				
			}
			
			var xAxis = new IDEX.Axis(xAxisOpt);
			var priceAxis = new IDEX.Axis(priceAxisOpt)
			var volAxis = new IDEX.Axis(volAxisOpt)
			
			
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

			chart.xAxis.push(xAxis)
			chart.yAxis.push(priceAxis)
			chart.yAxis.push(volAxis)
			chart.series.push(candleSeries)
			chart.series.push(volSeries)
			
			return chart;
		}

		
		IDEX.makeMini = function(curChart) 
		{
			//options = (typeof options === "undefined") ? {} : options;

			curChart.marketInfoFontSize = "11px";
			var obj = IDEX.getXAxisNodes(curChart.node, 1)
			var xAxisOpt = {
				"chart":curChart,
				"axisIndex":1,
				"heightInit":20,
				"widthInit":"100%",
				"range":160,
				
				"padding":{
					"top":0,
					"left":0,
				},
				
				"numTicks":4,
				"tickLength":4,
				"tickStep":4,
				
				"labels": {
					"fontSize":"10px",
					"containerID":"xAxisLabels",
				},
				
				"nodes":obj,
				
				"isXAxis":true,
			}
			
			var obj = IDEX.getYAxisNodes(curChart.node, 1)
			var priceAxisOpt = {
				"chart":curChart,
				"axisIndex":1,
				"heightInit":"100%",
				"widthInit":40,
				
				"padding":{
					"top":10,
					"left":5,
				},
				
				"minPadding":0.1,
				"maxPadding":0.1,
				
				"numTicks":5,
				"tickLength":3,
				
				"labels": {
					"textPadding":5,
					"fontSize":"11px",
					"fontColor":"#D6D6D6",
					"containerID":"yAxisLabels",
				},
				
				"nodes":obj,

			}
			
			var xAxis = new IDEX.Axis(xAxisOpt);
			var priceAxis = new IDEX.Axis(priceAxisOpt)		
			
			var candleSeriesOpt = {
				"xAxis":xAxis,
				"yAxis":priceAxis,
			};
			
			
			var candleSeries = new IDEX.Series(candleSeriesOpt)

			curChart.xAxis.push(xAxis)
			curChart.yAxis.push(priceAxis)
		}
	


	}(Sleuthcharts));
	
	return IDEX;
	
}(IDEX || {}, jQuery));