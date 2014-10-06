var rtGraph = {};

var subscribeTopic = "";
var orgId = "";
var orgName = "";

rtGraph.drawGraph = function(seriesData)
{
	// instantiate our graph!
	this.palette = new Rickshaw.Color.Palette( { scheme: 'munin' } );

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

/*this.preview = new Rickshaw.Graph.RangeSlider( {
	graph: this.graph,
	element: document.getElementById('preview'),
} );*/

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

		//console.log(this.graph.series[key].name + "\n" + JSON.stringify(this.graph.series[key].data))
		this.graph.series[key].data.push({x:timestamp,y:data.d[j]});
		if (this.graph.series[key].data.length > maxPoints)
		{
			this.graph.series[key].data.splice(0,1);//only display up to maxPoints
		}		
		//seriesData[key]={};
		//seriesData[key].name=j;
		//seriesData[key].data=[];
		//console.log("j: " + j);
		//seriesData[
		//seriesData[key].data[0]={};
		//seriesData[key].data[0].x = timestamp;
		//seriesData[key].data[0].y = data.d[j];
		key++;
	}
        //console.log("series:\n" + this.graph.series);
	//this.graph.series.push(seriesData);
	this.graph.render();	
}



rtGraph.displayChart = function(device,data){
	

	

	//console.log("data: " + JSON.stringify(data));
	//var seriesData = [];
	var palette = new Rickshaw.Color.Palette( { scheme: 'munin' } );

	var key = 0;
	var seriesData = [];
	var timestamp = Date.now()/1000;
	for (var j in data.d)
	{

		seriesData[key]={};
		seriesData[key].name=j;
		seriesData[key].color = palette.color();
		seriesData[key].data=[];
		//console.log("j: " + j);
		//seriesData[key].data[i]={"x":data[i].timestamp.$date,"y":data[i].evt[j]};
		seriesData[key].data[0]={};
		//seriesData[key].data[0].x = data[i].timestamp.$date/1000;
		seriesData[key].data[0].x = timestamp;
		seriesData[key].data[0].y = data.d[j];
		//seriesData[key].data[i]={"y":data[i].evt[j]};
		key++;
	}

	this.drawGraph(seriesData);

}


var firstMessage = true;
var graph = new Object();
var devices = [];
var api_key ="";
var auth_token = "";
// Get the OrgId and OrgName
$.ajax
({
	type: "GET",
	url: "/api/v0001/organization",
	dataType: 'json',
	async: false,

	success: function (data, status, jq){

		orgId = data.id;
		orgName = data.name;
		api_key = data.api_key;
		auth_token = data.auth_token;
	},
	error: function (xhr, ajaxOptions, thrownError) {
		if(xhr.status === 401 || xhr.status === 403){
			console.log("Not authorized. Check your Api Key and Auth token");
			window.location.href="loginfail";
		}
		console.log("Not able to fetch the Organization details");
		console.log(xhr.status);
		console.log(thrownError);
	}
});

$.ajax
({
	type: "GET",
	url: "/api/v0001/organization/getdevices",
	dataType: 'json',
	async: true,

	success: function (data, status, jq){

		devices = data;
		for(var d in devices){
			$("#deviceslist").append("<option value="+devices[d].uuid+">"+devices[d].id+"</option>");
		}
	},
	error: function (xhr, ajaxOptions, thrownError) {
		console.log(xhr.status);
		console.log(thrownError);
	}
});


var clientId="a:"+orgId+":" +Date.now();

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

    	rtGraph.displayChart(null,payload);

    }
    else
    {
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
		console.log("connected at " + Date.now());

	}

	connectOptions.onFailure = function(e) {

		console.log("connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);

	}


	console.log("about to connect to " + client.host);
	client.connect(connectOptions);

//update the devices dropdown list
$( "#deviceslist" ).change(function() {

	var subscribeOptions = {
		qos : 0,
		onSuccess : function() {
			console.log("subscribed to " + subscribeTopic);
		},
		onFailure : function(){
			console.log("Failed to subscribe to " + subscribeTopic);
			console.log("Visualization failed, as not able to subscribe to get messages");
		}
	};
	var item = $(this).val();
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
	

});

//historian code
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

		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr.status);
			console.log(thrownError);
		}
	});
	

});*/