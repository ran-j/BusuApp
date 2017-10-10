//variaveis globais

var watchID;
var latAtual;
var lngAtual;

var destinoCache;
//para ter referencia do inforwindo aberta e fechar ela a qualquer hora
var janelaaberta;

//saber se esta logado no server
var conectadoservidor = 0;

//marcador do usuário no mapa web
var sualocalizacao;
 
var youicon = "./img/you.png";
var busicon = "./img/bussicon.png";
var busstopicon = "./img/busstop.png";
var dimap = document.getElementById('map');
var Infor = document.getElementById('InforDiv');
var dimap2 = document.getElementById('mapnativo');


var largura = window.innerWidth - 37 + 'px';
var tamanho = window.innerHeight - 130 + 'px';

//instancia a classe de alertas
var alerts = new AlertsClass();

//instancia a classe do mapa
var myMap = new MapaClass(alerts);
//infowindo do mapa web
var infowindowweb;
var contentString2 = '<div id="content">'+'<div id="siteNotice">'+ '</div>'+'<h1 id="firstHeading" class="firstHeading">Voce está aqui</h1>'+'<div id="bodyContent">'+'Sua localização Atual.'+'</div>';

//pra saber se esta aberto o mapa web ou nativo
var tipomapa;


//rotas cadastradas
var words = ["Jockey X Santa Rosa",	
	     		"Ceasa x StoAntonio", 
			 "Parque Aurora Via Rocha Leao",	
			 "Pontos Teste"];

	//array com as rotas dos busus
	var asrotas = [ 
		{k: 0, v: jockeyXSantaRosa },
		{k: 1, v: ParquexAuroraxLeaoxida },
		{k: 2, v: rotateste }
	];
		
	var ospontos = [
		{k: 0, v: pontostexte, cs: jockeyXSantaRosacs },
		{k: 1, v: locatonList, cs: pontostextecs },
		{k: 2, v: pontostexte, cs: pontostextecs }
	];

 
//inicio de tudo
document.addEventListener("deviceready", function() {  
	//erro hanndler
	window.onerror = function(msg, url, line, col, error) {
		var extra = !col ? '' : '\ncolumn: ' + col;
		extra += !error ? '' : '\nerror: ' + error;

		if ('file:///android_asset/www/cordova.js' != url){
			//alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
		}
 
		var suppressErrorAlert = true;
 
		return suppressErrorAlert;
	};

	
	//deixar a barra azul
	StatusBar.styleBlackOpaque();
    StatusBar.backgroundColorByHexString("#19618D");
	
	//classe para verificar a net
	var myNet = new NetStatus();
	var netOnoOff = myNet.GetNet();
	
	//verifica o se tem net para ver se vai abrir o mapa web ou nativo	
	if (netOnoOff){
		iniciaMapaWeb();
	}else{
		tipomapa=1;
		$("#mapnativo").show();
		myMap.abrirMapa(tipomapa,dimap2);
	}
	
	//eventos dos botoes	
	eventosBotoes();
	
	//fehar do popup
	var span = document.getElementsByClassName("close")[0];
	span.onclick = function() {
		Infor.style.display = "none";
	}

	window.onclick = function(event) {
		if (event.target == Infor) {
			Infor.style.display = "none";
		}
	}
		
}, false);


function eventosBotoes(){
	//mostra o mapa depois de carregado
	$("#omapa").show();
			
	//navbars
	$( "#buscaBu" ).click(function() {  
		//se a infowindo estiver aberta fecha
		if(tipomapa == 0){ Infor.style.display = "none";}
			
		$("#mapaBu").css("background-color", "#5cafe1");
		$("#buscaBu").css("background-color", "#18608d");

		//esconde um mostra o outro
		$("#omapa").hide();
		$("#alista").show();
		
		//limpar campo de bairros
		$("#inputbairros").val('');
		document.getElementById("caixasugestao").innerHTML = '';
	});
	
	//navbars
	$( "#mapaBu" ).click(function() {
		
		$("#buscaBu").css("background-color", "#5cafe1");
		$("#mapaBu").css("background-color", "#18608d");;	
		
		//esconde um mostra o outro
		$("#alista").hide();
		$("#omapa").show();
		
		//limpar campo de bairros
		$("#inputbairros").val('');
		document.getElementById("caixasugestao").innerHTML = '';
	});
	
	$( "#comRota" ).click(function() {
		Infor.style.display = "none";
		comecarrota();
	});
	
	
	//evento de click no resultado do campo de texto
	$('#caixasugestao').on('click', 'p', function(){
		//se a infowindo estiver aberta fecha
		if(tipomapa == 0){infowindowweb.close();}
		//alertar($(this).text());
		
		$("#buscaBu").css("background-color", "#5cafe1");
		$("#mapaBu").css("background-color", "#18608d");
				
		//passa a chave como posição para um array com as coordenadas das rotas
		var chavevetor = parseInt(chavePorValor(words,$(this).text()));
				
		//colocar as rotas no mapa		
		selecionarRotas(chavevetor);
		desenhaNoMap(asrotas[chavevetor].v,ospontos[chavevetor].v,ospontos[chavevetor].cs);
		
		//esconde um mostra o outro
		$("#alista").hide(); 
		$("#omapa").show();
		
		//troca a cor da caixa de sugestão
		$("#caixasugestao").css("background-color", "#f2f2f2");
	
	});
	
	var shots = 0;
	function selecionarRotas(chave){
		if (conectadoservidor == 1){
			socket.removeAllListeners("listBus");
			recebeRotas(chave);
		} else {
			contatoComServidor();
			setTimeout(function(){ 
				if (shots<3){
					alerts.alertar("Tentando receber a localização do ônibous");
					selecionarRotas(chave);
					shots++;
				} else {
					alerts.alertar("Não foi possível receber as rotas do servidor");
					shots = 0;
					return
				}
			}, 9000);
		}
	}
	
	//função que desenha as rotas no mapa
	function desenhaNoMap(asrotas,ospontosarray,ospontostxt){
		
		if(tipomapa == 0){
			
			//limpa direction service
			directionsDisplay.setMap(null);
			directionsService = new google.maps.DirectionsService;
			directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
			directionsDisplay.setMap(map);

			//desenha as rotas no mapa web 
			criapontosdeentradaWEB(asrotas);
				
			//coloca os marcadores nos pontos no mapa web
			colocarosmarkerWEB(ospontostxt,ospontosarray,map);
				
		}else{
			//limpar o mapa nativo
			map.clear();
			
			//recoloca o marcador do usuáio no map
			var outralatlng = new plugin.google.maps.LatLng(latAtual, lngAtual);
			
			map.addMarker({
				position: outralatlng,
				title: "Voce está aqui",
				snippet: "Essa e sua ultima localização !",
				icon: youicon,
				'styles' : {
					'text-align': 'center',
					'color': 'blue'
				}
			}, function(marker) {			
				//desenha as rotas no mapa nativo
				criapontosdeentradaNATIVO(asrotas);
			
				//coloca os marcadores nos pontos no mapa nativo
				colocarosmarkerNATIVO(ospontosarray);
			});
			
		}
	}
       
	//qd digita no campo de rotas faz a pesquisa no array que contem as rotas
	$("#inputbairros").keyup(function(){
		document.getElementById("caixasugestao").innerHTML = '';
			var texto = document.getElementById("inputbairros").value.trim();
			if(texto != "") {
				for(var i=0; i<words.length; i++) {	 
					if(words[i].match(new RegExp('^' + texto, "i"))) {
						document.getElementById("caixasugestao").innerHTML += '<p>'+words[i] + '</p>';
						//$('#caixasugestao').append('<tr><td>'+'<p style="text-align-last:center;">'+ words[i] + '</p>'+'</td><td>');
					}
				}
			}
		});
	}


//pegar a chave do array pelo valor
function chavePorValor(obj, val) {
    for(var chave in obj) {
        if(obj[chave] === val && obj.hasOwnProperty(chave)) {
            return chave;
        }
    }
}

function contatoComServidor(){
	//carrega o scrip do socket io
	if(conectadoservidor == 0 && tipomapa == 0){
		//carrega o scrip do socket io
		carregaScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js");
	}
}

//sucesso ao pegar a localização do mapa nativo
function MapaNativoLocalizacao( lat,lng ) {
		latAtual = lat;
		lngAtual = lng;
	    var Localizaatual = new plugin.google.maps.LatLng(lat, lng);
        myMap.animecaoMapa(Localizaatual);
		
		map.addMarker({
			position: Localizaatual,
			title: "Voce está aqui",
            snippet: "Essa e sua ultima localização !",
			icon: youicon,
            animation: plugin.google.maps.Animation.BOUNCE,
		   'styles' : {
			   'text-align': 'center',
				'color': 'blue'
			}
		}, function(marker) {
			marker.showInfoWindow();
		});
}



//assistir posição
function watchMapPosition() {
	watchID = navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, { enableHighAccuracy: true });
}

//função de retorno de assistir localização
function onMapWatchSuccess(position) {
		//aondequeroir e uma variavel global que contem o local ue o usuário deseja ir
		var updatedLatitude = position.coords.latitude;
		var updatedLongitude = position.coords.longitude;

		if (updatedLatitude != latAtual && updatedLongitude != lngAtual) {

			console.log(distancia(updatedLatitude,updatedLongitude,DestinoLat,DestinoLng));
			
			//verifica se a sua lozalização está proxima do ponto
			if (distancia(updatedLatitude,updatedLongitude,DestinoLat,DestinoLng) < 0.010 ){
				navigator.geolocation.clearWatch(watchID);
				directionsDisplay.setMap(null);	
				sualocalizacao.setMap(null);
				
				MapaWebLocalizacao(updatedLatitude, updatedLongitude,3);
				
				alerts.alertar("Chegou ao destino");
			}else{
				latAtual = updatedLatitude;
				lngAtual = updatedLongitude

				sualocalizacao.setMap(null);
			
				MapaWebLocalizacao(updatedLatitude, updatedLongitude,2);	
			}	
		
		}
}

//sucesso ao pegar a localização do mapa web
function MapaWebLocalizacao(latitude, longitude,primeraatuaizacao) {
		
		var latLong = new google.maps.LatLng(latitude, longitude);

		if(primeraatuaizacao == 1){
			sualocalizacao = new google.maps.Marker({position: latLong, icon: youicon,animation: google.maps.Animation.BOUNCE});
			
			sualocalizacao.addListener('click', function() {
				infowindowweb.open(map, sualocalizacao);	
			});
			
			infowindowweb.open(map, sualocalizacao);
		}else{
			sualocalizacao = new google.maps.Marker({position: latLong, icon: youicon});
		}
   
		sualocalizacao.setMap(map);
	
		if(primeraatuaizacao == 1){
			map.setCenter(sualocalizacao.getPosition());
		}else if(primeraatuaizacao == 2){
			criarotasAteOPonto();
		}
}

//fazer o calculo de procimidade com lat e lng
function distancia(lat1, lon1, lat2, lon2){
		
	rad = function(x) {return x*Math.PI/180;}
	var R = 6378.137;//Raio da Terra no km (WGS84)
	var dLat  = rad( lat2 - lat1 );
	var dLong = rad( lon2 - lon1 );
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;

	return d.toFixed(3);
}


//desenhar as rotas dos busus no mapa web
var flightPath;
function criapontosdeentradaWEB(pontosentrada){
	
	//para de assistir posição
	navigator.geolocation.clearWatch(watchID);
	
	//limpa o directions service do mapa
	directionsDisplay.setMap(null);
	directionsDisplay.setPanel(null);
	directionsDisplay = null;
	directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
	directionsDisplay.setMap(map);
	
	//se já exite remove rotas
	if (flightPath){flightPath.setMap(null);}
	
    flightPath = new google.maps.Polyline({
       path: pontosentrada,
       geodesic: false,
       strokeColor: '#18608d',
       strokeOpacity: 1.0,
       strokeWeight: 5
    });
	
	flightPath.setMap(map);

}


//desenhar as rotas dos busus no mapa nativo
var opolyline;
function criapontosdeentradaNATIVO(pontosentrada){
	
	 map.addPolyline({
		'points': pontosentrada,
		'color' : '#18608d',
		'width': 5,
	}, function(polyline) {
		opolyline = polyline;
	});
	 
}

//coloca o marquer no mapa WEB
var cacheDestLat;
var cacheDestLng;
var DestinoLat;
var DestinoLng;
var markerwe = [];
function colocarosmarkerWEB(contentString,locations,omap){
	var marker, i;
	
	//limpar as antigas rotas no mapa
	if(markerwe.length > 1){
		for (var i = 0; i < markerwe.length; i++ ) {
			markerwe[i].setMap(null);
		}
		markerwe.length = 0;
	}
	
	//percorre array e coloca no mapa os marcadores
	for (i = 0; i < locations.length; i++) {  
		marker = new google.maps.Marker({position: new google.maps.LatLng(locations[i].lat, locations[i].lng),map: omap, icon: busstopicon});
		markerwe.push(marker);
		
		//adiciona evento de click nos marcadores
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				//salva a posição do marcador clicado
				destinoCache = new google.maps.LatLng(locations[i].lat,locations[i].lng);
				//salva a lt e lng do macardor clicado
				cacheDestLat = locations[i].lat;
				cacheDestLng = locations[i].lng;
				
				//atualiza dados e cria o popup
				document.getElementById("cor").innerHTML = "Cor do Ônibus: "+contentString[0].cor;
				document.getElementById("dis").innerHTML = "Dist: "+contentString[0].dist;
				document.getElementById("tar").innerHTML = "Tarifa: "+contentString[0].tari;
				document.getElementById("hor").innerHTML = "Horários: "+contentString[0].hor;
				//mostra o pupup
				Infor.style.display = "block";

			}
		})(marker, i));
	}	
	
}

//coloca o marquer no mapa NATIVO
var markersnativo = [];
function colocarosmarkerNATIVO(locations){
	
	for(i=0;i<locations.length;i++){
		map.addMarker({
			'position': new plugin.google.maps.LatLng(locations[i].lat, locations[i].lng),
			snippet: "Ponto de ônibus !",
			icon: busstopicon
		}, function(marker) {
			markersnativo.push(marker);
		});
	}
 
}

//começar a fazer rotas
function comecarrota(){
	//verifica se o gps ta on
	cordova.plugins.diagnostic.isLocationEnabled(function(available){
		if (available){
			aondequeroir = destinoCache;
	
			DestinoLat = cacheDestLat;
			DestinoLng = cacheDestLng;
			//desenhar rota ate o ponto
			criarotasAteOPonto();
			//assistir a sua localização
			watchMapPosition(); 
		}else{
			setTimeout(function(){ 
				alerts.alertar("Ative o GPS");
				comecarrota();
			}, 3000);
		}
		
	}, function(error){
		console.log("The following error occurred: "+error);
		location.reload(); 
	});
}

//cria a rotas 
function criarotasAteOPonto() {
	var minhalocalizacao = new plugin.google.maps.LatLng(latAtual, lngAtual);
			
	directionsService.route({
		origin: minhalocalizacao,
		destination: aondequeroir,
		travelMode: 'WALKING'
	}, function(response, status) {
		if (status === 'OK') {
			directionsDisplay.setDirections(response);
		}
	});
		
}


//lida com erro
function onMapError(error){
	
	switch(error.code) {
		
      case error.PERMISSION_DENIED:
         alerts.alertar("Aplciativo sem permissão");
        break;
		
	  case error.POSITION_UNAVAILABLE:
        chaveAPIusada++
		if (validarValordeChave(chaveAPIusada)){
			carregaAPIgoogle(chaveAPIusada);
		}else{
			console.log("fodeu :/");	
		}
        break;
	}	
}


//evento pra quando ficar off
function onOnline() {
	if (tipomapa==1){
		alerts.showBottom("Reiniciando o APP");
		
		map.clear();
		map.off();
		$("#mapnativo").remove();
		$("#mapnativo").hide();
		$("#map").show();

		iniciaMapaWeb();
		//location.reload();
	}
	document.addEventListener("offline", onOffline, false);
}

//inicia o mapa web
function iniciaMapaWeb(){
	tipomapa=0;
	$("#map").show();
	myMap.abrirMapa(tipomapa,dimap);
}

//evento pra quando ficar on
function onOffline() {
	alerts.showBottom("APP offline");
	document.addEventListener("online", onOnline, false);
}
