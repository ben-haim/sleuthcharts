var IDEX = (function(IDEX, $, undefined) 
{   
	
	IDEX.Axis = function(obj) 
	{
		this.chart;
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
		var num = pointValue - this.min;
		var range = this.max - this.min;
		var ratio = num / range;
		var pos = Number((this.bottom - (ratio * this.height)).toFixed(4));
		//console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
		return pos
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