var socket;

	//baixa o script
	function carregaScript(link){
		$.getScript( link, function( data, textStatus, jqxhr ) {
			console.log( textStatus ); // Success
			console.log( jqxhr.status ); // 200
			console.log( "Load was performed socket.io" );
		
			abrirConexao('http://busu.ucam-campos.br');		
		});
	}
	 
	//inicia a conexão com o server
	function abrirConexao(url){
		
		showToast("Conectando ao servidor");
		
		$.ajax({url: url,
            dataType: "jsonp",
			timeout:1000,
            statusCode: {
                200: function (response) {
                    socket = io.connect(url,{'forceNew':true });
					SucessoServidor();
                },
                404: function (response) {
					ErroServidor();
                },
				0: function (response) {
					ErroServidor();
				}         
            }                        
		});

	}	
	
	function SucessoServidor(){
		console.log("Server on");
		conectadoservidor = 1;
		
		socket.on('connect', function(msg){
			showToast("Conectado ao servidor");
			console.log("Conectado");
				
			//se cadastra no servidor para receber emits
			socket.emit("Cadastro", "Celular");
				
			//mostra todos os busu na tela
			comecarAReceber();
			
			//tombar conexão
			socket.on('forceDisconnect', function(){
				conectadoservidor = 0;
				fecharConexao();
			});
			
		});
		
		
		//pra saber que caiu a conexão
		socket.on("disconnect", function(){
			conectadoservidor = 0;
			showToast("Desconectado do servidor");
			console.log("Desconectado");
		});
	}
	
	function ErroServidor(){
		//so mostra a mensagem e chora
		console.log("Server off");
		 
		showToast("Servidor Offline");
		conectadoservidor = 0;
	}
	
	function fecharConexao(){
		socket.disconnect();
		conectadoservidor = 0;
	}
  
	var onibus = [];
	var asmarker;
	function comecarAReceber(){
				
		socket.on('listBus', function(abus){

			for(var i=0; i < abus.length; i++){
				var localizacaodoBusu = new google.maps.LatLng(abus[i].local[0], abus[i].local[1]);
				
				if ( onibus[i] ) {
					onibus[i].setPosition(localizacaodoBusu);
				} else {
					asmarker = new google.maps.Marker({
						position: localizacaodoBusu,
						icon: busicon,
						//map: map
					});
					onibus[i] = asmarker;
				}	
			}			
		});
			
	}
	
	var onibusRecebeido = [];
	var MarcadorOnibus;
	function recebeRotas(chave){
				
		if (onibusRecebeido.length > 1){
			for(var i=0; i < onibusRecebeido.length; i++){
					onibusRecebeido[i].setMap(null);
			}
			onibusRecebeido = [];
		}
		
		socket.on('listBus', function(abus){
			for(var i=0; i < abus.length; i++){
				if ("rota" in abus[i]){ 
					if(abus[i]["rota"] == chave){
						var rLat = parseFloat(abus[i]["local"][0]);
						var rLng = parseFloat(abus[i]["local"][1]);
						var localizacaodoBusu = new google.maps.LatLng(rLat, rLng);
						
						if ( onibusRecebeido[i] ) {
							onibusRecebeido[i].setPosition(localizacaodoBusu);
						} else {
							MarcadorOnibus = new google.maps.Marker({
								position: localizacaodoBusu,
								icon: busicon,
								map: map
							});
							onibusRecebeido[i] = MarcadorOnibus;
						}			
					}
				}
			}			
		});
	}
	
	
	
	
 

 
