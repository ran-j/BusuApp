var directionsDisplay;
var directionsService; 
var map;
var alertasr;
var carregaAPI;
var chaveAPIusada = 0;
var maxAPIguardada = 1;
var chavesAPI = [
			{ v : 'AIzaSyDvM1cUp3loUZDV-PfvC-ME3pgZ50u88Ek'},
			{ v : 'AIzaSyDkZ48FrfrBIJ0d8HuAROSM8YUbbwfhmqA'}
			];

			//https://console.cloud.google.com/iam-admin/quotas?project=busu-164922&hl=pt-BR
			
MapaClass = function(alerts){//responsalvel pelos mapas
	
	this.abrirMapa = function(tipodemapa,dimap){
		alertasr = alerts;
		
		if(tipodemapa==0){
			console.log("Mapa WEB");
			
			carregaAPIgoogle(chavesAPI[chaveAPIusada].v);
			
		}else{
			console.log("Mapa NATIVO");
			
			mapaNativo(dimap);
		}
	}
	
	this.animecaoMapa = function(alvo){
		animaCamNativo(alvo);	
	}
  
}

//carregar a API do google
function carregaAPIgoogle(chaveAPI){
	try {		
		carregaAPI = $.getScript( "https://maps.googleapis.com/maps/api/js?key="+chaveAPI, function( data, textStatus, jqxhr ) {
			console.log( textStatus ); // Success
			console.log( jqxhr.status ); // 200
			console.log( "Load was performed google maps api" );
			
			if (textStatus == "success"){
				infowindowweb = new google.maps.InfoWindow({content: contentString2}); 
				mapaWeb(dimap);
			}else{
				setTimeout(function(){ 
					carregaAPIgoogle(chaveAPI);
				}, 3000);
				 
			}
		});	
	} catch(err) {
		setTimeout(function(){ 
			carregaAPIgoogle(chaveAPI);
		}, 3000);
	}
}

//verifica o numero de aps salvas
function validarValordeChave(chave){
	if (chave <= maxAPIguardada){
		return true;
	}
	return false;	
}
  

function mapaNativo(dimap){
	 //verifica se o mapa está disponivel
	 plugin.google.maps.Map.isAvailable(function(isAvailable, message) {
		if (isAvailable) {
			//cria o mapa
			map = plugin.google.maps.Map.getMap(dimap);
			map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
		} else {
			//manda erro pra teala
			alertasr.alertar(message);
			//tenta de novo
			setTimeout(function(){ 
				mapanativo(dimap);
			}, 4000);
		}
	});
}

//função de quando o mapa nativo está pronto
function onMapReady() {
	tipomapa = 1;
	console.log("Carregou o mapa nativo");
	alertasr.alertar("Voce está usando a versão offline do aplicativo");
	pegarposicaoNATIVO();
}


function mapaWeb(dimap) {
			 
		var mapOptions = {
			center: new google.maps.LatLng(-21.7634634,-41.3188553),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};

		//cria instancia do mapa
		map = new google.maps.Map(dimap, mapOptions);
		
		//adiciona o painel flutuante
		var input = document.getElementById('pac-input');
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
		setTimeout(function(){ 
				$("#pac-input").show();
		}, 400);
		
		
		//espera o mapa carregar
		google.maps.event.addListenerOnce(map, 'idle', function(){
			console.log("Carregou o mapa web");
			
			//istancia o directionsService, que e pra fazer rotas ate os pontos
			directionsService = new google.maps.DirectionsService;
			directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
			directionsDisplay.setMap(map);
			VerificarGps(dimap);
		});
		
		map.addListener('click', function(e) {
			$("#pac-input").blur();
		});		
}

//variavel axuliar, não mexe
var aux;
//verifica se o GPS está ativo, só pro mapa WEB
function VerificarGps(dimap){
	aux = dimap;
	var os = device.platform;
	
	cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
		if(enabled){
				
			cordova.plugins.diagnostic.isLocationAvailable(function(available){
					
				if (available){
				
					cordova.plugins.diagnostic.isLocationAuthorized(function(authorized){
						
						if (authorized){
							pegarposicaoWEB();
						}else{
							alertasr.alertar("Sem autorização para usar o GPS");
						}
						
					}, function(error){
						console.log("The following error occurred: "+error);
						location.reload(); 
					});
					
				}else{
					
					console.log(os);
					
					if (os=="Android"){
						cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
							switch(status){
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									calertasr.alertar("Permission not requested");
									mapaNativo(dimap);
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									console.log("Permissão concedida");
									VerificarGps(dimap);
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									console.log("Permissão negada");
									VerificarGps(dimap);
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
									alertasr.alertar("Permission permanently denied");
									mapaNativo(dimap);
								break;
							}
						}, function(error){
							console.error(error);
					});
					}else if (os=="iOS"){
						cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
							switch(status){
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									alertasr.alertar("Permission not requested");
									mapaNativo(dimap);
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									console.log("Permissão negada");
									mapaNativo(dimap);
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									console.log("Permissão concedida");
									VerificarGps(dimap);
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
									console.log("Permissão concedida");
									VerificarGps(dimap);
									break;
							}
						}, function(error){
							console.error(error);
						}, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
					}
				}
						
			}, function(error){
					console.log("The following error occurred: "+error);
					location.reload(); 
			});
				
		}else{
			if (os=="Android"){
				navigator.notification.confirm(
					'Ative o GPS',  
					onConfirm,            
					'Busu',           
					['Fechar','Ok']     
				);
			}else{
				alertasr.alertar("Ative o GPS");
			}
		}
	}, function(error){
		console.log("The following error occurred: "+error);
		location.reload(); 
	});
}

//função para receber o parametro do botao
function onConfirm(buttonIndex) {
	if (buttonIndex == 2){
		cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
				
			if (enabled == false){
				//abrir as configurações de GPS
				cordova.plugins.settings.openSetting("location_source");
				setTimeout(veriifiloop, 2000);
			}else{
				mapaWeb(aux);
			}
					
		}, function(error){
			console.log("Ocorreu o seguinte erro "+error);
		});	
	}else{
		navigator.app.exitApp();  // For Exit Application
	}
}

//fica em loop aguardando o GPS ficar ligado
function veriifiloop(){
	cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
				
		if (enabled){
			alertasr.showBottom("Aguarde");
			setTimeout(function(){ 
				VerificarGps(aux);
			}, 800);
			 
		}else{
			setTimeout(veriifiloop, 2000);
		}	
	}, function(error){
		console.log("Ocorreu o seguinte erro "+error);
	});	
	
}

//solicitar localização do mapa web
function pegarposicaoWEB() {

	navigator.geolocation.getCurrentPosition(onLocationSuccessWEB, erroWEB, { maximumAge: 5000, timeout: 3000, enableHighAccuracy: true });
		
}

//solicitar localização do mapa nativo
function pegarposicaoNATIVO() {
	  var option = {enableHighAccuracy: true};
	  map.getMyLocation(option, onLocationSuccessNativo, erroNATIVO);
}


//sucesso ao pegar a localização através do mapa web
function onLocationSuccessWEB( position ) {
 
	latAtual = position.coords.latitude;
	lngAtual = position.coords.longitude;
	
	MapaWebLocalizacao(latAtual,lngAtual,1);
	
	contatoComServidor();
}

//sucesso ao pegar a localização através do mapa nativo
function onLocationSuccessNativo( result ) {
	latAtual = result.latLng.lat;
	lngAtual = result.latLng.lng;
	//está no index.js
	MapaNativoLocalizacao(latAtual,lngAtual);
}


//erro do mapa web
function erroWEB(erro){
	alertasr.alertar( 'code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
}

//erro do mapa nativo
function erroNATIVO(erro){
	alertasr.alertar( "Erro ao iniciar os modulos do mapa" );
}


//anivamação de camera para mapa nativo
function animaCamNativo(targetanima){
	//animação secundaria
	/*map.animateCamera({
		'target': targetanima,
		'tilt': 50,
		'zoom': 18,
		'bearing': 160
	});*/
	
	map.animateCamera({
		'target': targetanima,
		'zoom': 15,
	});	
}

//handleEvent de erros do google maps
function gm_authFailure() { 
	chaveAPIusada++
	if (validarValordeChave(chaveAPIusada)){
		google.maps.event.clearInstanceListeners(window);
		google.maps.event.clearInstanceListeners(document);
		google.maps.event.clearInstanceListeners(map);
		$(carregaAPI).remove();
		carregaAPIgoogle(chavesAPI[chaveAPIusada].v);
	}else{
		alertasr.alertar( "Erro critico" );
		//location.reload();
	}
};
