

var IDEX = (function(IDEX, $, undefined) 
{
	
	var autoSearchSkynet = [];
	
	
	$('.skynet-search').autocomplete(
	{
		delay:0,
		html:true,
		open: function(e, ui) { $(this).autocomplete('widget').css({'width':"450px","margin-top":"14px"})},
		source: function(request,response) { skynetMatcher(request, response, autoSearchSkynet) },
		//change: function(e, ui) { skynetSelection($(this), e, ui) },
		select: function(e, ui) { skynetSelection($(this), e, ui) }
	});
	
	
	
	function skynetMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		var counter = 0;
		var a = $.grep(auto, function( item )
		{
			if (counter > 20)
				return false;
			var $el = $(item.label)
			var pair = ""
			var exchange = ""
			var idPair = ""
			

			pair = $el.attr("data-pair")
			idPair = $el.attr("data-idpair")
			exchange = $el.attr("data-exchange")

			var ret = matcher.test(pair) || matcher.test(idPair) || matcher.test(exchange)
			
			if (ret)
				counter++
			
			return (ret);
		});

		response(a.slice(0, 40));
	}
	
	function skynetSelection($thisScope, e, ui)
	{
		//console.log(e)
		//console.log(ui)
		if (!ui.item)
		{
			$thisScope.attr('data-pair', "-1");
		}
		else
		{
			var $el = $(ui.item.label)
			var idPair = ""
			var pair = ""
			var exchange = ""
			
			pair = $el.attr("data-pair")
			idPair = $el.attr("data-idpair")
			exchange = $el.attr("data-exchange")

			if (idPair.split("_").length == 2 && exchange == "nxtae")
				$thisScope.attr('data-pair', idPair);
			else
				$thisScope.attr('data-pair', pair);
			
			$thisScope.attr('data-exchange', exchange);
			
			IDEX.chartClick($thisScope)
			//$("#temp_chart_click").trigger("click")
		}
	}
	
	
	IDEX.getSkynet = function(options, len)
	{
		var dfd = new $.Deferred();

		loadSkynetData().done(function(markets)
		{
			var parsed = markets
			var len = parsed.length;
			console.log(parsed)
			
			var formatted = []
			for (var i = 0; i < len; i++)
			{
				var obj = {}
				obj['baseID'] = ""
				obj['relID'] = ""
				obj['exchange'] = parsed[i].exchange

				var pair = parsed[i].pair;
				var both = pair.split("_")
				

				obj['baseName']  = both[0]
				

				
				obj['relName']  = both[1]
				
				
				obj['pair'] = obj['baseName'] + "_" + obj['relName']
				obj['idPair'] = obj['baseID'] + "_" + obj['relID']
				
				var exchangeSpan = "<span class='sky-exchange'>" + obj['exchange'] + "</span>"
				var pairSpan = "<span class='sky-pair'>" + obj['pair'] + " </span>"
				
				if (obj['baseID'].length && obj['relID'].length)
				{
					var idPair = obj['idPair']
					var idPairSpan =  "<span class='sky-idPair'>" + idPair + " </span>"
				}
				else if (obj['baseID'].length && obj['exchange'] == "nxtae")
				{
					var idPair = obj['baseID'] + "_" + obj['relName']
					var idPairSpan = "<span class='sky-idPair'>" + idPair + " </span>"
				}
				else if (obj['relID'].length && obj['exchange'] == "nxtae")
				{
					var idPair =  obj['relID'] + "_" + obj['baseName']
					var idPairSpan = "<span class='sky-idPair'>" + idPair + " </span>"
				}
				else
				{
					var idPair = ""
					var idPairSpan = "";
				}
				
				var wrap = "<div class='sky-auto-wrap' data-idpair='" + idPair +"' data-pair='" + obj['pair'] + "' data-exchange='" + obj['exchange'] + "'>"
				wrap += "<div class='sky-auto-cell'>" + pairSpan + "</div>"
				wrap += "<div class='sky-auto-cell'>" + idPairSpan + "</div>"
				wrap += "<div class='sky-auto-cell sky-cell-ex'>" + exchangeSpan + "</div>"
				wrap += "</div>"
				autoSearchSkynet.push({"label":wrap, "value":obj['pair']});
			}
			dfd.resolve(parsed)	
		})
		
		return dfd.promise()
	}
	
	function loadSkynetData()
	{
		var retdfd = new $.Deferred();
		var dfd = new $.Deferred();
		var user = this;
		
		if (localStorage.skynetMarkets)
		{
			var markets = JSON.parse(localStorage.getItem('skynetMarkets'));
			dfd.resolve(markets);
		}
		else
		{
			var obj = {}
			obj['section'] = "crypto";
			obj['run'] = "search";
			obj['field'] = "pair";
			obj['term'] = "";
			obj['key'] = "beta_test";
			obj['filter'] = "";

			var url = IDEX.makeSkynetURL(obj)
			
			$.getJSON(url, function(data)
			{
				console.log(data)
				var parsed = parseSkynetSearch(data.results)
				var len = parsed.length;
				//console.log(parsed)
				localStorage.setItem('skynetMarkets', JSON.stringify(parsed));
				dfd.resolve(parsed);
			})
		}
		
		
		dfd.done(function(markets)
		{
			//assets.sort(IDEX.compareProp('name'));
			//user.allAssets = assets;
			retdfd.resolve(markets);
		})
		
		return retdfd.promise();
	}
	function parseSkynetSearch(data)
	{
		var exchanges = {}
		var pairs = []
		var parsed = []
		
		var counter = 0;
		for (pair in data)
		{
			var pairExchanges = data[pair].split('|');
			
			
			for (var i = 0; i < pairExchanges.length; i++)
			{
				var exchange = pairExchanges[i];
				parsed.push({"pair":pair,"exchange":exchange})
			}

			counter++;
		}

		console.log(parsed)
		return parsed;
	}

    IDEX.makeSkynetURL = function(obj)
    {
		var baseurl = "http://api.finhive.com/v1.0/run.cgi?"
        var arr = []
		
        for (key in obj)
        {
			arr.push(key+"="+obj[key])
        }
        var s = arr.join("&")

        return baseurl+s
    }

	return IDEX;
	
	
}(IDEX || {}, jQuery));


