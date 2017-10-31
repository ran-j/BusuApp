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
		}
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
				
				//carrega o script da infowindo customizavel
				var script = document.createElement('script');
				script.src = "./js/lib/Infowin/infobox.js";
				document.body.appendChild(script);
				
				//espera carregar o js e executa os passo seguintes
				script.onload = function() {
					
					//cria a janela do infowindo
					var boxText = document.createElement("div");
					boxText.style.cssText = "margin-top: 8px; background: #DA9827; padding: 5px; color: white; font-size: 250%;text-align: center;border-radius: 10px;";
					boxText.innerHTML = "Voce está aqui";
				
					var MinhainfoWindo = {
						content: boxText
						,disableAutoPan: false
						,maxWidth: 0
						,pixelOffset: new google.maps.Size(-140, 0)
						,zIndex: null
						,boxStyle: { 
							background: "url('tipbox.gif') no-repeat"
							,opacity: 0.75
							,width: "280px"
						}
						,closeBoxMargin: "10px 2px 2px 2px"
						,closeBoxURL: "./img/close.gif"
						,infoBoxClearance: new google.maps.Size(1, 1)
						,isHidden: false
						,pane: "floatPane"
						,enableEventPropagation: false
					};
					
					//cria a infowindo customizada
					infowindowweb = new InfoBox(MinhainfoWindo);
				
				
					mapaWeb(dimap);
				};
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

function mapaWeb(dimap) {
			 
		var mapOptions = {
			center: new google.maps.LatLng(-21.7634634,-41.3188553),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
		};

		//cria instancia do mapa
		map = new google.maps.Map(dimap, mapOptions);
				
		//botão de pesquisa
		var sBUtton = document.getElementById('searchBUtton');
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sBUtton);
		
		//espera um tempo para o botão não aparecer primeiro
		setTimeout(function(){ 
			//mostra o botão no mapa
			$("searchBUtton").show();
		}, 500);
		
		//evento click do botão
		$( "#searchBUtton" ).click(function() {
			infowindowweb.close();
		   //mostra a barra de pesquisa
		    if(statuspainel == 1){
			    map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
			    statuspainel = 0;
		    }else{
			    addpanel();
			    statuspainel = 1;
		    }
		});
		
		
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
			map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
			statuspainel = 0;
			infowindowweb.close();
		});				
}

function addpanel(){	
		var selectList = document.createElement("select");
		selectList.id = "pac-input";
		selectList.classList.add('controls');
		selectList.setAttribute("onchange", "procuraRotas(this.value)");
				
		for (var i = -1; i < words.length; i++) {
			var option = document.createElement("option");
			if(i==-1){
				option.value = "";
				option.text = "Selecione uma rota";
				option.disabled = false;
				selectList.appendChild(option);
			}else{
				option.value = words[i];
				option.text = words[i];
				selectList.appendChild(option);
			}
		}
		
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(selectList);
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

	navigator.geolocation.getCurrentPosition(onLocationSuccessWEB, erroWEB, { timeout: 5000, enableHighAccuracy: true });
		
}

//sucesso ao pegar a localização através do mapa web
function onLocationSuccessWEB( position ) {
 
	latAtual = position.coords.latitude;
	lngAtual = position.coords.longitude;
	
	MapaWebLocalizacao(latAtual,lngAtual,1);
	
	contatoComServidor();
}

//erro do mapa web
function erroWEB(erro){
	console.log("Deu erro ao pegar posição");
	pegarposicaoWEB();
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
