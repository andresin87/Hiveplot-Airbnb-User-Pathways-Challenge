/**
 * Andrés Lucas Enciso
 * July 2015
 * Analyzr Project
 * 
 * Airbnb Project
 */
$( document ).ready(function() {
	progressJs().setStatus('Initializing variables...');
	var width = $('#plot').innerWidth(),
	    height = 1500,
	    innerRadius = 40,
	    outerRadius = 500;
	
	var axis = 7,
		axisangle = [0, 45, 75, 105, 135, 225, 255],
		info = ['USERS LIST', 'USERS ABSOLUTE DEVIATION SESSION TIME', 'USERS AVERAGE SESSION TIME (h)', 'USERS STANDARD DEVIATION SESSION TIME', 'SESSION TIME DURATION (h)', 'SESSION AGENT', 'SESSION DEVICE', 'USER SEARCHES', 'USER MESSAGES', 'USER BOOKINGS'],
		infopos = [];
		
		axisangle.forEach(function(d,i){
			axisangle[i]= d / 360 * 2 * Math.PI;
		});
	
	var /*angle = d3.scale.ordinal().domain(d3.range(5)).rangePoints([0, 2 * Math.PI]),*/
	    radius = d3.scale.linear().range([innerRadius, outerRadius]),
		color = d3.scale.ordinal()
			.range(['#5cfdf6', '#5cb4fd', '#5c63fd', '#a55cfd', '#f65cfd', '#fd5cb4', '#fd5c63', '#fda55c', '#fdf65c', '#b4fd5c', '#63fd5c', '#5cfda5'])
			.domain(10);
		
	var angle = d3.scale.ordinal()
	    .domain([0, 1, 2, 3, 4])
	    .range(axisangle);
		
	progressJs().setStatus('Retrieving data...');
	var airbnb;
	var dsv = d3.dsv("|", "text/plain");
	dsv("airbnb_session_data_small.txt", function(error, data) {
	//d3.json("data.json", function(data) {
		airbnb = Object();
		
		airbnb.session = [];
		airbnb.deviation = {};
		airbnb.avgsession = {};
		airbnb.user = [];
		airbnb.agent = [];
		airbnb.device = [];
		airbnb.other = {'agent': {}, 'device':{} };
		airbnb.action = {'search':{'agent': {}, 'device': {}, 'user': {}, 'userDevice': {}, 'userAgent': {}, 'session': {}}, 'message': {'agent': {}, 'device': {}, 'user': {}, 'userDevice': {}, 'userAgent': {}, 'session': {}}, 'book': {'agent': {}, 'device': {}, 'user': {}, 'userDevice': {}, 'userAgent': {}, 'session': {}}};
		
		progressJs().setStatus('Reversing data...');
		//Reverse Data order
		data = data.reverse();
		// Parse the data
		
		progressJs().setStatus('Parsing data...');
		data.forEach(function(dat, i){
			dat['ts_max'] = new Date(dat['ts_max']);
			dat['ts_max'] = math.round(dat['ts_max'].getTime()/3600);	// To hours
			dat['ts_min'] = new Date(dat['ts_min']);
			dat['ts_min'] = math.round(dat['ts_min'].getTime()/3600);	// To hours
			dat['dim_user_agent'] = dat['dim_device_app_combo'].split(" - ")[1]				//user agent
			dat['dim_device_app_combo'] = dat['dim_device_app_combo'].split(" - ")[0]		//user device
			if(airbnb.session.indexOf(dat['ts_max'] - dat['ts_min']) == -1){
				airbnb.session.push(dat['ts_max'] - dat['ts_min']);	
			}
			if(!airbnb.avgsession.hasOwnProperty(dat['id_visitor'])){
				airbnb.avgsession[dat['id_visitor']] = {'sessions': [], 'avg': 0};
			}
			airbnb.avgsession[dat['id_visitor']].sessions.push(dat['ts_max'] - dat['ts_min']);
			if(airbnb.user.indexOf(dat['id_visitor']) == -1){
				airbnb.user.push(dat['id_visitor']);
			}
			if(airbnb.agent.indexOf(dat['dim_user_agent']) == -1){
				airbnb.agent.push(dat['dim_user_agent']);
			}
			if(airbnb.device.indexOf(dat['dim_device_app_combo']) == -1){
				airbnb.device.push(dat['dim_device_app_combo']);
			}
			if(dat['did_search']>0){
				if(!airbnb.action.search.agent[dat['dim_user_agent']]){
					airbnb.action.search.agent[dat['dim_user_agent']] = 1;
				}else{
					airbnb.action.search.agent[dat['dim_user_agent']]++;
				}
				if(!airbnb.action.search.device[dat['dim_device_app_combo']]){
					airbnb.action.search.device[dat['dim_device_app_combo']] = 1;
				}else{
					airbnb.action.search.device[dat['dim_device_app_combo']]++;
				}
				if(!airbnb.action.search.user[dat['id_visitor']]){
					airbnb.action.search.user[dat['id_visitor']] = 1;
				}else{
					airbnb.action.search.user[dat['id_visitor']]++;
				}
				
				if(!airbnb.action.search.userDevice[dat.id_visitor]){
					airbnb.action.search.userDevice[dat['id_visitor']] = {};
					airbnb.action.search.userDevice[dat['id_visitor']][dat.dim_device_app_combo] = 1;
					
				}else{
					if(!airbnb.action.search.userDevice[dat.id_visitor][dat.dim_device_app_combo]){
						airbnb.action.search.userDevice[dat.id_visitor][dat.dim_device_app_combo] = 1;
					}
					else{
						airbnb.action.search.userDevice[dat.id_visitor][dat.dim_device_app_combo]++;
					}
				}
				if(!airbnb.action.search.userAgent[dat.id_visitor]){
					airbnb.action.search.userAgent[dat['id_visitor']] = {};
					airbnb.action.search.userAgent[dat['id_visitor']][dat.dim_user_agent] = 1;
					
				}else{
					if(!airbnb.action.search.userAgent[dat.id_visitor][dat.dim_user_agent]){
						airbnb.action.search.userAgent[dat.id_visitor][dat.dim_user_agent] = 1;
					}
					else{
						airbnb.action.search.userAgent[dat.id_visitor][dat.dim_user_agent]++;
					}
				}
				
				if(!airbnb.action.search.session[dat['ts_max'] - dat['ts_min']]){
					airbnb.action.search.session[dat['ts_max'] - dat['ts_min']] = 1;
				}else{
					airbnb.action.search.session[dat['ts_max'] - dat['ts_min']]++;
				}
			}
			if(dat['sent_message']>0){
				if(!airbnb.action.message.agent[dat['dim_user_agent']]){
					airbnb.action.message.agent[dat['dim_user_agent']] = 1;
				}else{
					airbnb.action.message.agent[dat['dim_user_agent']]++;
				}
				if(!airbnb.action.message.device[dat['dim_device_app_combo']]){
					airbnb.action.message.device[dat['dim_device_app_combo']] = 1;
				}else{
					airbnb.action.message.device[dat['dim_device_app_combo']]++;
				}
				if(!airbnb.action.message.user[dat['id_visitor']]){
					airbnb.action.message.user[dat['id_visitor']] = 1;
				}else{
					airbnb.action.message.user[dat['id_visitor']]++;
				}
				
				if(!airbnb.action.message.userDevice[dat.id_visitor]){
					airbnb.action.message.userDevice[dat['id_visitor']] = {};
					airbnb.action.message.userDevice[dat['id_visitor']][dat.dim_device_app_combo] = 1;
					
				}else{
					if(!airbnb.action.message.userDevice[dat.id_visitor][dat.dim_device_app_combo]){
						airbnb.action.message.userDevice[dat.id_visitor][dat.dim_device_app_combo] = 1;
					}
					else{
						airbnb.action.message.userDevice[dat.id_visitor][dat.dim_device_app_combo]++;
					}
				}
				if(!airbnb.action.message.userAgent[dat.id_visitor]){
					airbnb.action.message.userAgent[dat['id_visitor']] = {};
					airbnb.action.message.userAgent[dat['id_visitor']][dat.dim_user_agent] = 1;
					
				}else{
					if(!airbnb.action.message.userAgent[dat.id_visitor][dat.dim_user_agent]){
						airbnb.action.message.userAgent[dat.id_visitor][dat.dim_user_agent] = 1;
					}
					else{
						airbnb.action.message.userAgent[dat.id_visitor][dat.dim_user_agent]++;
					}
				}
				
				if(!airbnb.action.message.session[dat['ts_max'] - dat['ts_min']]){
					airbnb.action.message.session[dat['ts_max'] - dat['ts_min']] = 1;
				}else{
					airbnb.action.message.session[dat['ts_max'] - dat['ts_min']]++;
				}
			}
			if(dat['sent_booking_request']>0){
				if(!airbnb.action.book.agent[dat['dim_user_agent']]){
					airbnb.action.book.agent[dat['dim_user_agent']] = 1;
				}else{
					airbnb.action.book.agent[dat['dim_user_agent']]++;
				}
				if(!airbnb.action.book.device[dat['dim_device_app_combo']]){
					airbnb.action.book.device[dat['dim_device_app_combo']] = 1;
				}else{
					airbnb.action.book.device[dat['dim_device_app_combo']]++;
				}
				if(!airbnb.action.book.user[dat['id_visitor']]){
					airbnb.action.book.user[dat['id_visitor']] = 1;
				}else{
					airbnb.action.book.user[dat['id_visitor']]++;
				}
				
				if(!airbnb.action.book.userDevice[dat.id_visitor]){
					airbnb.action.book.userDevice[dat['id_visitor']] = {};
					airbnb.action.book.userDevice[dat['id_visitor']][dat.dim_device_app_combo] = 1;
					
				}else{
					if(!airbnb.action.book.userDevice[dat.id_visitor][dat.dim_device_app_combo]){
						airbnb.action.book.userDevice[dat.id_visitor][dat.dim_device_app_combo] = 1;
					}
					else{
						airbnb.action.book.userDevice[dat.id_visitor][dat.dim_device_app_combo]++;
					}
				}
				if(!airbnb.action.book.userAgent[dat.id_visitor]){
					airbnb.action.book.userAgent[dat['id_visitor']] = {};
					airbnb.action.book.userAgent[dat['id_visitor']][dat.dim_user_agent] = 1;
					
				}else{
					if(!airbnb.action.book.userAgent[dat.id_visitor][dat.dim_user_agent]){
						airbnb.action.book.userAgent[dat.id_visitor][dat.dim_user_agent] = 1;
					}
					else{
						airbnb.action.book.userAgent[dat.id_visitor][dat.dim_user_agent]++;
					}
				}
				
				if(!airbnb.action.book.session[dat['ts_max'] - dat['ts_min']]){
					airbnb.action.book.session[dat['ts_max'] - dat['ts_min']] = 1;
				}else{
					airbnb.action.book.session[dat['ts_max'] - dat['ts_min']]++;
				}
			}
			
			if(!airbnb.other.agent.hasOwnProperty(dat['dim_user_agent'])){
				airbnb.other.agent[dat['dim_user_agent']] = {users:[], sessions: 0, devices: []};	//, device:{users:[], sesions: 0, agents, []} }
			}
			if(airbnb.other.agent[dat['dim_user_agent']].users.indexOf(dat['id_visitor'])<0)				airbnb.other.agent[dat['dim_user_agent']].users.push(dat['id_visitor']);
			if(airbnb.other.agent[dat['dim_user_agent']].devices.indexOf(dat['dim_device_app_combo'])<0)	airbnb.other.agent[dat['dim_user_agent']].devices.push(dat['dim_device_app_combo']);
			airbnb.other.agent[dat['dim_user_agent']].sessions++;
			
			if(!airbnb.other.device.hasOwnProperty(dat['dim_device_app_combo'])){
				airbnb.other.device[dat['dim_device_app_combo']] = {users:[], sessions: 0, devices: []};	//, device:{users:[], sesions: 0, agents, []} }
			}
			if(airbnb.other.device[dat['dim_device_app_combo']].users.indexOf(dat['id_visitor'])<0)				airbnb.other.device[dat['dim_device_app_combo']].users.push(dat['id_visitor']);
			if(airbnb.other.device[dat['dim_device_app_combo']].devices.indexOf(dat['dim_user_agent'])<0)		airbnb.other.device[dat['dim_device_app_combo']].devices.push(dat['dim_user_agent']);
			airbnb.other.device[dat['dim_device_app_combo']].sessions++;
			
		});
		for (var property in airbnb.avgsession) {	// average
			airbnb.avgsession[property].avg = d3.sum(airbnb.avgsession[property].sessions) / airbnb.avgsession[property].sessions.length;
			if(!airbnb.avgsession.hasOwnProperty('_maxavg'))	airbnb.avgsession['_maxavg'] = math.round(d3.sum(airbnb.avgsession[property].sessions) / airbnb.avgsession[property].sessions.length);
			if(!airbnb.avgsession.hasOwnProperty('_minavg'))	airbnb.avgsession['_minavg'] = math.round(d3.sum(airbnb.avgsession[property].sessions) / airbnb.avgsession[property].sessions.length);
			if(airbnb.avgsession[property].avg > airbnb.avgsession['_maxavg']) airbnb.avgsession['_maxavg'] = math.round(airbnb.avgsession[property].avg);
			if(airbnb.avgsession[property].avg < airbnb.avgsession['_minavg']) airbnb.avgsession['_minavg'] = math.round(airbnb.avgsession[property].avg);
		}
		airbnb.deviation['_max']=0;
		airbnb.deviation['_min']=0;
		data.forEach(function(dat, i){	// deviation
			console.log(dat);
			if(!airbnb.deviation.hasOwnProperty(dat.id_visitor)){
				airbnb.deviation[dat.id_visitor] = {'variance': [], deviation: null};
			}
			airbnb.deviation[dat.id_visitor].variance.push(((dat.ts_max-dat.ts_min)-airbnb.avgsession[dat.id_visitor].avg));
			if(((dat.ts_max-dat.ts_min)-airbnb.avgsession[dat.id_visitor].avg)>airbnb.deviation._max)
				airbnb.deviation._max = ((dat.ts_max-dat.ts_min)-airbnb.avgsession[dat.id_visitor].avg);
			if(((dat.ts_max-dat.ts_min)-airbnb.avgsession[dat.id_visitor].avg)<airbnb.deviation._min)
				airbnb.deviation._min = ((dat.ts_max-dat.ts_min)-airbnb.avgsession[dat.id_visitor].avg);
		});
		for (var property in airbnb.deviation) {
			var t = 0;
			if(property=='_min' || property=='_max' || property=='_maxDev' || property=='_minDev' )	continue;
			for(var i = 0; i < airbnb.deviation[property].variance.length; i++){
				t += Math.pow(airbnb.deviation[property].variance[i],2);
			}
			airbnb.deviation[property].deviation = Math.sqrt(t/airbnb.deviation[property].variance.length,2);
			if(!airbnb.deviation.hasOwnProperty('_minDev'))	airbnb.deviation['_minDev'] = Math.sqrt(t/airbnb.deviation[property].variance.length,2);
			if(!airbnb.deviation.hasOwnProperty('_maxDev'))	airbnb.deviation['_maxDev'] = Math.sqrt(t/airbnb.deviation[property].variance.length,2);
			
			else if(airbnb.deviation['_minDev'] > Math.sqrt(t/airbnb.deviation[property].variance.length))	airbnb.deviation['_minDev'] = Math.sqrt(t/airbnb.deviation[property].variance.length,2);
			else if(airbnb.deviation['_maxDev'] < Math.sqrt(t/airbnb.deviation[property].variance.length))	airbnb.deviation['_maxDev'] = Math.sqrt(t/airbnb.deviation[property].variance.length,2);
		}
		
		progressJs().setStatus('Allocating nodes...');
		// ALLOCATE THE NODES
		var nodes = [];
		var nodesLength = [];
		for(var i = 0; i < axis; i++){ nodesLength[i]=0; }
		
		//Add users
		airbnb.user.forEach(function(dat, i){
			nodes.push({x:0, y:i, color: color(0), data: 'user_'+dat, radius: 3});
			nodesLength[0]++;
			infopos[0] = {x:0, y:i, color: color(0)};
		});
		
		//Add session Deviation
		for(var i=math.round(airbnb.deviation['_minDev'])-1; i<=math.round(airbnb.deviation['_maxDev']); i++){
			nodes.push({x:1, y:i-math.round(airbnb.deviation['_minDev'])+1, color: color(1), data: 'dev_'+i, radius: (i-math.round(airbnb.deviation['_minDev'])+1)%2 ? 0 : 3 });
			nodesLength[1]++;
			infopos[1] = {x:1, y:i, color: color(1)};
		}
		
		//Add session Avg
		for(var i=airbnb.avgsession['_minavg']-1; i<=airbnb.avgsession['_maxavg']; i++){
			nodes.push({x:2, y:i-(airbnb.avgsession['_minavg']-1), color: color(2), data: 'avg_'+i, radius: 3});
			nodesLength[2]++;
			infopos[2] = {x:2, y:i+1, color: color(2)};
		}
		
		//Add session Variance
		for(var i=math.round(airbnb.deviation['_min'])-1; i<=math.round(airbnb.deviation['_max']); i++){
			nodes.push({x:3, y:i-math.round(airbnb.deviation['_min'])+1, color: color(3), data: 'var_'+i, radius: 3});
			nodesLength[3]++;
			infopos[3] = {x:3, y:i+2, color: color(3)};
		}
		
		//Add session Time
		for(var i=0; i<=d3.max(airbnb.session)-d3.min(airbnb.session); i++){
			nodes.push({x:4, y:i, color: color(4), data: 'session_'+i, radius: 3});
			nodesLength[4]++;
			infopos[4] = {x:4, y:i, color: color(4)};
		}
		
		// Add Agents
		airbnb.agent.forEach(function(dat, i){
			nodes.push({x:5, y:nodesLength[5], color: color(5), data: 'agent_'+dat, radius: 3});
			nodesLength[5]++;
			infopos[5] = {x:5, y:nodesLength[5]-1, color: color(5)};
		});
		// Add Devices
		airbnb.device.forEach(function(dat, i){
			nodes.push({x:5, y:nodesLength[5], color: color(6), data: 'device_'+dat, radius: 3});
			nodesLength[5]++;
			infopos[6] = {x:5, y:nodesLength[5]-1, color: color(6)};
		});
		
		// Add Actions
		//	Search
		var action = {'search':0, 'message':0, 'book':0};
		for (var key in airbnb.action.search.user) {
			if(action.search<airbnb.action.search.user[key]) action.search=airbnb.action.search.user[key];
		}
		for (var key in airbnb.action.search.device) {
			if(action.search<airbnb.action.search.device[key]) action.search=airbnb.action.search.device[key];
		}
		for (var key in airbnb.action.search.agent) {
			if(action.search<airbnb.action.search.agent[key]) action.search=airbnb.action.search.agent[key];
		}
		//	Message
		for (var key in airbnb.action.message.user) {
			if(action.message<airbnb.action.message.user[key]) action.message=airbnb.action.message.user[key];
		}
		for (var key in airbnb.action.message.device) {
			if(action.message<airbnb.action.message.device[key]) action.message=airbnb.action.message.device[key];
		}
		for (var key in airbnb.action.message.agent) {
			if(action.message<airbnb.action.message.agent[key]) action.message=airbnb.action.message.agent[key];
		}
		//	Book
		for (var key in airbnb.action.book.user) {
			if(action.book<airbnb.action.book.user[key]) action.book=airbnb.action.book.user[key];
		}
		for (var key in airbnb.action.book.device) {
			if(action.book<airbnb.action.book.device[key]) action.book=airbnb.action.book.device[key];
		}
		for (var key in airbnb.action.book.agent) {
			if(action.book<airbnb.action.book.agent[key]) action.book=airbnb.action.book.agent[key];
		}
		// Add Actions
		for(var i=0; i<math.round(action.search); i++){
			nodes.push({x:6, y:i, color: color(7), data: 'act_s_'+i, radius: 1.5});
			nodesLength[6]++;
			infopos[7] = {x:6, y:i, color: color(7)};
		}
		var lim = nodesLength[6] + math.round(action.message),
			prev = nodesLength[6];
		for(var i=nodesLength[6]; i<lim; i++){
			nodes.push({x:6, y:i, color: color(8), data: 'act_m_'+(i-prev), radius: 1.5});
			nodesLength[6]++;
			infopos[8] = {x:6, y:i, color: color(8)};
		}
		var lim = nodesLength[6] + math.round(action.book),
			prev = nodesLength[6];
		for(var i=nodesLength[6]; i<lim; i++){
			nodes.push({x:6, y:i, color: color(9), data: 'act_b_'+(i-prev), radius: 1.5});
			nodesLength[6]++;
			infopos[9] = {x:6, y:i, color: color(9)};
		}
		
		var nodeLookup = {};
		for (var i = 0, len = nodes.length; i < len; i++) {
			var t = nodes[i].data;
		    nodeLookup[t] = nodes[i];
		    nodeLookup[t].i = i;
		}
		
		progressJs().setStatus('Linking nodes...');
		// LINKING NODES
		var links = [];
		
		var linkingTemp = [];
		function addlink(l){
			if(linkingTemp.length==0){
				linkingTemp.push(l.source.x+"_"+l.source.y+"_"+l.target.x+"_"+l.target.y);
				links.push(l);
				return links.indexOf(l);
			}
			else if(linkingTemp.indexOf(l.source.x+"_"+l.source.y+"_"+l.target.x+"_"+l.target.y)>=0){
				links.push({source: l.source, target: l.target, 'class': l['class'] + " display_none", display: 'none'});
				return false;	
			}
			else if(linkingTemp.indexOf(l.source.x+"_"+l.source.y+"_"+l.target.x+"_"+l.target.y)<0){
				linkingTemp.push(l.source.x+"_"+l.source.y+"_"+l.target.x+"_"+l.target.y);
				links.push({source: l.source, target: l.target, 'class': l['class'], display: 'inline'});
				return links.indexOf({source: l.source, target: l.target, 'class': l['class'], display: 'inline'});
			}
			return false;
		}
		
		data.forEach(function(d,i){
			var _class = generateLinkClass(d,i);
			addlink({source: nodes[nodeLookup['user_'+d.id_visitor].i], target: nodes[nodeLookup['dev_'+math.round(airbnb.deviation[d.id_visitor].deviation)].i], 'class': _class + " link-0to1"}); // user - deviation_time
			addlink({source: nodes[nodeLookup['dev_'+math.round(airbnb.deviation[d.id_visitor].deviation)].i], target: nodes[nodeLookup['avg_'+math.round(airbnb.avgsession[d.id_visitor].avg)].i], 'class': _class + " link-0to1"}); // deviation_time - avg_time
			addlink({source: nodes[nodeLookup['avg_'+math.round(airbnb.avgsession[d.id_visitor].avg)].i], target: nodes[nodeLookup['var_'+math.round((d.ts_max-d.ts_min)-airbnb.avgsession[d.id_visitor].avg)].i], 'class': _class + " link-1to2"}); // avg_time - var_time
			addlink({source: nodes[nodeLookup['var_'+math.round((d.ts_max-d.ts_min)-airbnb.avgsession[d.id_visitor].avg)].i] , target: nodes[nodeLookup['session_'+(math.round(d.ts_max-d.ts_min)-d3.min(airbnb.session))].i], 'class': _class + " link-1to2"}); // var_time - session_time
			
			addlink({source: nodes[nodeLookup['session_'+(math.round(d.ts_max-d.ts_min)-d3.min(airbnb.session))].i], target: nodes[nodeLookup['device_'+d.dim_device_app_combo].i], 'class': _class + " link-2to3"}); // session_time - device
			addlink({source: nodes[nodeLookup['session_'+(math.round(d.ts_max-d.ts_min)-d3.min(airbnb.session))].i], target: nodes[nodeLookup['agent_'+d.dim_user_agent].i], 'class': _class + " link-2to3"}); // session_time - agent
			
			if(airbnb.action.search.user.hasOwnProperty(d.id_visitor))	addlink({source: nodes[nodeLookup['user_'+d.id_visitor].i], target: nodes[nodeLookup['act_s_'+ (airbnb.action.search.user[d.id_visitor]-1)].i], 'class': _class + " link-0to1"}); // user - action search
			if(airbnb.action.message.user.hasOwnProperty(d.id_visitor))	addlink({source: nodes[nodeLookup['user_'+d.id_visitor].i], target: nodes[nodeLookup['act_m_'+ (airbnb.action.message.user[d.id_visitor]-1)].i], 'class': _class + " link-0to1"}); // user - action message
			if(airbnb.action.book.user.hasOwnProperty(d.id_visitor))	addlink({source: nodes[nodeLookup['user_'+d.id_visitor].i], target: nodes[nodeLookup['act_b_'+ (airbnb.action.book.user[d.id_visitor]-1)].i], 'class': _class + " link-0to1"}); // user - action book
			
			if(d.dim_user_agent == "iPhone"){
				console.log(d);
			}
			if(d.did_search){
				if(airbnb.action.search.device.hasOwnProperty(d.dim_device_app_combo) && airbnb.action.search.user.hasOwnProperty(d.id_visitor))
					addlink({source: nodes[nodeLookup['act_s_'+ (airbnb.action.search.user[d.id_visitor]-1)].i], target: nodes[nodeLookup['device_'+ d.dim_device_app_combo].i], 'class': _class + " link-4to3"}); // action search - device
					
				if(airbnb.action.search.agent.hasOwnProperty(d.dim_user_agent) && airbnb.action.search.user.hasOwnProperty(d.id_visitor))
					addlink({source: nodes[nodeLookup['act_s_'+ (airbnb.action.search.user[d.id_visitor]-1)].i], target: nodes[nodeLookup['agent_'+ d.dim_user_agent].i], 'class': _class + " link-4to3"}); // action search - agent
					
				if(airbnb.action.search.agent.hasOwnProperty(d.dim_user_agent) && airbnb.action.search.device.hasOwnProperty(d.dim_device_app_combo))
					addlink({source: nodes[nodeLookup['device_'+ d.dim_device_app_combo].i], target: nodes[nodeLookup['agent_'+ d.dim_user_agent].i], 'class': _class + " link-3to3"}); // device - agent
			}

			if(d.sent_message){
				if(airbnb.action.message.device.hasOwnProperty(d.dim_device_app_combo) && airbnb.action.message.user.hasOwnProperty(d.id_visitor))
					addlink({source: nodes[nodeLookup['act_m_'+ (airbnb.action.message.user[d.id_visitor]-1)].i], target: nodes[nodeLookup['device_'+ d.dim_device_app_combo].i], 'class': _class + " link-4to3"}); // action message - device
				if(airbnb.action.message.agent.hasOwnProperty(d.dim_user_agent) && airbnb.action.message.user.hasOwnProperty(d.id_visitor))
					addlink({source: nodes[nodeLookup['act_m_'+ (airbnb.action.message.user[d.id_visitor]-1)].i], target: nodes[nodeLookup['agent_'+ d.dim_user_agent].i], 'class': _class + " link-4to3"}); // action message - agent
				if(airbnb.action.message.agent.hasOwnProperty(d.dim_user_agent) && airbnb.action.message.device.hasOwnProperty(d.dim_device_app_combo))
					addlink({source: nodes[nodeLookup['device_'+ d.dim_device_app_combo].i], target: nodes[nodeLookup['agent_'+ d.dim_user_agent].i], 'class': _class + " link-3to3"}); // device - agent
			}					
			
			if(d.sent_booking_request){
				if(airbnb.action.book.device.hasOwnProperty(d.dim_device_app_combo) && airbnb.action.book.user.hasOwnProperty(d.id_visitor))
					addlink({source: nodes[nodeLookup['act_b_'+ (airbnb.action.book.user[d.id_visitor]-1)].i], target: nodes[nodeLookup['device_'+ d.dim_device_app_combo].i], 'class': _class + " link-4to3"}); // action book - device
				if(airbnb.action.book.agent.hasOwnProperty(d.dim_user_agent) && airbnb.action.book.user.hasOwnProperty(d.id_visitor))
					addlink({source: nodes[nodeLookup['act_b_'+ (airbnb.action.book.user[d.id_visitor]-1)].i], target: nodes[nodeLookup['agent_'+ d.dim_user_agent].i], 'class': _class + " link-4to3"}); // action book - agent
				if(airbnb.action.book.agent.hasOwnProperty(d.dim_user_agent) && airbnb.action.book.device.hasOwnProperty(d.dim_device_app_combo))
					addlink({source: nodes[nodeLookup['device_'+ d.dim_device_app_combo].i], target: nodes[nodeLookup['agent_'+ d.dim_user_agent].i], 'class': _class + " link-3to3"}); // device - agent	
			}
			
			
		});
		
		progressJs().setStatus('Generating the hiveplot visualization...');
		var svg = d3.select("#plot").append("svg")
			.attr('id', 'airbnb')
		    .attr("width", width)
		    .attr("height", height)
		  .append("g")
			.attr('id', 'airbnb_g')
		    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
		
		svg.append('g')
				.attr('id', 'background')
			.append('rect')
				.attr('id', 'bkg')
				.attr('x', -width/2)
				.attr('y', -height/2)
				.attr('width', width)
				.attr('height', height)
				.style('fill', function(d){
					var background = d3.select('#airbnb');
					var pentagon = textures.paths()
					    .d("hexagons")
					    .size(8)
					    .strokeWidth(2)
					    .stroke("#EDEDED");
					background.call(pentagon);
					return pentagon.url();
				})
				.style('stroke', 'none');
		
		addLogo(svg);
		
		svg.append('g').attr('id', 'gradients');
		
		progressJs().setStatus('Plotting axis...');
		svg.selectAll(".axis")
		    .data(d3.range(axis))
		  .enter().append("line")
		    .attr("class", "axis")
		    .attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
		    .attr("x1", radius.range()[0])
		    .attr("x2", radius.range()[1]);
		    
		progressJs().setStatus('Plotting links...');
		svg.selectAll(".link")
		    .data(links)
		  .enter().append("path")
		    .attr("class", function(d,i){
			    	return "link " + d['class'];
		    	})
		    .attr("d", link()
		    	.angle(function(d) { return angle(d.x); })
				.radius(function(d) { return nodePos(d, nodesLength); }))
		    .style("z-index", '0')
		    .style("display", function(d, i) { return d.display})
		    .style("stroke", function(d, i) { return '#000';/*d.source.color;*/ });
		    
		
		/*var svg_links = d3.selectAll('.link')[0];    
		svg_links.forEach( function(d,i){
			d = d3.select(d);
			generateLinkColor(d, i);
			d.style("stroke","url(#gradient-"+i+")");	
		});*/
		
		progressJs().setStatus('Plotting nodes...');
		svg.selectAll(".node")
		    .data(nodes)
		  .enter().append("circle")
		    .attr("class", "node")
		    .attr("transform", function(d) { return "rotate(" + degrees(angle(d.x)) + ")"; })
		    .attr("cx", function(d) { return nodePos(d, nodesLength); })
		    .attr("r", function(d) { return d.radius; })
		    .style("fill", function(d) { return d.color; });
		    
		progressJs().setStatus('Plotting legends...');
		svg.selectAll('.legend')
			.data(info)
		  .enter().append("text")
		  	.attr("class", "leyend")
		  	.attr("transform", function(d, i) { return "rotate(" + degrees(angle(infopos[i].x)) + ")"; })
		  	.attr("x", function(d,i) { return nodePos(infopos[i], nodesLength); })
		  	.attr("y", function(d,i) { return 15; })
		  	.style("fill", function(d,i){ return infopos[i].color; })
		  	.style("text-anchor", "end")
		  	.style("z-index", "500")
		  	.text( function(d,i){ return d; });
		    
		progressJs().setStatus('Your browser is procesing...');
		
		function generateLinkColor(l, i){
			var pathEl = l.node();
			var pathLength = pathEl.getTotalLength();
			var gradients = d3.select('#gradients');
			var colorPos = [{x:l.data()[0].source.x, y:l.data()[0].source.y}, {x:l.data()[0].target.x, y:l.data()[0].target.y}];
			var gradient = gradients
	                .append("linearGradient")
	                .attr("y1", "0%")
	                .attr("y2", "100%")
	                .attr("x1", "0%")
	                .attr("x2", "100%")
	                .attr("id", "gradient-"+i)
			    gradient
			        .append("stop")
			        .attr("offset", "0%")
			        .attr("stop-color", l.data()[0].source.color);
			        
			    gradient
			        .append("stop")
			        .attr("offset", "100%")
			        .attr("stop-color", l.data()[0].target.color)
		}
		
		function generateLinkClass(d,i){
			var _class = "user_" + d.id_visitor.replace(' ', '_').replace('/', '') + " ";									// user
				_class += "device_" + d.dim_device_app_combo.replace(' ', '_') + " ";										// device
				_class += "agent_" + d.dim_user_agent.replace(' ', '_') + " ";												// agent
				if(d.did_search && airbnb.action.search.user.hasOwnProperty(d.id_visitor))
					_class += "act_s_" + (airbnb.action.search.user[d.id_visitor] - 1) + " ";								// search action
				if(d.did_search && airbnb.action.message.user.hasOwnProperty(d.id_visitor))
					_class += "act_m_" + (airbnb.action.message.user[d.id_visitor] - 1) + " ";								// message action
				if(d.did_search && airbnb.action.book.user.hasOwnProperty(d.id_visitor))
					_class += "act_b_" + (airbnb.action.book.user[d.id_visitor] - 1) + " ";									// book action
				if(airbnb.avgsession.hasOwnProperty(d.id_visitor))
					_class += "avg_" + math.round(airbnb.avgsession[d.id_visitor].avg) + " ";								// avg session
				if(airbnb.deviation.hasOwnProperty(d.id_visitor)){
					_class += "dev_" + math.round(airbnb.deviation[d.id_visitor].deviation) + " ";							// user session deviation time
					_class += "var_" + math.round(((d.ts_max-d.ts_min)-airbnb.avgsession[d.id_visitor].avg)) + " ";			// user session discrete variance time	
				}
				_class += "session_" + math.round(d.ts_max-d.ts_min) + " ";													// session duration
			return _class;
		}
		
		$('.node').mouseenter(
			function(d){
				console.log(d3.select(this).data()[0].data);	
			}
		);
		
		$('.link')
			.mouseenter(
				function(d){
					var elem = $(d.toElement);
					console.log(elem.attr('class'	));
					var user,
						device,
						agent,
						act_s,
						act_m,
						act_b,
						session,
						avg,
						quad;
					var linkOutput;
					for(var i = 0; i - elem[0].classList.length; i++){
						if(elem[0].classList[i]!='link' && elem[0].classList[i]!='link-0to1'){
							if(elem[0].classList[i].substr(0, 5)=='user_'){
								user = elem[0].classList[i];	
							}
							else if(elem[0].classList[i].substr(0, 7)=='device_'){
								device = elem[0].classList[i];
							}
							else if(elem[0].classList[i].substr(0, 6)=='agent_'){
								agent = elem[0].classList[i];
							}								
							else if(elem[0].classList[i].substr(0, 8)=='session_'){
								session = elem[0].classList[i];
							}
							else if(elem[0].classList[i].substr(0, 4)=='avg_'){
								avg = elem[0].classList[i];
							}
							else if(elem[0].classList[i].substr(0, 6)=='act_s_'){
								act_s = elem[0].classList[i];
							}
							else if(elem[0].classList[i].substr(0, 6)=='act_m_'){
								act_m = elem[0].classList[i];
							}
							else if(elem[0].classList[i].substr(0, 6)=='act_b_'){
								act_b = elem[0].classList[i];
							}
						}
					}
					
					if(elem[0].classList.contains("link-0to1")){		// user - avg_session
						var s = getDataFromNodeObject(d3.select(d.toElement).data()[0].source.data);
						var t = getDataFromNodeObject(d3.select(d.toElement).data()[0].target.data);
						var el = d3.selectAll(".link."+user)	// Links user
							.style('stroke-width', 3)
							.style('stroke', '#FDA55C')
							.style('stroke-opacity', '.05')
							.style('z-index',1000)
							.style('display', 'inline')
							.classed('hover', true);
						linkOutput = '<div style="text-align: center">';
							linkOutput += '<h1 style="margin-top: -6px;margin-bottom: -1px;">LINK</h1>';
							linkOutput += '<hr/>';
							//linkOutput += '<img class="type_link" src="link-i.svg"></img>';
						linkOutput += '</div>';
						linkOutput += '<p>USER<br/><span style="text-transform: capitalize;font-size: .7em;">' + user.substring(5) + '</span></p>';
						linkOutput += '<p>INFO<br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Total sessions number: ' + airbnb.avgsession[user.substring(5)].sessions.length + '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">sessions duration avg: ' + math.round(airbnb.avgsession[user.substring(5)].avg,4) + ' hours</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">sessions deviation: ' + math.round(airbnb.deviation[user.substring(5)].deviation,4) + '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Actions: ';
								linkOutput += airbnb.action.search.user.hasOwnProperty(user.substring(5)) ? " " + airbnb.action.search.user[user.substring(5)] + " searches" : " 0 searches";
								 linkOutput += airbnb.action.message.user.hasOwnProperty(user.substring(5)) ? " | " + airbnb.action.message.user[user.substring(5)] + " messages" : " | 0 messages";
								 linkOutput += airbnb.action.book.user.hasOwnProperty(user.substring(5)) ? " | " + airbnb.action.book.user[user.substring(5)] + " bookings" : " | 0 bookings";
							linkOutput += '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Devices:';
								if(airbnb.action.search.userDevice.hasOwnProperty(user.substring(5))){
									for (var property in airbnb.action.search.userDevice[user.substring(5)]) {
										linkOutput += " " + property+":"+airbnb.action.search.userDevice[user.substring(5)][property];
									}
								}
							linkOutput += '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Agents:';
								if(airbnb.action.search.userAgent.hasOwnProperty(user.substring(5))){
									for (var property in airbnb.action.search.userAgent[user.substring(5)]) {
										linkOutput += " " + property+":"+airbnb.action.search.userAgent[user.substring(5)][property];
									}
								}
							linkOutput += '</span><br/>';
						linkOutput += '</p>';
					}
					else if(elem[0].classList.contains("link-1to2")||elem[0].classList.contains("link-2to3")){		// dev-session - session
						var s = getDataFromNodeObject(d3.select(d.toElement).data()[0].source.data);
						var t = getDataFromNodeObject(d3.select(d.toElement).data()[0].target.data);
						var el = d3.selectAll(".link."+session)	// Links session
							.style('stroke-width', 3)
							.style('stroke', '#FDA55C')
							.style('stroke-opacity', '.05')
							.style('z-index',1000)
							.style('display', 'inline')
							.classed('hover', true);
						linkOutput = '<div style="text-align: center">';
							linkOutput += '<h1 style="margin-top: -6px;margin-bottom: -1px;">LINK</h1>';
							linkOutput += '<hr/>';
							//linkOutput += '<img class="type_link" src="link-i.svg"></img>';
						linkOutput += '</div>';
						linkOutput += '<p>SESSION<br/><span style="text-transform: capitalize;font-size: .7em;">' + session.substring(8) + ' hours</span></p>';
						linkOutput += '<p>INFO<br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">User: ' + user.substring(5) + '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Device: ' + device + '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Agent: ' + agent + '</span><br/>';
							linkOutput += '<span style="text-transform: capitalize;font-size: .7em;">Actions: ';
								 linkOutput += act_s ? " search" : "";
								 linkOutput += act_m ? " | message" : "";
								 linkOutput += act_b ? " | book" : "";
							linkOutput += '</span><br/>';
						linkOutput += '</p>';
					}
					else if(elem[0].classList.contains("link-3to4")){
						var s = getDataFromNodeObject(d3.select(d.toElement).data()[0].source.data);
						var t = getDataFromNodeObject(d3.select(d.toElement).data()[0].target.data);
						if(s.type=='device'||t.type=='device'){
							var el = d3.selectAll(".link."+device+"."+session)	// Links session
								.style('stroke-width', 3)
								.style('stroke', '#FDA55C')
								.style('stroke-opacity', '.05')
								.style('z-index',1000)
								.style('display', 'inline')
								.classed('hover', true);
						}
						else if(s.type=='device'||t.type=='device'){
							var el = d3.selectAll(".link."+device+"."+session)	// Links session
								.style('stroke-width', 3)
								.style('stroke', '#FDA55C')
								.style('stroke-opacity', '.05')
								.style('z-index',1000)
								.style('display', 'inline')
								.classed('hover', true);	
						}
						linkOutput = "session";
					}
					else if(elem[0].classList.contains("link-3to3")){
						var el = d3.selectAll(".link."+device+"."+agent)	// Links session
							.style('stroke-width', 3)
							.style('stroke', '#FDA55C')
							.style('stroke-opacity', '.05')
							.style('z-index',1000)
							.style('display', 'inline')
							.classed('hover', true);
						linkOutput = "dispositive joining";
					}
					else if(elem[0].classList.contains("link-4to3")){
						var s = getDataFromNodeObject(d3.select(d.toElement).data()[0].source.data);
						var t = getDataFromNodeObject(d3.select(d.toElement).data()[0].target.data);
						var ttt;
						if(s.type=='device'||t.type=='device'){	ttt = device; }
						else if(s.type=='agent'||t.type=='agent'){ ttt = agent; }
						var act;
						if(s.type=='booking frequency'||t.type=='booking frequency'){ act = act_s.substr(0, 6); }
						else if(s.type=='message frequency'||t.type=='message frequency'){ act = act_m.substr(0, 6); }
						else if(s.type=='search frequency'||t.type=='search frequency'){ act = act_m.substr(0, 6); }
						var el = d3.selectAll('path[class*="'+act+'"].'+ttt+'.link')	// Links session
							.style('stroke-width', 3)
							.style('stroke', '#FDA55C')
							.style('stroke-opacity', '.05')
							.style('z-index',1000)
							.style('display', 'inline')
							.classed('hover', true);
						linkOutput="";
					}
					d3.selectAll(elem)
						.classed('hovered', 'true')
						.style('stroke-opacity', '1')
						.style('stroke', '#fd5c63')
						.style('z-index', 1001);
					
					console.log(d3.select(d.toElement).data()[0]);
					// link data
					
					var s = getDataFromNodeObject(d3.select(d.toElement).data()[0].source.data);
					var t = getDataFromNodeObject(d3.select(d.toElement).data()[0].target.data);
					var dat	= '<div class="title">Hovered</div>';
							dat += '<div>';
								dat += linkOutput;
							dat += ' </div>';
					$('#element_hovered').empty();
					$('#element_hovered').append(dat);
				}
			).mouseleave(
				function(d){
					d3.selectAll(".link.hovered")
						.classed('hovered', false);
					var el = d3.selectAll(".link.hover")	// Links
								.style('stroke-width', 3.5)
								.style('stroke', '#000')
								.style('stroke-opacity', '.1')
								.style('display', function(d,i){ return tempdata(d,i); })
								.style('z-index',0)
								.classed('hover', false);
					function tempdata(d,i){
						if(d['class'].search('display_none')!=-1)
							return 'none';
						return 'inline';
					}
					
					// null data
					var dat	= '<div class="title">Hovered</div>';
							dat += '<div>';
								dat += '<div style="text-align: center">';
									dat += '<h1 style="margin-top: -6px;margin-bottom: -1px;">NULL</h1>';
									dat += '<hr/>';
								dat += '</div>';
							dat += ' </div>';
					$('#element_hovered').empty();
					$('#element_hovered').append(dat);
				}
			);
			
			function getDataFromNodeObject(string){
				if(string.substr(0, 5)=='user_'){
					return {type: "user", data: string.substring(5)};
				}
				else if(string.substr(0, 7)=='device_'){
					return {type: "device", data: string.substring(7)};	
				}
				else if(string.substr(0, 6)=='agent_'){
					return {type: "agent", data: string.substring(6)};
				}								
				else if(string.substr(0, 8)=='session_'){
					return {type: "session duration", data: string.substring(8)}	;
				}
				else if(string.substr(0, 4)=='avg_'){
					return {type: "session average", data: string.substring(4)};
				}
				else if(string.substr(0, 6)=='act_s_'){
					return {type: "search frequency", data: string.substring(6)};
				}
				else if(string.substr(0, 6)=='act_m_'){
					return {type: "message frequency", data: string.substring(6)};
				}
				else if(string.substr(0, 6)=='act_b_'){
					return {type: "booking frequency", data: string.substring(6)};
				}
				else if(string.substr(0, 4)=='var_'){
					return {type: "user absolute deviation session time", data: string.substring(4)};
				}
				else if(string.substr(0, 4)=='dev_'){
					return {type: "user standard deviation session time", data: string.substring(4)};
				}
			}
		
	});
	
	
	function degrees(radians) {
	  return radians / Math.PI * 180 - 90;
	}
	
	function nodePos(d, nodesLength){
		if(nodesLength[d.x]-1==0){
			return (radius(d.y/1));
		}
		return radius(d.y/(nodesLength[d.x]-1));
	}
	
	window.onresize = (function() {
	  width = $( "#plot" ).innerWidth();
	  $( "#airbnb" ).width(width);
	  d3.select( "#airbnb_g" ).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	  d3.select("#bkg").attr('x', -width/2).attr('width', width);
	});
	
});