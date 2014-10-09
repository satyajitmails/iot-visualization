var rtGraph = {};

//var subscribeTopic = "";
//var orgId = "";
//var orgName = "";

//var devices = [];
//var api_key ="";
//var auth_token = "";
rtGraph.palette = new Rickshaw.Color.Palette( { scheme: [
        "#7f1c7d",
 		"#00b2ef",
		"#00649d",
		"#00a6a0",
		"#ee3e96"
    ] } );


rtGraph.drawGraph = function(seriesData)
{
	// instantiate our graph!

	this.graph = new Rickshaw.Graph( {
		element: document.getElementById("chart"),
		width: 900,
		height: 500,
		renderer: 'line',
		stroke: true,
		preserve: true,
		series: seriesData	
	} );

	this.graph.render();

	this.hoverDetail = new Rickshaw.Graph.HoverDetail( {
		graph: this.graph,
		xFormatter: function(x) {
			return new Date(x * 1000).toString();
		}
	} );

	this.annotator = new Rickshaw.Graph.Annotate( {
		graph: this.graph,
		element: document.getElementById('timeline')
	} );

	this.legend = new Rickshaw.Graph.Legend( {
		graph: this.graph,
		element: document.getElementById('legend')

	} );

	this.shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
		graph: this.graph,
		legend: this.legend
	} );

	this.order = new Rickshaw.Graph.Behavior.Series.Order( {
		graph: this.graph,
		legend: this.legend
	} );

	this.highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
		graph: this.graph,
		legend: this.legend
	} );

	this.smoother = new Rickshaw.Graph.Smoother( {
		graph: this.graph,
		element: document.querySelector('#smoother')
	} );

	this.ticksTreatment = 'glow';

	this.xAxis = new Rickshaw.Graph.Axis.Time( {
		graph: this.graph,
		ticksTreatment: this.ticksTreatment,
		timeFixture: new Rickshaw.Fixtures.Time.Local()
	} );

	this.xAxis.render();

	this.yAxis = new Rickshaw.Graph.Axis.Y( {
		graph: this.graph,
		tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
		ticksTreatment: this.ticksTreatment
	} );

	this.yAxis.render();


	this.controls = new RenderControls( {
		element: document.querySelector('form'),
		graph: this.graph
	} );

};

rtGraph.displayHistChart = function(device,data){

	var seriesData = [];

	var counter = 0;
	
	for(var i = data.length-1 ; i>=0 ;i-- ){	
   		
   		var key = 0;	
		
		for (var j in data[i].evt){
						
			if(i===data.length-1){
				seriesData[key]={};
				seriesData[key].name=j;
				seriesData[key].color = this.palette.color();
				seriesData[key].data=[];	
			}
			
			seriesData[key].data[counter]={};
			seriesData[key].data[counter].x = data[i].timestamp.$date/1000;// timestamp;
			seriesData[key].data[counter].y = data[i].evt[j];
		
			key++;
		}
		
		counter++;
	}	
	this.drawGraph(seriesData);
	
};


var Historian  = function () {

var $ = jQuery;	

this.plotHistoricGraph = function (){
		var item = $( "#deviceslist" ).val();
		var tokens = item.split(':');

		var top = $( 'input[name=historicQuery]:checked' ).val();
		console.log("called "+top);
		var queryParam = {};

		if(top == "topEvents") {
			queryParam = {
				top: $(historicTopRange).spinner( "value" )
			};
		} 
		else if(top == "dateRange") {
			queryParam = {
				start: $(historicStarts).val()*1000,
				end: $(historicEnds).val()*1000
			};
		}
		console.log(queryParam);
		$.ajax
		({
			type: "GET",
			url: "/api/v0001/historian/"+tokens[1]+"/"+tokens[2]+"/"+tokens[3],
			data: queryParam,
			dataType: 'json',
			async: true,

			success: function (data, status, jq){
				console.log("data = "+ data);
				if( rtGraph.graph == null ){		//first time
					rtGraph.displayHistChart(null,data);
				}	
				else{ //All other times
					$('#chart').empty();
					$('#timeline').empty();
					$('#legend').empty();
					rtGraph.displayHistChart(null,data);
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr.status);
				console.log(thrownError);
			}
		});
	}
};
/*$( "#deviceslist" ).change(function() {

	var item = $(this).val();
	var tokens = item.split(':');

	$.ajax
	({
		type: "GET",
		url: "/api/v0001/historian/"+tokens[1]+"/"+tokens[2]+"/"+tokens[3],
		dataType: 'json',
		async: true,

		success: function (data, status, jq){
			console.log("data = "+ data);
			if( this.graph == null ){		//first time
				this.displayHistChart(null,data);
			}	
			else{ //All other times
				$('#chart').empty();
				$('#timeline').empty();
				$('#legend').empty();
				this.displayHistChart(null,data);
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr.status);
			console.log(thrownError);
		}
	});

};*/





//var firstMessage = true;
//var graph = new Object();

// Get the OrgId and OrgName


/*var clientId="a:"+orgId+":" +Date.now();

console.log("clientId: " + clientId);
var hostname = orgId+".messaging.internetofthings.ibmcloud.com";

var client = new Messaging.Client(hostname, 1883,clientId);

client.onMessageArrived = function(msg) {
	var topic = msg.destinationName;
	
	var payload = JSON.parse(msg.payloadString);
	//if this is the first message, set things 
    if (firstMessage)
    {
    	firstMessage=false;
    	console.log( JSON.stringify(payload));
    	rtGraph.displayChart(null,payload);

    }
    else
    {
    	rtGraph.graphData(payload);
    }
};*/

/*client.onConnectionLost = function(e){
	console.log("Connection Lost at " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
	this.connect(connectOptions);
}

var connectOptions = new Object();
connectOptions.keepAliveInterval = 3600;
connectOptions.useSSL=false;
connectOptions.userName=api_key;
connectOptions.password=auth_token;
connectOptions.onSuccess = function() {
	console.log("connected at " + Date.now());

}

connectOptions.onFailure = function(e) {

	console.log("connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);

}


console.log("about to connect to " + client.host);
client.connect(connectOptions);*/

//historian code

	

//});