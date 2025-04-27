import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-ifood',
  templateUrl: 'ifood.html',
})
export class IfoodPage {


  payload: any = {status: 'Aguardando autenticação'}  
  ifoodClientId: string = ""
  ifoodClientSecret: string = ""  
  isAuthConfigVisible: Boolean = false
  storeInterval: any  

  allStores: any = []

  constructor(
    public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,  
    private iab: InAppBrowser,
    public events: Events,
    public dataText: DataTextProvider,
    public httpd: HttpdProvider,    
    public navParams: NavParams) {

  }

  ionViewDidLoad() {        

    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')          

  }


  ngOnDestroy(){
    clearInterval(this.storeInterval)
  }

  showAuth(){
    this.isAuthConfigVisible = !this.isAuthConfigVisible
  }

  startInterface(){
      

      this.ifoodClientId = this.dataInfo.appConfig.ifoodClientId
      this.ifoodClientSecret = this.dataInfo.appConfig.ifoodClientSecret  

      if(this.dataInfo.userInfo.ifoodClientSecret)
        this.ifoodClientSecret = this.dataInfo.userInfo.ifoodClientSecret

      if(this.dataInfo.userInfo.ifoodClientId)
        this.ifoodClientId = this.dataInfo.userInfo.ifoodClientId

      if(this.dataInfo.userInfo && this.dataInfo.userInfo.ifood)
        this.payload = this.dataInfo.userInfo.ifood        

        this.checkAuth()
  }  

  checkAuth(){    
    

    if(this.payload){    
      this.getMerchants()

    } else {
      this.checkAuthToken()      
    }
  }

  checkAuthToken(){

    this.payload = {status: 'Aguardando autenticação'}
    this.uiUtils.showAlertError("Autenticando sua loja no ifood....")
    this.getAuthToken()
  }
  
  
  getAuthToken(){

    if(this.payload.expiresIn){

      let expires = moment(this.payload.expiresIn, "DD/MM/YYYY HH:mm:ss")
      let now = moment()

      if(expires.isValid()){

          if(expires.isAfter(now)){
            this.getAuthContinue()                
          }

          else {
            this.uiUtils.showAlertError("O token atual ainda é válido")
          }
      }
      else {
        this.uiUtils.showToast("Baixando novo token")
        this.getAuthContinue()                
      }

    }
    else {
      this.getAuthContinue()    
    }

    

  }


  getAuthContinue(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    let data = {clientId: this.ifoodClientId, clientSecret: this.ifoodClientSecret}  
    console.log(data)
    
    this.payload.authorizationCode = ""
    this.payload.accessToken = ""
    this.payload.refreshToken = ""

    this.httpd.apiIfoodGetUserCode(data)
    .subscribe((data) => {

      loading.dismiss()
      this.authTokenCallback(data)

    }, error => {

      loading.dismiss().then( () => {

        console.log(error)        
        this.payload.status = 'Aguardando autenticação'

        this.uiUtils.showAlert(this.dataText.warning, "Não foi possível gerar o token").present()
      });

    });
    
  }


  authTokenCallback(data){

      this.payload = data

      this.payload.status = 'Token recebido'
      this.payload.datetime = moment().format()
      this.payload.datetimeStr = moment().format("DD/MM/YYYY HH:mm:ss")
      this.payload.expiresInStr = moment().add(data.expiresIn, 'seconds').format("DD/MM/YYYY HH:mm:ss")      
      
      this.db.addIfoodVerification(this.dataInfo.userInfo.uid, data)
      .then(() => {

        
        this.uiUtils.showAlertSuccess('Informações do ifood salvas com sucesso')

      })

  }

  authApp(){

    let options = 'location=no';
    let url = this.payload.verificationUrlComplete

    if(this.dataInfo.isWeb)
      this.iab.create(url, '_blank', options);    
    else 
      this.iab.create(encodeURI(url), '_system', options);

  }


  authStore(){


    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    let data = {

        grantType: 'authorization_code', 
        clientId: this.ifoodClientId, 
        clientSecret: this.ifoodClientSecret, 
        authorizationCode: this.payload.authorizationCode, 
        authorizationCodeVerifier: this.payload.authorizationCodeVerifier }  



    this.httpd.apiIfoodSetAuthConfirmation(data)
    .subscribe((data) => {

      loading.dismiss()
      this.authStoreCallback(data)

    }, error => {

      loading.dismiss().then( () => {

        console.log(error)        
        this.payload.status = 'Aguardando autenticação'

        this.uiUtils.showAlert(this.dataText.warning, "Não foi possível autenticar").present()
      });
    })

  }





  authStoreCallback(data){

    if(data.msg){
      this.payload.status = data.msg
      


      this.payload.accessToken = data.accessToken
      this.payload.refreshToken = data.refreshToken

      this.showAuth()
      this.uiUtils.showAlertError(data.msg)
    }
        

    else 
      this.authStoreContinue(data)    
      
 }


 authStoreContinue(data){

  this.payload.status = 'Autenticado'
  this.payload.accessToken= data.accessToken
  this.payload.accessTokenType= data.type
  this.payload.accessTokenExpires = data.expiresIn
  this.payload.accessTokenExpiresStr = moment().add(data.expiresIn, 'seconds').format("DD/MM/YYYY HH:mm:ss")
  
  this.payload.refreshToken = data.refreshToken
  
  this.db.addIfoodVerification(this.dataInfo.userInfo.uid, this.payload)
  .then(() => {

    this.uiUtils.showAlertSuccess('Informações do ifood salvas com sucesso. Selecione a loja que você vai usar e clique em continuar')
    this.payload.status = 'Selecionar loja'
  })

 }


  getMerchants(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    let data = {clientId: this.ifoodClientId, token: this.payload.accessToken}  

    this.httpd.apiIfoodGetMerchants(data)
    .subscribe((data) => {

      loading.dismiss()
      this.getMerchantsCallback(data)


    }, error => {

      loading.dismiss().then( () => {

        console.log(error)        
        this.payload.status = 'Aguardando autenticação'

        this.uiUtils.showAlert(this.dataText.warning, "Não foi possível verificar os eventos. Provavelmente seu token expirou!").present()
      });
    })
  }


  getMerchantsCallback(data){

    if(data){      

      if(data[0]){
          
        this.payload.stores = data
        this.payload.status = 'Aguardando eventos'        
        data[0].lastEvent = this.dataText.pleaseWait

        this.getEvents(data[0])

        

        this.storeInterval = setInterval(() => {
          this.getEvents(data[0])
        }, 30000);


      }
      else {

        let msg = "Houve um erro ao verificar as lojas"

        if(data.message){          
          msg = "Houve um erro ao verificar as lojas " + data.message
        }

        this.uiUtils.showAlertError(msg)
      }

    }
    
  }
 
  getEvents(store){
                
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()


    store.orders = []
    
    let data = {clientId: this.ifoodClientId, token: this.payload.accessToken}  

    this.httpd.apiIfoodGetEvents(data)
    .subscribe((data) => {

      loading.dismiss()
      this.getEventsCallback(store, data)      
      
    }, error => {

      loading.dismiss().then( () => {

        this.payload.status = 'Aguardando autenticação'
        this.uiUtils.showAlert(this.dataText.warning, "Não foi possível verificar os eventos. Provavelmente seu token expirou!").present()
      });
    })
  }

  getEventsCallback(store, data){

    store.lastEvent = moment().format("DD/MM/YYYY HH:mm:ss")

    if(data){
        this.getEventsContinue(store, data)      

    }
    else {
      this.uiUtils.showToast("Nenhum evento recebido até o momento")
    }
    
  }


  getEventsContinue(store, data){

    store.orders = data
    console.log(store.orders)

    let self = this        
    
    if(store.orders && Array.isArray(store.orders)){

      let promises = []

      store.orders.forEach(element => {

        let promise = new Promise<void>(function(resolve){

          element.createdAtStr = moment(element.createdAt).format("DD/MM/YYYY HH:mm:ss")           
                
          self.getOrderDetails(data, element)            

          .then(() => {
            resolve()
          })

        })

        
        promises.push(promise)


      });



      Promise.all(promises).then(function(){

        self.getEventsFinish(data)  

        self.orderEvents(store)
        self.uiUtils.showToast("Eventos do atualizados com sucesso")
      })

      
    
    }
    else {
      console.log('Ignorando evento vazio')
    }
    
    
  }



  getEventsFinish(data){

    let data1 = { clientId: this.ifoodClientId, token: this.payload.accessToken, orders: data}        
    this.confirmEvents(data1)

    .then(() => {

      data.forEach(element => {          
        this.db.addIfoodEvent(element)  
      });        

    })

  }


  getOrderDetails(data, element){

    return new Promise<void>((resolve, reject) => {      

      data.orderId = element.orderId    

      let data1 = {clientId: this.ifoodClientId, token: this.payload.accessToken, id: element.orderId}  

      this.httpd.apiIfoodGetOrderDetails(data1)
        .subscribe((callback) => {

          this.ordersDetailsCallback(element, callback)             
          resolve()
        })
    })
    
  }


  ordersDetailsCallback(data, callback){

    data.details = callback

    if(data.details && data.details.delivery && data.details.delivery.deliveryDateTime){
      data.details.delivery.deliveryDateTimeStr = moment(data.details.delivery.deliveryDateTime).format("DD/MM/YYYY HH:mm:ss")

    }

  }

 confirmEvents(data){  


  return new Promise<any>((resolve, reject) => {      

    this.httpd.apiIfoodGetEventsACK(data)

      .subscribe((callback) => {        
        resolve(callback)

      })
    })
             
 }



  orderEvents(store){

    let tmp = store.orders.sort(function(a,b) {
      if(moment(a.createdAt).isAfter(b.createdAt)) { return -1; }
      if(moment(a.createdAt).isBefore(b.createdAt)) { return 1; }            
      return 0;

    })    

    store.orders = tmp
  }

 


}
