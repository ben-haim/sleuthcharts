
var IDEX = (function(IDEX, $, undefined) 
{   

	IDEX.getMinMax = function(phases)
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
		return [low, high];
	}
	
	IDEX.getMinMaxVol = function(phases)
	{
		var max = 0;
		var min = 0;
		
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				//min = phases[i].vol;
				max = phases[i].vol;
			}
			else
			{
				//min = phases[i].vol < min ? phases[i].vol : min;
				max = phases[i].vol > max ? phases[i].vol : max;
			}
		}
		return [min, max];
	}
	
	IDEX.theMinMax = function(phases)
	{
		var min = 0;
		var max = 0;
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				min = phases[i].close;
				max = phases[i].close;
			}
			else
			{
				min = phases[i].close < min ? phases[i].close : min;
				max = phases[i].close > max ? phases[i].close : max;
			}
		}
		return [min, max];
	}

	IDEX.formatTimeDate = function(d)
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
	
	IDEX.formatTime = function(d)
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
	
	IDEX.convertNXTTime = function(timestamp)
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
	
    IDEX.sendAjax = function(params) 
    {
	    var dfd = new $.Deferred();
	    var url = "http://api.finhive.com/v1.0/run.cgi?"
		
        console.log(params)
	    $.ajax
	    ({
	      type: "POST",
	      url: url,
	      data: params,
	      //contentType: 'application/json'
	    }).done(function(data)
	    {
		    //data = $.parseJSON(data);
		    dfd.resolve(data);
		
	    }).fail(function(data)
	    {
		    console.log(params);
		    dfd.reject(data);
	    })

	    return dfd.promise();
    }
	
	IDEX.getYAxisNodes = function(node, index)
	{	
		var obj = {}
		var $axisGroup = $(node).find(".sleuthYAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".yLabels")
		obj['ticksLeft'] = $axisGroup.find(".yTicksLeft")
		obj['ticksRight'] = $axisGroup.find(".yTicksRight")
		obj['gridLines'] = $axisGroup.find(".yGridLines")
		
		return obj;
	}
	
	IDEX.getXAxisNodes = function(node, index)
	{	
		var obj = {}
		var $axisGroup = $(node).find(".sleuthXAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".xLabels")
		obj['ticks'] = $axisGroup.find(".xTicks")
		
		return obj;
	}
	
	
	IDEX.getPoint = function(points, value) 
	{
		var val = null;
		//var points = curChart.pointData;

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
	
	return IDEX;
	
}(IDEX || {}, jQuery));