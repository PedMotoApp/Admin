import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable()
export class HttpdProvider {
  
  contentHeader: Headers = new Headers({'Content-Type': 'application/json'});

  baseurl: string = 'https://us-central1-vaapy-app.cloudfunctions.net'
  
  urlSendRequest: string =  this.baseurl + '/apiSendRequest'
  urlStatusRequest: string = this.baseurl + '/apiGetStatusReceived'
  urlPriceRequest: string = this.baseurl + '/apiPriceRequest'
  
  urlSMSSend: string = this.baseurl + '/sendSmsTwilio'
  urlWhatsAppSend: string = this.baseurl + '/sendWhatsAppTwilio'

  urlAddUser: string = this.baseurl + '/apiAddUser'
  urlRemoveUser: string = this.baseurl + '/apiRemoveUser'
  urlRemoveAllUsers: string = this.baseurl + '/apiRemoveAllUsers'


  urlIfoodAuthUserCode: string = this.baseurl + '/apiIfoodAuthUserCode'
  urlIfoodAuthConfirmation: string = this.baseurl + '/apiIfoodAuthUConfirmation'
  urlIfoodMerchants: string = this.baseurl + '/apiIfoodMerchants'
  urlIfoodMerchantsInfo: string = this.baseurl + '/apiIfoodMerchantsInfo'
  urlIfoodMerchantsStatus: string = this.baseurl + '/apiIfoodMerchantsStatus'
  urlIfoodGetEvents: string = this.baseurl + '/apiIfoodEvents'
  urlIfoodGetEventsAck: string = this.baseurl + '/apiIfoodEventsAck'
  urlIfoodConfirmOrder: string = this.baseurl + '/apiIfoodConfirmOrder'
  urlIfoodDetailsOrder: string = this.baseurl + '/apiIfoodDetailsOrder'
  urlIfoodCancelOrder: string = this.baseurl + '/apiIfoodCancelOrder'
  urlIfoodDeliveryOrder: string = this.baseurl + '/apiIfoodDeliveryOrder'  
  urlIfoodPickupOrder: string = this.baseurl + '/apiIfoodReadyToPickUp'  


  urlOnPedidoStatusChanged: string = this.baseurl + '/apiOnPedidoChangeStatus'  
  urlOnPedidoStatusCancel: string = this.baseurl + '/apiOnPedidoChangeStatusCancel'  
  urlOnPedidoInfoStore: string = this.baseurl + '/apiOnPedidoInfoStore'  
  

  constructor(public http: HttpClient) {
    console.log('Hello HttpdProvider Provider');    
  }

  enviaSMS(mensagem_, telefone_){

    let tel = "+55" + telefone_
    let msg = "Sistema Motok informa: " + mensagem_
    let myData = JSON.stringify({mensagem: msg, telefone: tel});
    
    const headers = new HttpHeaders({'Content-Type':'application/json'});    
    return this.http.post(this.urlSMSSend, myData, {headers: headers})   
  }


  enviaWhatsApp(mensagem_, telefone_){

    let tel = "+55" + telefone_
    let msg = "Sistema Motok informa: " + mensagem_
    let myData = JSON.stringify({mensagem: msg, telefone: tel});
    
    const headers = new HttpHeaders({'Content-Type':'application/json'});    
    return this.http.post(this.urlWhatsAppSend, myData, {headers: headers})   
  }

  apiSendRequest(data){                  
        
    data.datetimeFormated = moment().format()    
    data.isPremium = false

    let myData = JSON.stringify(data);
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});            

    return this.http.post(this.urlSendRequest, myData, {headers: headers})   
  }

  apiGetStatusReceived(data){    
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});            
    return this.http.post(this.urlStatusRequest, myData, {headers: headers})   
  }

  apiPriceRequestReceived(data){    
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});                
    return this.http.post(this.urlPriceRequest, myData, {headers: headers})   
  }

  apiAddUser(data){    
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});            
    return this.http.post(this.urlAddUser, myData, {headers: headers})   
  }

  apiRemoveUser(data){    
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});            
    return this.http.post(this.urlRemoveUser, myData, {headers: headers})   
  }

  apiRemoveAllUsers(data){    
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});            
    return this.http.post(this.urlRemoveAllUsers, myData, {headers: headers})   
  }

      
  apiIfoodGetUserCode(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodAuthUserCode, myData, {headers: headers})   
  }

  apiIfoodSetAuthConfirmation(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodAuthConfirmation, myData, {headers: headers})   
  }

 
  apiIfoodGetMerchants(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodMerchants, myData, {headers: headers})   
  }

  apiIfoodGetMerchantsInfo(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodMerchantsInfo, myData, {headers: headers})   
  }

  apiIfoodGetMerchantsStatus(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodMerchantsStatus, myData, {headers: headers})   
  }

  apiIfoodGetEvents(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodGetEvents, myData, {headers: headers})   
  } 

  apiIfoodGetEventsACK(data){                   
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});               
    return this.http.post(this.urlIfoodGetEventsAck, myData, {headers: headers})   
  }   

  apiIfoodGetOrderDetails(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodDetailsOrder, myData, {headers: headers})   
  } 

  apiIfoodConfirmOrder(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodConfirmOrder, myData, {headers: headers})   
  } 


  apiIfoodCancelOrder(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodCancelOrder, myData, {headers: headers})   
  } 
  
  apiIfoodDeliveryOrder(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodDeliveryOrder, myData, {headers: headers})   
  } 

  apiIfoodPickupOrder(data){               
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlIfoodPickupOrder, myData, {headers: headers})   
  } 



  apiOnPedidoInfoStore(data){               

    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlOnPedidoInfoStore, myData, {headers: headers})   
  } 

  
  apiOnPedidoStatusChanged(data){               

    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlOnPedidoStatusChanged, myData, {headers: headers})   
  } 

  apiOnPedidoStatusCancel(data){               

    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json'});                
    return this.http.post(this.urlOnPedidoStatusCancel, myData, {headers: headers})   
  } 

  

  apiPriceRequest(data){    
    let myData = JSON.stringify(data);        
    let headers = new HttpHeaders({'Content-Type':'application/json', 'Authorization': 'Bearer ' + data.token});                   
    return this.http.post(this.urlPriceRequest, myData, {headers: headers})   
  }  


}
