// Main UI 
var orgId = "";
var orgName = "";
//flag for historian
var isHistorian = false;
var api_key ="";
var auth_token = "";
var devices = [];



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

//get the devices list of the org
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

var realtime = new Realtime(orgId, api_key, auth_token);

var historian = new Historian();
$( "#deviceslist" ).change(function() {

	if(isHistorian){
		historian.plotHistoricGraph();
	} else {
		realtime.plotRealtimeGraph();
	}
	
});

//Toggle historian options when user selects historic/live data radio buttons
$('#historic').change(function() {
	$('#historicData').show(500);
	isHistorian = true;
});

$('#realtime').change(function() {
	$('#historicData').hide(500);
	isHistorian = false;
});