 
 AlertsClass = function(){//responsalvel por menssagems e popups

	this.alertar = function(texto){
		alert(texto);
	}
	
	this.showBottom = function(texto){
		showToast(texto);
	}
  
}

function alert(mensagem){
	navigator.notification.alert(
		mensagem,  // message
		'Busu',// title
		'Busu'// buttonName
	);
}

function showToast(message) {
	window.plugins.toast.showWithOptions({
		message: message,
		duration: "long", // 2000 ms 
		position: "center",
		styling: {
			backgroundColor: '#000000', // make sure you use #RRGGBB. Default #333333 
			textColor: '#FFFFFF', // Ditto. Default #FFFFFF 
		}
	});
}
