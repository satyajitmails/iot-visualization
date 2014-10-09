var rtGraph = {};

var subscribeTopic = "";

var palette = new Rickshaw.Color.Palette( { scheme: [
        "#7f1c7d",
 		"#00b2ef",
		"#00649d",
		"#00a6a0",
		"#ee3e96"
    ] } );

// function to invoke Rickshaw and plot the graph
rtGraph.drawGraph = function(seriesData)
{
	// instantiate our graph!
	this.palette = palette;

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

}

rtGraph.graphData = function(data)
{
	
	var key = 0;
	var seriesData = [];
	var timestamp = Date.now()/1000;
	var maxPoints = 25; 
	for (var j in data.d)
	{

		this.graph.series[key].data.push({x:timestamp,y:data.d[j]});
		if (this.graph.series[key].data.length > maxPoints)
		{
			this.graph.series[key].data.splice(0,1);//only display up to maxPoints
		}
		key++;
	}
	this.graph.render();	
}

rtGraph.displayChart = function(device,data){

	var key = 0;
	var seriesData = [];
	var timestamp = Date.now()/1000;
	for (var j in data.d)
	{

		seriesData[key]={};
		seriesData[key].name=j;
		seriesData[key].color = palette.color();
		seriesData[key].data=[];

		seriesData[key].data[0]={};
		seriesData[key].data[0].x = timestamp;
		seriesData[key].data[0].y = data.d[j];
		key++;
	}

	this.drawGraph(seriesData);

}

var Realtime = function(orgId, api_key, auth_token) {

	var firstMessage = true;

	var clientId="a:"+orgId+":" +Date.now();

	console.log("clientId: " + clientId);
	var hostname = orgId+".messaging.internetofthings.ibmcloud.com";
	var client;

	this.initialize = function(){

		client = new Messaging.Client(hostname, 1883,clientId);
		client.onMessageArrived = function(msg) {
			var topic = msg.destinationName;
			
			var payload = JSON.parse(msg.payloadString);
			//First message, instantiate the graph  
		    if (firstMessage) {
		    	firstMessage=false;
		    	rtGraph.displayChart(null,payload);
		    } else {
		    	rtGraph.graphData(payload);
		    }
		};

		client.onConnectionLost = function(e){
			console.log("Connection Lost at " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
			this.connect(connectOptions);
		}

		var connectOptions = new Object();
		connectOptions.keepAliveInterval = 3600;
		connectOptions.useSSL=false;
		connectOptions.userName=api_key;
		connectOptions.password=auth_token;

		connectOptions.onSuccess = function() {
			console.log("MQTT connected at " + Date.now());
		}

		connectOptions.onFailure = function(e) {
			console.log("MQTT connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);
		}

		console.log("about to connect to " + client.host);
		client.connect(connectOptions);
	}

	// Subscribe to the device when the device ID is selected.
	this.plotRealtimeGraph = function(){
		var subscribeOptions = {
			qos : 0,
			onSuccess : function() {
				console.log("subscribed to " + subscribeTopic);
			},
			onFailure : function(){
				console.log("Failed to subscribe to " + subscribeTopic);
				console.log("As messages are not available, visualization is not possible");
			}
		};
		
		var item = $("#deviceslist").val();
		var tokens = item.split(':');
		if(subscribeTopic != "") {
			console.log("Unsubscribing to " + subscribeTopic);
			client.unsubscribe(subscribeTopic);
		}
		
		subscribeTopic = "iot-2/type/" + tokens[2] + "/id/" + tokens[3] + "/evt/+/fmt/json";
		client.subscribe(subscribeTopic,subscribeOptions);

		if(!firstMessage) {
			//clear prev graphs
			$('#chart').empty();
			$('#timeline').empty();
			$('#legend').empty();
		}
		firstMessage = true;
	}

	this.initialize();
}