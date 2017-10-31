
//variaveis globais

//salvar preferencias
var storage = window.localStorage;

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
var Infor = document.getElementById('myModal');
var termo = document.getElementById('Otermo'); 

//instancia a classe de alertas
var alerts = new AlertsClass();

//instancia a classe do mapa
var myMap = new MapaClass(alerts);
//infowindo do mapa web
var infowindowweb;
var contentString2 = '<div id="content">'+'Voce está aqui'+'</div>';

//pra saber se esta aberto o mapa web ou nativo
var tipomapa = 1;

//para verificar se o painel de pesquisa está visivel
var statuspainel = 0;


//rotas cadastradas
var words = ["Jockey X Santa Rosa",	
			 "Parque Aurora X Leao", 
			 "PPrazeres X IPS via J. Maria",	
			 "Eldorado X Codin",
			 "Eldorado X Centro",
			 "Nova Campos X Novo Mundo",
			 "Fundão X Centro",
			 "Cidade Luz",
			 "Bonsucesso X Centro",
			 "Ribeiro Do Amaro X Rodoviaria",
			 "Calabouço Sta X Cecília",
			 "Escola Agrotecnica",
			 "Lagoa das Pedras",
			 "Parque Prazeres X Alphaville",
			 "Nova Campos",
			 "Nova Campos X Novo Mundo-Custódia",
			 "Nova Campos X Nogueira",
			 "Parque Guarus X Nogueira",
			 "Sto Eduardo",
			 "Rodoviária X Travessão",
			 ];

	//array com as rotas dos busus
	var asrotas = [ 
		{k: 0, v: jockeyXSantaRosa },
		{k: 1, v: ParqueAuroraXLeao },
		{k: 2, v: PPrazeresXIPSviaJMaria },
		{k: 3, v: Eldorado_Codin },
		{k: 4, v: Eldorado },
		{k: 5, v: NovaCamposviaNMundo_Custódia },
		{k: 6, v: Fundão },
		{k: 7, v: Cidade_Luz },
		{k: 8, v: Bonsucesso },
		{k: 9, v: Ribeiro_Do_Amaro_Rodoviaria },
		{k: 10, v: Calabouco_Sta_Cecília },
		{k: 11, v: Escola_Agrotecnica },
		{k: 12, v: Lagoa_das_Pedras },
		{k: 13, v: PPrazeresxAlphaville },
		{k: 14, v: NovaCampos },
		{k: 15, v: Nova_Campos_via_N_Mundo },
		{k: 16, v: NovaCamposviaNogueira },
		{k: 17, v: PGuarusviaNogueira },
		{k: 18, v: Sto_Eduardo },
		{k: 19, v: Rodoviária_Travessao }
	];
		
	var ospontos = [
		{k: 0, v: pontostexte, cs: jockeyXSantaRosacs },
		{k: 1, v: pontosx, cs: pontostextecs },
		{k: 2, v: locatonList, cs: pontostextecs },
		{k: 3, v: pontostexte, cs: pontostextecs },
		{k: 4, v: pontosx, cs: pontostextecs },
		{k: 5, v: pontostexte, cs: pontostextecs },
		{k: 6, v: pontosx, cs: pontostextecs },
		{k: 7, v: pontosx, cs: pontostextecs },
		{k: 8, v: pontostexte, cs: pontostextecs },
		{k: 9, v: pontostexte, cs: pontostextecs },
		{k: 10, v: pontosx, cs: pontostextecs },
		{k: 11, v: pontostexte, cs: pontostextecs },
		{k: 12, v: pontostexte, cs: pontostextecs },
		{k: 13, v: pontosx, cs: pontostextecs },
		{k: 14, v: pontostexte, cs: pontostextecs },
		{k: 15, v: pontosx, cs: pontostextecs },
		{k: 16, v: pontosx, cs: pontostextecs },
		{k: 17, v: pontosx, cs: pontostextecs },
		{k: 18, v: pontostexte, cs: pontostextecs },
		{k: 19, v: pontosx, cs: pontostextecs }
	];
 
//inicio de tudo vulgo Main()
document.addEventListener("deviceready", function() {  
	try {
		//n deixa o celular ficar de lado
		screen.orientation.lock('portrait-primary');
	} catch (error) {
		// whatever
	}
	
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
		
	//verifica se e a primeira vez q o app abre
	var vez = storage.getItem("R"); 
	if(vez == null && vez != "Segundavez"){
		termo.style.display = "block";
	}else{
		//continua o app
		Main();
		//splash screen
		window.setTimeout(function () {
			navigator.splashscreen.hide();
		}, 10);
	}
	 
	
				
}, false);

//responsavel pelo termo de compromisso
function validateForm(){
	if (document.TermoForm.opcao[0].checked == true) {
		console.log("Termo aceito");
		
		//libera acesso ao app
		storage.setItem("R", "Segundavez");
		
		//prossegue com o app
		Main();
		//fecha o popup
		termo.style.display = "none";
		
	}else if (document.TermoForm.opcao[1].checked == true){
		console.log("Termo não aceito");
		
		//fecha o popup
		termo.style.display = "none";	
		
		//fecha o app
		navigator.app.exitApp();
	}else{
		alerts.alertar("Por favor, escolha uma opção.");
	}
	return false;
}

function Main(){
	//deixar a barra transparente
	statusbarTransparent.toggle(); 
	statusbarTransparent.enable();
	
	//classe para verificar a net
	var myNet = new NetStatus();
	var netOnoOff = myNet.GetNet();
	
	//verifica o se tem net para ver se vai abrir o mapa web ou nativo	
	if (netOnoOff){
		iniciaMapaWeb();
	}else{
		tipomapa=1;
		console.log("Mapa Inativo");
		alerts.alertar("É necessário conexão com internet para utilizar esse aplicativo");
	}
	
	if(tipomapa == 0){
	
		//começar a desenhar as roras
		$( "#comRota" ).click(function() {
			Infor.style.display = "none";
			comecarrota();
		});
		
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
		
		//para não fechar o app ao apertar o botao voltar
		document.addEventListener("backbutton", LimpaCampoPesquisa, false);
	}
}

function procuraRotas(e){
	var chavevetor = parseInt(chavePorValor(words,e));
		if (chavevetor || chavevetor == 0 ){
			//se a infowindo estiver aberta fecha
			if(tipomapa == 0){infowindowweb.close();}
			
			LimpaCampoPesquisa();
			//colocar as rotas no mapa		
			selecionarRotas(chavevetor);
			desenhaNoMap(asrotas[chavevetor].v,ospontos[chavevetor].v,ospontos[chavevetor].cs);
		}
}

function LimpaCampoPesquisa(){
	//tira o foco do campo de texto
	$("#pac-input").blur();
	map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
	statuspainel = 0;
}
	
var shots = 0;
function selecionarRotas(chave){
	if (conectadoservidor == 1){
		socket.removeAllListeners("listBus");
		alerts.showBottom("Recebendo rotas do servidor.");
		recebeRotas(chave);
	} else {
		contatoComServidor();
		setTimeout(function(){ 
			if (shots<3){
				if (shots==0) { alerts.showBottom("Tentando receber a localização do ônibous");}
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
				
	}
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
			sualocalizacao = new google.maps.Marker({position: latLong, icon: youicon});
			
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
				
				LimpaCampoPesquisa();
				
				//se a infowindo estiver aberta fecha
				if(tipomapa == 0){infowindowweb.close();}
				
				//atualiza dados e cria o popup
				document.getElementById("title").innerHTML = contentString[0].title;
				document.getElementById("tar").innerHTML = contentString[0].tari;
				document.getElementById("hor").innerHTML = contentString[0].hor;
				//mostra o pupup
				Infor.style.display = "block";

			}
		})(marker, i));
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
		
		iniciaMapaWeb();
		//location.reload();
	}
	document.addEventListener("offline", onOffline, false);
}

//inicia o mapa web
function iniciaMapaWeb(){
	tipomapa=0;
	myMap.abrirMapa(tipomapa,dimap);
}

//evento pra quando ficar on
function onOffline() {
	alerts.showBottom("APP offline");
	document.addEventListener("online", onOnline, false);
}
