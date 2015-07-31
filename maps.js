function filterAction($element){
	//console.log($element.classList.contains("active"));
	var m = new Array();
	if($element.classList.contains("active")){
		filtersState.splice(filtersState.indexOf($element.id.toLowerCase()),1);
		$element.classList.remove("active");
		markers.forEach(function(marker,i){
			var include = false;
			if(markersClass[i][$element.id.toLowerCase()]==true){
				filtersState.forEach(function(filter){
					if(markersClass[i][filter] == true)
						include = true;
				});
				if(include == false)
					m.push(marker);
			}
		});
	}
	else{
		filtersState.push($element.id.toLowerCase());
		$element.classList.add("active");
	}
	//markerCluster = new MarkerClusterer(null, null);
	markerCluster.removeMarkers(m);
	//markerCluster.repaint();
}

var map;
var markerCluster

var markers = new Array();
var markersClass = new Array();
var filtersState = new Array();

(function($){
	/*
	*  render_map
	*
	*  This function will render a Google Map onto the selected jQuery element
	*
	*  @type	function
	*  @date	8/11/2013
	*  @since	4.3.0
	*
	*  @param	$el (jQuery element)
	*  @return	n/a
	*/
	var nodelist=null;

	var zoom = 14;

	var location = new google.maps.LatLng(41.373980, 2.129501);
	var originLocation = new google.maps.LatLng(41.373980, 2.129501);

	var filters = new Array();

	/**
	 * The CenterControl adds a control to the map that recenters the map on Chicago.
	 * This constructor takes the control DIV as an argument.
	 * @constructor
	 */
	function CenterControl(controlDiv, map) {

	  // Set CSS for the control border
	  var controlUI = document.createElement('div');
	  controlUI.style.backgroundColor = '#fff';
	  controlUI.style.border = '2px solid #fff';
	  controlUI.style.borderRadius = '3px';
	  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
	  controlUI.style.cursor = 'url(img/pointer.svg), auto;';
	  /*controlUI.style.marginBottom = '30px';*/
	  controlUI.style.marginLeft = '10px';
	  controlUI.style.marginTop = '10px';
	  controlUI.style.textAlign = 'center';
	  controlUI.title = 'Click to recenter the map';
	  controlDiv.appendChild(controlUI);

	  // Set CSS for the control interior
	  var controlText = document.createElement('div');
	  controlText.style.color = 'rgb(200,200,200)';
	  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
	  controlText.style.fontSize = '22px';
	  /*controlText.style.lineHeight = '38px';*/
	  controlText.style.width = '25px';
	  controlText.style.height = '25px';
	  controlText.innerHTML = '<i class="fa fa-location-arrow"></i>';
	  controlUI.appendChild(controlText);

	  // Setup the click event listeners: simply set the map to
	  // Chicago
	  google.maps.event.addDomListener(controlUI, 'click', function() {
	    map.setCenter(location)
	  });

	}

	function init($el){
		$.get(nodelist, function (json) {
	    }, 'json')
	    .done(function() {
		    $($el).each(function(){
				render_map($el, json);
			});
		})
		.fail(function() {
			$($el).each(function(){
				render_map($el, null);
			});
		});
	}

	function render_map( $el, json ) {

		var MY_MAPTYPE_ID = 'Map';

		var featureOpts = [
		    {
		        "featureType": "administrative.country",
		        "elementType": "geometry.stroke",
		        "stylers": [
		            {
		                "visibility": "off"
		            },
		            {
		                "lightness": "65"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative.country",
		        "elementType": "labels",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative.province",
		        "elementType": "all",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative.locality",
		        "elementType": "all",
		        "stylers": [
		            {
		                "hue": "#0049ff"
		            },
		            {
		                "saturation": 7
		            },
		            {
		                "lightness": 19
		            },
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative.neighborhood",
		        "elementType": "all",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative.land_parcel",
		        "elementType": "all",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "landscape",
		        "elementType": "all",
		        "stylers": [
		            {
		                "hue": "#ff0000"
		            },
		            {
		                "saturation": -100
		            },
		            {
		                "lightness": 25
		            },
		            {
		                "visibility": "simplified"
		            }
		        ]
		    },
		    {
		        "featureType": "poi",
		        "elementType": "all",
		        "stylers": [
		            {
		                "hue": "#ff0000"
		            },
		            {
		                "saturation": -100
		            },
		            {
		                "lightness": 100
		            },
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "hue": "#008eff"
		            },
		            {
		                "saturation": -93
		            },
		            {
		                "lightness": 31
		            },
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "geometry.fill",
		        "stylers": [
		            {
		                "hue": "#ff0000"
		            },
		            {
		                "visibility": "on"
		            },
		            {
		                "lightness": "43"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "geometry.stroke",
		        "stylers": [
		            {
		                "visibility": "on"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "labels",
		        "stylers": [
		            {
		                "hue": "#008eff"
		            },
		            {
		                "saturation": -93
		            },
		            {
		                "lightness": 31
		            },
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "labels.text.fill",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "labels.text.stroke",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "labels.icon",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "labels",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "labels.text",
		        "stylers": [
		            {
		                "visibility": "on"
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "labels.text.fill",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "labels.text.stroke",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "labels.icon",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.arterial",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "visibility": "on"
		            }
		        ]
		    },
		    {
		        "featureType": "road.arterial",
		        "elementType": "labels",
		        "stylers": [
		            {
		                "hue": "#008eff"
		            },
		            {
		                "saturation": -93
		            },
		            {
		                "lightness": -2
		            },
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.arterial",
		        "elementType": "labels.icon",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "road.local",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "hue": "#007fff"
		            },
		            {
		                "saturation": -90
		            },
		            {
		                "lightness": "39"
		            },
		            {
		                "visibility": "on"
		            }
		        ]
		    },
		    {
		        "featureType": "transit",
		        "elementType": "all",
		        "stylers": [
		            {
		                "hue": "#007fff"
		            },
		            {
		                "saturation": 10
		            },
		            {
		                "lightness": "37"
		            },
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "water",
		        "elementType": "all",
		        "stylers": [
		            {
		                "visibility": "simplified"
		            },
		            {
		                "saturation": "-30"
		            },
		            {
		                "lightness": "50"
		            }
		        ]
		    }
		];
		
		// vars
		var args = {
			zoom		: parseInt(zoom),
			center		: location,
			mapTypeId	: MY_MAPTYPE_ID,
			panControl:false,
		    zoomControl:true,
		    zoomControlOptions: {
		        style:google.maps.ZoomControlStyle.SMALL,
		        position:google.maps.ControlPosition.RIGHT_TOP
		    },
		    mapTypeControl:false,
		    scaleControl:false,
		    streetViewControl:false,
		    overviewMapControl:false,
		    rotateControl:false
		};

		// create map	        	
		map = new google.maps.Map( $el[0], args);

		var styledMapOptions = {
			name: 'Minimal'
		};

		var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

		map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

	    // Create the DIV to hold the control and
		// call the CenterControl() constructor passing
		// in this DIV.
		var centerControlDiv = document.createElement('div');
		var centerControl = new CenterControl(centerControlDiv, map);

		centerControlDiv.index = 1;
		map.controls[google.maps.ControlPosition.LEFT_TOP].push(centerControlDiv);
	
		//
		// NODES
		// 
	    add_marker( {lat:41.373980, lon:2.129501}, map );	

		var clusterStyles = [
		{
			textColor: 'white',
			url: 'img/im1.png',
			height: 30,
			width: 30
		},
		{
			textColor: 'white',
			url: 'img/im2.png',
			height: 30,
			width: 30
		},
		{
			textColor: 'white',
			url: 'img/im3.png',
			height: 30,
			width: 30
		},
		{
			textColor: 'white',
			url: 'img/im4.png',
			height: 30,
			width: 30
		},
		{
			textColor: 'white',
			url: 'img/im5.png',
			height: 30,
			width: 30
		}
		];

		var mcOptions = {
		    gridSize: 50,
		    styles: clusterStyles,
		    maxZoom: 17
		};

		markerCluster = new MarkerClusterer(map, markers, mcOptions);
	}

	/*
	*  add_marker
	*
	*  This function will add a marker to the selected Google Map
	*
	*  @type	function
	*  @date	8/11/2013
	*  @since	4.3.0
	*
	*  @param	$marker (jQuery element)
	*  @param	map (Google Map object)
	*  @return	n/a
	*/
	var idimage=0;

	function getIcon(image){
		var x = 5;
		var y = 7;
		var width = 25;
		var height = 25;
		if(image==null){
			image="img/unknown.png"
			var x = 0;
			var y = 1;
			var width = 35;
			var height = 35;
		}
		var icon;
		icon = '<!-- Generator: Adobe Illustrator 15.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->';
		icon += '<!-- Generator: Adobe Illustrator 17.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->';
		icon += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
		icon += '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="basic" id="Capa_1" x="0px" y="0px" width="34.721px" height="48.561px" viewBox="0 0 34.721 48.561" xml:space="preserve">';
		icon += '<defs>';
		icon += '<pattern id="img'+idimage+'" patternUnits="userSpaceOnUse" width="100" height="100">';
		icon += '<image xlink:href="'+image+'" x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" />';
		icon += '</pattern>';
		icon += '</defs>';
		icon += '<g>';
		icon += '<circle xmlns="http://www.w3.org/2000/svg" fill="url(#img'+idimage+')" stroke="#000000" stroke-width="3" stroke-miterlimit="10" cx="17.337" cy="18.621" r="15.264"/>';
		icon += '</g>';
		icon += '</svg>';
		idimage++;
		return icon;
	}


	function add_marker( marker, map ) {
		// var
		elem = marker;
			
		// for pins
		var latlng = new google.maps.LatLng( parseFloat(elem.lat), parseFloat(elem.lon) );

		var icon = getIcon("profile.jpg");
		// create marker
		var marker = new RichMarker({
          map: map,
          position	: latlng,
          draggable: false,
          flat: true,
          anchor: RichMarkerPosition.MIDDLE,
          content: icon
        });

	
		// add to array
		markers.push( marker );
	
		var var_infobox_props = {
			 content: '<div style="background-color: white;padding: 10px;border: 1px rgba(200,200,200,1) solid;border-radius: 8px; min-width:170px;">'+
			 				'<div style="text-align: center;">'+
			 					'<img src="profile.jpg" style="width: 100px; height: 100px; border-radius: 150px; -webkit-border-radius: 150px; -moz-border-radius: 150px; border: solid; border-color: #777777; border-width: 1px; margin-bottom: 10px;"/>'+
			 				'</div>'+
						    '<div>'+
							    '<div class="vcard">'+
								    'name: <span class="fn">Andrés Lucas Enciso</span><br/>'+
								    'nickname: <span class="nickname">adresin87</span><br/>'+
								    '@: <a class="email" href="mailto:andresin87@gmail.com">andresin87@gmail.com</a><br/>'+
								    'phone: <a class=tel href="tel:+34644448761">+34.644.448.761</a><br/>'+
							    	'portfolio: <a class="fn org url" href="http://www.creativesolutions.cat">Creative Solutions.</a><br/>'+
							    	'category: <span class="category">Developer</span><br/>'+
							    	'addr:'+
							    	'<div class="adr" style="margin-left: 5px;">'+
										'<div class="street-address">C/Casteras 32 1º 3ª.</div>'+
										'<span class="locality">Barcelona</span>,'+
										'<span class="postal-code">08028</span>'+
										'<div class="country-name">Spain</div></div>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'
			,disableAutoPan: false
			,maxWidth: 0
			,pixelOffset: new google.maps.Size(-10, 0)
			,zIndex: null
			,boxClass: "InfoBox"
			,closeBoxMargin: "2px"
			,closeBoxURL: "http://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif"
			,infoBoxClearance: new google.maps.Size(1, 1)
			,visible: true
			,pane: "floatPane"
			,enableEventPropagation: false
		};

		// create info window
		var infowindow = new InfoBox(var_infobox_props);
		
		// show info window when marker is clicked
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open( map, marker );
		});

	}

	/*
	*  center_map
	*
	*  This function will center the map, showing all markers attached to this map
	*
	*  @type	function
	*  @date	8/11/2013
	*  @since	4.3.0
	*
	*  @param	map (Google Map object)
	*  @return	n/a
	*/

	function center_map( map ) {

		// vars
		var bounds = new google.maps.LatLngBounds();

		// loop through all markers and create bounds
		/*$.each( map.markers, function( i, marker ){

			var latlng = new google.maps.LatLng( marker.position.lat(), marker.position.lng() );

			bounds.extend( latlng );

		});

		// only 1 marker?
		if( map.markers.length == 1 )
		{
			// set center of map
		    map.setCenter( bounds.getCenter() );
		    map.setZoom( 16 );
		}
		else
		{
			// fit to bounds
			map.fitBounds( bounds );
		}*/

	}

	/*
	*  document ready
	*
	*  This function will render each map when the document is ready (page has loaded)
	*
	*  @type	function
	*  @date	8/11/2013
	*  @since	5.0.0
	*
	*  @param	n/a
	*  @return	n/a
	*/

	function click_center(){
		map.setCenter(originLocation);
		map.setZoom(zoom);
	}

	function locate(){
		// Try HTML5 geolocation
	  if(navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      var pos = new google.maps.LatLng(position.coords.latitude,
	                                       position.coords.longitude);

	      var infowindow = new google.maps.InfoWindow({
	        map: map,
	        position: pos,
	        content: 'Location found using HTML5.'
	      });

	      map.setCenter(pos);
	    }, function() {
	      handleNoGeolocation(true);
	    });
	  } else {
	    // Browser doesn't support Geolocation
	    handleNoGeolocation(false);
	  }
	}

	$(document).ready(function(){
		
		$('#contact-map').each(function(){
			init($(this));
		});
		
		$('#center_map').on( "click", function() {
			click_center();
		});

		$('#locate_map').on( "click", function() {
			locate();
		});

	});

})(jQuery);