var IDEX = (function(IDEX, $, undefined) 
{   
	IDEX.Series = function(obj) 
	{
		this.height = 0;
		this.width = 0;

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
		
		this.xAxis;
		this.yAxis;
		
		this.dataMin = 0;
		this.dataMax = 0;
		this.min = 0;
		this.max = 0;
		
		this.numTicks = 0;
		this.tickInterval = 0;
		
		this.labels = [];
		this.tickPositions = [];

		IDEX.constructFromObject(this, obj);
		
		this.xAxis.series.push(this);
		this.yAxis.series.push(this);
		
	}
	
	
	IDEX.Series.prototype.initAxis = function(options)
	{
		var axis = new IDEX.Axis(options);
		axis.height = this.height * options.heightPerc;
		axis.width = this.width * options.widthPerc;
		//axis.bottom = axis.height + 
		//axis.left = 
		//axis.bottom = 
		//axis.right =
		axis.numTicks = options.numTicks	
		if (options.isXAxis)
		{
			this.xAxis = axis;
		}
		else
		{
			this.yAxis = axis;
		}
	}
	
	return IDEX;
	
}(IDEX || {}, jQuery));