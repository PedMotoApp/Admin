import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-ifood-orders',
  templateUrl: 'ifood-orders.html',
})
export class IfoodOrdersPage {

  payload: any = {status: 'Aguardando autenticação'}  
  ifoodClientId: string = ""
  ifoodClientSecret: string = ""  
  isAuthConfigVisible: Boolean = false
  storeInterval: any
  requestType: any
  orders: any = []
  ordersAll: any = []

  storeStatus: string = "CONFIGURANDO LOJA"
  storeInfoComplete: any = []
  from: string = "70660083"

  ordersWaitPolling: any = []  
  clientsWorkersArray: any = []

  status: string = "Todos"
  paymentMethod: string = "Todos"

  datetimeNextEvent: string
  merchantId: string

  constructor(
    public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,  
    private iab: InAppBrowser,
    public dataText: DataTextProvider,
    public events: Events,
    public alertCtrl: AlertController, 
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

  }

  settings(){    
    this.navCtrl.push("IfoodPage")
  }

  storeStatusCheck(){

    if(this.payload && this.payload.stores && this.payload.stores[0]){     
      let msg = "O status da lojá é " + this.storeStatus      
      this.uiUtils.showAlertSuccess(msg)
    }
  }


  startInterface(){   
      
      this.payload = this.dataInfo.userInfo.ifood  

      this.ifoodClientId = this.dataInfo.appConfig.ifoodClientId
      this.ifoodClientSecret = this.dataInfo.appConfig.ifoodClientSecret      

      if(this.dataInfo.userInfo.ifoodClientSecret)
        this.ifoodClientSecret = this.dataInfo.userInfo.ifoodClientSecret

      if(this.dataInfo.userInfo.ifoodClientId)
        this.ifoodClientId = this.dataInfo.userInfo.ifoodClientId

      if(this.dataInfo.userInfo && this.dataInfo.userInfo.ifood)
        this.payload = this.dataInfo.userInfo.ifood            
                        
      
      if(this.payload){
        this.getMerchants()
      }
      else {
        this.uiUtils.showAlertError('Favor realizar a sua autenticação')
      }
      
  }


  getMerchants(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    this.from = ""

    let data = {clientId: this.ifoodClientId, token: this.payload.accessToken}  

    this.httpd.apiIfoodGetMerchants(data)
    .subscribe((data) => {

      loading.dismiss()
      this.getMerchantsCallback(data)


    }, error => {

      loading.dismiss().then( () => {
        this.uiUtils.showAlert(this.dataText.warning, "Não foi possível verificar os eventos. Provavelmente seu token expirou!").present()
      });
    })
  }


  getMerchantsCallback(data){
    if(data){
      if(data[0]){
        this.payload.stores = data        
        this.pollingEvents(data[0])
      }
      else {
        let msg = "Houve um erro ao verificar as lojas. Favor verifique o token de autenticação"
        this.uiUtils.showAlertError(msg)
        this.navCtrl.push("IfoodPage", {reauth: true})                
      }
    }    
  }
  


  pollingEvents(data){    

    this.payload.status = 'Aguardando eventos'        
    data.lastEvent = this.dataText.pleaseWait

    this.ordersWaitPolling = []
    this.merchantId = data.id    
    
    let data1 = {clientId: this.ifoodClientId, token: this.payload.accessToken, merchantId: data.id}    
    this.checkStoreInfo(data1)          

  }


  
  checkStoreInfo(data){
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()
    this.httpd.apiIfoodGetMerchantsInfo(data)
    .subscribe((data2) => {   
      loading.dismiss()      
      this.getStoreInfoCallback(data2)                
    }, (error) => {
      loading.dismiss()      
      this.uiUtils.showToast("Erro ao verificar informações da loja")      
    })
  }


  getStoreInfoCallback(data){        
        
    this.from = data.address.street

    this.storeInfoComplete = data      
    this.getStoreEvents()    
  }


  getStoreEvents(){

    this.datetimeNextEvent = moment().add(30, 'seconds').format("DD/MM/YYYY HH:mm:ss")


    this.getOrders()                  

    this.checkStoreStatus()              

    this.storeInterval = setInterval(() => {
     
     this.checkStoreStatus()           
    }, 30000);
    
  }


  
  checkStoreStatus(){


    let data = {clientId: this.ifoodClientId, token: this.payload.accessToken, merchantId: this.merchantId}        


    this.httpd.apiIfoodGetMerchantsStatus(data)

    .subscribe((data2) => {   
      this.checkStoreStatusCallback(data2)       
            

    }, (error) => {

      this.uiUtils.showToast("Erro ao verificar status da loja")      

    })


  }


  

  checkStoreStatusCallback(data){    
    
    this.storeStatus = data[0].message.title + " - " + data[0].message.subtitle                  

    if(data && data[0].state && data[0].state === 'CLOSED'){  
      
      this.datetimeNextEvent = moment().add(30, 'seconds').format("DD/MM/YYYY HH:mm:ss")      
      this.storeStatus = 'LOJA FECHADA'  

      setTimeout(() => {
        this.checkStoreStatus()

      }, 30000);
    }

    else {            

      this.getEventsStoreMain()  
                  
    }
    
  }
 



  getEventsStoreMain(){
    
    this.storeStatus = 'LOJA ABERTA'

    if(this.payload.stores){
      this.getEvents(this.payload.stores[0])      
    }
    else {

      this.payload.stores = []
      this.getEvents(this.payload.stores)
    }    
    
  }


  
  getEvents(store){

    this.datetimeNextEvent = moment().add(30, 'seconds').format("DD/MM/YYYY HH:mm:ss")
                
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    store.orders = []    

    let data = {clientId: this.ifoodClientId, token: this.payload.accessToken}  

    this.httpd.apiIfoodGetEvents(data)
    .subscribe((data) => {

      loading.dismiss()
      this.getEventsCallback(store, data)      
      
    }, (error) => {

      loading.dismiss()      
      this.uiUtils.showToast("Aguardando próximo evento")

    })
    
  
  }


  getEventsCallback(store, data){

    store.lastEvent = moment().format("DD/MM/YYYY HH:mm:ss")

    if(data){
        this.getEventsContinue(store, data)      
    }        
  }


  getEventsContinue(store, data){

    store.orders = data
    this.clientsWorkersArray = []

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
        self.removeEmpty()


        self.uiUtils.showToast("Eventos do atualizados com sucesso")
      })

      
    
    }
    else {
      console.log('Ignorando evento vazio')
    }
    
    
  }


  removeEmpty(){

    let tmp = []

    this.orders.forEach(element => {

      if(element.orderId)
          tmp.push(element)
      
    });      

    this.orders = tmp

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

    if(data.orderId){


      this.clientsWorkersArray.push

      data.details = callback

      if(data.details && data.details.delivery && data.details.delivery.deliveryDateTime){
        data.details.delivery.deliveryDateTimeStr = moment(data.details.delivery.deliveryDateTime).format("DD/MM/YYYY HH:mm:ss")
      }              

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




 checkOrders(order){

  let isOk = false  

  if(this.storeStatus === 'LOJA FECHADA')
    isOk = true

  if(this.ordersWaitPolling.includes(order.orderId))
    isOk = true

  this.ordersAll.forEach(element => {
    
    if(!isOk){
      if(order.orderId === element.orderId){
        if(order.id !== element.id){      
          if(order.status === element.status){            
            if(moment(order.createdAt).isBefore(element.createdAt)) {                                      
                isOk = true; 
            }  
          }                    
        }  
      }
    }    
  })


  return isOk; 
 }


  

  getOrders(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    this.db.getOrdersIfood()

    .subscribe((data) => {

      loading.dismiss()
      this.getOrdersCallback(data)      
    })
  }



  getOrdersCallback(data) {
    this.orders = [];
    this.ordersAll = [];
    this.ordersWaitPolling = [];
  
    data.forEach(element => {
      const info = element.payload.val();
      info.key = element.payload.key;
  
      Object.values(info).forEach(order => {
        this.orders.push(order);
      });
    });
  
    this.orderEvents(this.orders);
  
    if (Array.isArray(this.orders)) {
      const tmp = [];
  
      this.orders.forEach(order => {
        if (order && order.orderId && moment(order.createdAt).isSame(moment(), 'day')) {
          switch (order.fullCode) {
            case 'PLACED':
              order.fullCodeStr = 'AGUARDANDO CONFIRMAÇÃO';
              break;
            case 'CANCELLED':
              order.fullCodeStr = 'PEDIDO CANCELADO';
              break;
            case 'CANCELLATION_REQUEST_FAILED':
              order.fullCodeStr = 'PEDIDO NÃO CANCELADO';
              break;
            case 'CONFIRMED':
              order.fullCodeStr = 'PEDIDO CONFIRMADO';
              this.deliveryOrder(order)
              break;
            case 'DISPATCHED':
              order.fullCodeStr = 'PEDIDO DESPACHADO';
              break;
            case 'CONCLUDED':
              order.fullCodeStr = 'PEDIDO FINALIZADO';
              break;
            case 'READY_TO_PICKUP':
              order.fullCodeStr = 'PEDIDO PRONTO';
              break;
          }
  
          if (order.details && order.details.delivery) {
            order.details.delivery.deliveryDateTimeStr = moment(order.details.delivery.deliveryDateTime).format("DD/MM/YYYY HH:mm:ss");
          }
  
          if (order.details && order.details.indoor && order.details.indoor.deliveryDateTime) {
            order.details.indoor.deliveryDateTimeStr = moment(order.details.indoor.deliveryDateTime).format("DD/MM/YYYY HH:mm:ss");
          }
  
          this.ordersAll.push(order);
  
          if (this.status === "Todos" || this.status === order.fullCodeStr) {
            tmp.push(order);
          }

          
        }
      });
  
      this.orders = tmp;
    }
  }
  




  orderEvents(orders){
    
    if(orders && Array.isArray(orders)){      

      let tmp = orders.sort(function(a,b) {
        if(moment(a.createdAt).isAfter(b.createdAt)) { return -1; }
        if(moment(a.createdAt).isBefore(b.createdAt)) { return 1; }            
        return 0;  
      })    
  
      orders = tmp

      


    }
    
 }

 
 /** CONFIRMA PEDIDO */

 confirm(order){

  
  let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
  alert.then((result) => {

    if(result)  
      this.confirmOrder(order)
  })   

   
}

 confirmOrder(order){  

  let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
  loading.present()

  let data = {token: this.payload.accessToken, id: order.orderId}     
  this.ordersWaitPolling.push(order.orderId)

  this.httpd.apiIfoodConfirmOrder(data)

  .subscribe((data) => {

    loading.dismiss()
    this.confirmOrderCallback(data)   

  })

 }


 confirmOrderCallback(data){
  this.checkHttpError(data)            
 }
 

  cancel(order){
    

    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
    alert.then((result) => {

      if(result)  
        this.checkCancel(order)        
    })  
    
  }


  checkCancel(order){

    let myAlert = this.alertCtrl.create({
      title: 'Qual o motivo do cancelamento?',
      enableBackdropDismiss: true ,
      message:'Informe o motivo',
      buttons:[ 
        {
          text: this.dataText.cancel,
          handler: data => {
              console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
              },
          role: 'cancel'
    },
    {
    text: 'CONTINUAR',
    handler: data => {            
  
        if(data === undefined){
          this.uiUtils.showAlertError("Selecionar o motivo do cancelamento é obrigatório para cancelar")    
        }
            
        if(data){            
          order.cancel = data  
          this.cancelOrder(order)
  
        }
                      
      },
      role: ''
    }


    ],
    inputs:[
      {
        type: 'radio',
        id: 'opt1',
        name: 'name',
        value: 'PROBLEMAS DE SISTEMA',
        label: 'PROBLEMAS DE SISTEMA'
      },
      {
        type: 'radio',
        id: 'opt2',
        name: 'name',
        value: 'PEDIDO EM DUPLICIDADE',
        label: 'PEDIDO EM DUPLICIDADE'
      },
      {
        type: 'radio',
        id: 'opt3',
        name: 'name',
        value: 'ITEM INDISPONÍVEL',
        label: 'ITEM INDISPONÍVEL'
      },
      {
        type: 'radio',
        id: 'opt4',
        name: 'name',
        value: 'RESTAURANTE SEM MOTOBOY',
        label: 'RESTAURANTE SEM MOTOBOY'
      },
      {
        type: 'radio',
        id: 'opt5',
        name: 'name',
        value: 'CARDÁPIO DESATUALIZADO',
        label: 'CARDÁPIO DESATUALIZADO'
      },
      {
        type: 'radio',
        id: 'opt6',
        name: 'name',
        value: 'PEDIDO FORA DA ÁREA DE ENTREGA',
        label: 'PEDIDO FORA DA ÁREA DE ENTREGA'
      },
      {
        type: 'radio',
        id: 'opt7',
        name: 'name',
        value: 'CLIENTE GOLPISTA / TROTE',
        label: 'CLIENTE GOLPISTA / TROTE'
      },
      {
        type: 'radio',
        id: 'opt8',
        name: 'name',
        value: 'FORA DO HORÁRIO DO DELIVERY',
        label: 'FORA DO HORÁRIO DO DELIVERY'
      },
      {
        type: 'radio',
        id: 'opt9',
        name: 'name',
        value: 'DIFICULDADES INTERNAS DO RESTAURANTE',
        label: 'DIFICULDADES INTERNAS DO RESTAURANTE'
      },
      {
        type: 'radio',
        id: 'opt10',
        name: 'name',
        value: 'ÁREA DE RISCO',
        label: 'ÁREA DE RISCO'
      },
      {
        type: 'radio',
        id: 'opt11',
        name: 'name',
        value: 'FORA DO HORÁRIO DO DELIVERY',
        label: 'FORA DO HORÁRIO DO DELIVERY'
      },
      {
        type: 'radio',
        id: 'opt12',
        name: 'name',
        value: 'RESTAURANTE ABRIRÁ MAIS TARDE',
        label: 'RESTAURANTE FECHOU MAIS CEDO'
      }
    ]
    });


    myAlert.present();
    
  }




  cancelOrder(order){        

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()


    let data = {token: this.payload.accessToken, id: order.orderId, reason: order.cancel,  cancellationCode: String(this.getCancelCode(order)) }     

    this.ordersWaitPolling.push(order.orderId)

    this.httpd.apiIfoodCancelOrder(data)
    .subscribe((data1) => {

      loading.dismiss()
      this.cancelOrderOrderCallback(data1, order)   
      
    })
    
  }


  cancelOrderOrderCallback(data, order){    

    this.checkHttpError(data)        


    this.db.getWorkIfood(order.orderId)

    .subscribe((callback) => {
        this.cancelOrderMotok(callback)

    })


   }


   cancelOrderMotok(data){    
    
    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      this.db.cancelWork(info.key, "Cancelado pelo painel administrativo")
      .then(() => {

      })
      
    });

   }


   getCancelCode(order){

    let msg = order.cancel

    if(msg === 'PEDIDO EM DUPLICIDADE'){
      return 502
    }

    if(msg === 'ITEM INDISPONÍVEL'){
      return 503
    }

    if(msg === 'RESTAURANTE SEM MOTOBOY'){
      return 504
    }

    if(msg === 'CARDÁPIO DESATUALIZADO'){
      return 505
    }

    if(msg === 'PEDIDO FORA DA ÁREA DE ENTREGA'){
      return 506
    }

    if(msg === 'CLIENTE GOLPISTA / TROTE'){
      return 507
    }

    if(msg === 'FORA DO HORÁRIO DO DELIVERY'){
      return 508
    }

    if(msg === 'DIFICULDADES INTERNAS DO RESTAURANTE'){
      return 509
    }

    if(msg === 'ÁREA DE RISCO'){
      return 511
    }

    if(msg === 'RESTAURANTE ABRIRÁ MAIS TARDE'){
      return 512
    }

    if(msg === 'RESTAURANTE FECHOU MAIS CEDO'){
      return 513
    }



    return 501
   }
   



   checkHttpError(data){

    if(data){

      if(data.error){
        this.uiUtils.showAlertSuccess("Houve um erro ao processar sua solicitação")     
      }
      else {
        this.uiUtils.showAlertSuccess("Mudança realizada com sucesso")     
        this.getOrders()
      }
    }

   }
   
  
  delivery(orders){


    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
    alert.then((result) => {

      if(result)  
        this.deliveryOrder(orders)
    })
        
  }

  deliveryOrder(order){        
    
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    let data = {token: this.payload.accessToken, id: order.orderId}        
    this.ordersWaitPolling.push(order.orderId)

    this.httpd.apiIfoodDeliveryOrder(data)
    .subscribe(() => {

      loading.dismiss()
      this.deliveryOrderOrderCallback(order)   
      
    })
    
  }


  deliveryOrderOrderCallback(order){    

    let payload = this.getDataDeliveryQuick(order)
  
    this.httpd.apiSendRequest(payload)
    .subscribe((callback) => {      
      this.uiUtils.showToast("Seu pedido foi enviado com sucesso!! ")      
    }, error => {
      console.log(error)
      this.uiUtils.showToast("Houve um erro ao enviar a corrida para o entregador. Favor tente novamente")
    })
    
   }

   pickup(orders){


    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
    alert.then((result) => {

      if(result)  
        this.pickupContinue(orders)
    })
        


  }


  pickupContinue(order){       

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    let data = {token: this.payload.accessToken, id: order.orderId}        
    this.ordersWaitPolling.push(order.orderId)

    this.httpd.apiIfoodPickupOrder(data)
    .subscribe((callback) => {

      loading.dismiss()
      this.pickupCallback(callback)   
      
    })
    
  }


  pickupCallback(order){    
    this.uiUtils.showAlertSuccess("Mudança realizada com sucesso")          
   }


  getDataDeliveryQuick(info){   

    let paymentChange = "0"

    if(info.details.payments && info.details.payments.methods[0] && info.details.payments.methods[0].cash && info.details.payments.methods[0].cash.changeFor){
      paymentChange = info.details.payments.methods[0].cash.changeFor
    }

    let service = {name: 'Ifood', total: info.details.total.deliveryFee, paymentKey: this.dataText.notInformade, paymentPath: this.dataText.notInformade, paymentMethod: this.dataText.notInformade, paymentChange:paymentChange}                    
    let data = this.dataInfo.userInfo       
    
    data.datetime = moment().format()
    
    data.carInfo = service 
    data.fromAddress = this.storeInfoComplete[0]    
    data.origem = this.from
    data.name = this.payload.stores[0].name

    data.total = info.details.total.deliveryFee
    data.comission = info.details.total.deliveryFee
    data.workComission = info.details.total.deliveryFee

    data.uidBusiness = this.dataInfo.userInfo.uid
    data.appCreditWorkValue = this.dataInfo.appConfig.appCreditWorkValue
    data.uf = this.dataInfo.defaultState
    data.state = this.dataInfo.defaultState
    data.status = 'Criado'    
    data.toReference  = this.dataText.notInformade


    data.ifood = info
    data.ifoodOrderId = info.orderId
    
    data.agenda  = moment().format()
    data.appType = "Entrega"    
    data.paymentKey = this.dataText.notInformade
    data.paymentPath = this.dataText.notInformade
    data.paymentMethod = this.dataText.notInformade
    data.paymentChange = "0"
    data.googleApiKey = this.dataInfo.appConfig.googleApiKey        
        
    data.dropPoints = []
    data.fromAddress = this.from   
    
    let addr = info.details.delivery.deliveryAddress.formattedAddress 

    if(info.details.delivery.deliveryAddress.neighborhood){
      addr = info.details.delivery.deliveryAddress.formattedAddress + ' - ' + info.details.delivery.deliveryAddress.neighborhood
    }
        
    data.dropPoints.push({description: this.from, startPoint: true, status: 'Aguardando', instructions: "Pegar pedido Ifood"})        
    data.dropPoints.push({description: addr, status: 'Aguardando', instructions: this.getInstrunctionsPayment(data), responsible: info.details.customer.name, charge: info.details.total.orderAmount, reference: info.details.delivery.deliveryAddress.reference })  

    data.totalPoints = data.dropPoints.length          
    data.appType = "Entregas"    
    

    return data
   }



   getInstrunctionsPayment(data){

    let instructions = "Entregar pedido Ifood"

    if(data.ifood.details.payments.methods[0].method && data.ifood.details.payments.prepaid){

      if(data.ifood.details.total.orderAmount === data.ifood.details.payments.prepaid)      
        instructions = "Entregar pedido Ifood - NÃO COBRAR" 


      if(data.ifood.details.total.orderAmount !== data.ifood.details.payments.prepaid)      
        instructions = "Entregar pedido Ifood - Pagamento: "  + data.ifood.details.payments.methods[0].method + " - {{dataText.currency}} " + data.ifood.details.payments.pending

      }


      return instructions

   }


   show(order){

     this.db.getWorkIfood(order.orderId)
     .subscribe((data) => {

        this.showCallback(data)

     })
   }


   showCallback(data){

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      this.navCtrl.push('WorkRunHistoryPage', {payload: info})
      
    });

   }


}
