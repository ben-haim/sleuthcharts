var IDEX = (function(IDEX, $, undefined) 
{   
	var skynetKeysTick = [2,3,4,5,6]
	var skynetKeys = {
		"startTime":0,
		"endTime":1,
		"open":3,
		"high":4,
		"low":5,
		"close":6,
		"vol":7
	}

	var skynetKeysTime = {
		"startTime":0,
		"endTime":1,
		"open":2,
		"high":3,
		"low":4,
		"close":5,
		"vol":6
	}
	//var skynetKeys = [1,2,3,4,5]

	IDEX.SkyNETParams = function(obj) 
	{
		this.baseurl = "http://api.finhive.com/v1.0/run.cgi?";
		//this.key = "9cf373ead4858e19bf93ae5ea238c4c796819cc883c877513f528b95721a1085";
		this.key = "beta_test";

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
                if (key != "baseurl" && String(this[key]).length)
                    arr.push(key+"="+this[key])
        }
        var s = arr.join("&")

        return this.baseurl+s
    }
	
	IDEX.OHLC = function(obj) 
	{
		this.startTime = ""
		this.endTime = ""
		this.open = ""
		this.high = ""
		this.low = ""
		this.close = ""
		this.vol = ""
		
		IDEX.constructFromObject(this, obj);
	}
	
	
	IDEX.getData = function(settings)
	{
		//6932037131189568014 jl777
		//15344649963748848799 idex
		var dfd = new $.Deferred();
		
        var obj = {}
        obj['run'] = "quotes";
        obj['section'] = "crypto";
        obj['mode'] = "bars";
        obj['exchg'] = settings.exchange;
        obj['pair'] = settings.pair
        obj['num'] = "500"
        obj['bars'] = settings.bars
        obj['len'] = settings.barWidth
		obj['order'] = "asc"

        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()
		//console.log(url)
		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	
	IDEX.getInd = function(indSettings, settings)
	{
		var dfd = new $.Deferred();
		var id = "6932037131189568014"
		
		var iret = "merge"
		
		if (indSettings.type == "bollin")
			iret = "solo"
		
        var obj = {}
		obj['run'] = "indicator"
        obj['section'] = "crypto";
        obj['mode'] = "bars";
        obj['exchg'] = settings.exchange;
        obj['pair'] = settings.pair;
        obj['num'] = "500"
        obj['bars'] = settings.bars
        obj['len'] = settings.barWidth;
		
		obj['icode'] = "ind_" + indSettings.type
		obj['ion'] = indSettings.price
		obj['ilen'] = indSettings.len
		obj['inum'] = "500"
		obj['iret'] = iret
		obj['order'] = "asc"


        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()
		//console.log(url)

		$.getJSON(url, function(data)
		{
			
			//console.log(data)
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	
	IDEX.getStepOHLC = function(data, isTime)
	{
		var ohlc = []
		var volume = []
		var dataLength = data.length
		var keys = skynetKeys
		if (isTime)
			keys = skynetKeysTime
		var baseNXT = false
		
		for (var i = 0; i < dataLength; i++) 
		{

			var point = data[i]

			
			var obj = {}
			
			for (key in keys)
			{
				obj[key] = data[i][keys[key]]
			}
			/*if (i != 0 && (obj['high'] > ohlc[ohlc.length-1].close * 5 ))
			{
				console.log('no')
				point = data[i-1]
				
				obj = {}
				
				for (key in keys)
				{
					obj[key] = data[i-1][keys[key]]
				}
				
				obj = ohlc[ohlc.length-1]
				
			}*/

			obj['startTime'] *= 1000;
			obj['endTime'] *= 1000;
			
			
			ohlc.push(new IDEX.OHLC(obj))
			volume.push({x:obj['startTime'], y:obj['vol']});
		}

		return [ohlc, volume]
	}
	
	function invert()
	{
		data[i][keys[0]] =  Number((1 / close).toFixed(6))
		data[i][keys[1]] =  Number((1 / low).toFixed(6))
		data[i][keys[2]] =  Number((1 / high).toFixed(6))
		data[i][keys[3]] =  Number((1 / open).toFixed(6))
		data[i][keys[4]] =  Number((close * vol).toFixed(6))

		//data[i] = ((i!= 0) && (data[i][keys[2]] < data[i-1][keys[2]]/5)) ? data[i-1] : data[i] // spike
		/*
			var startTime = data[i][keys['start']] * 1000;
			var endTime = data[i][keys['end']] * 1000;
			var open = data[i][keys['open']]
			var high = data[i][keys['high']]
			var low = data[i][keys['low']]
			var close = data[i][keys['close']]
			var vol = data[i][keys['volume']]
		*/
	}
	
	return IDEX;
	
}(IDEX || {}, jQuery));
