

NetStatus = function(){//responsalvel por verificar e monitorar net

  this.GetNet = function(){
	var networkState = navigator.connection.type;

		if (networkState !== Connection.NONE) {//verifica se esta online
			console.log("online");
			document.addEventListener("offline", onOffline, false);//aber evento pra quando estiver offline
			return true;
			
		}else{
			console.log("offline");
			document.addEventListener("online", onOnline, false);//aber evento pra quando estiver online
			return false;
		}
  }
  
  this.GetNetType = function(){//verificar qual o tipo de conexão
	var networkState = navigator.connection.type;
		return networkState;
  }
}