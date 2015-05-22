
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
		
		this.numTicks = 0;
		this.tickInterval = 0;
		
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
		var num = pointValue - this.min;
		var range = this.max - this.min;
		var ratio = num / range;
		var pos = Number((this.pos.bottom - (ratio * this.height)).toFixed(4));
		//console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
		return pos
	}
	
	IDEX.Axis.prototype.getPriceFromY = function(yPos)
	{
		var range = this.max - this.min;
		var ratio = yPos / this.height;
		var num = ratio * range
		var price = this.max - num
		return price
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
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));