
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
		return [high, low];
	}
	
	IDEX.getMinMaxVol = function(phases)
	{
		var max = 0;
		var min = 0;
		
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				min = phases[i].volu;
				max = phases[i].volu;
			}
			else
			{
				min = phases[i].volu < min ? phases[i].volu : min;
				max = phases[i].volu > max ? phases[i].volu : max;
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
	
	return IDEX;
	
}(IDEX || {}, jQuery));