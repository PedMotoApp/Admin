import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { GoogleApiProvider } from '../../providers/google-api/google-api'
import { DataTextProvider } from '../../providers/data-text/data-text'

declare var google;


@IonicPage()
@Component({
  selector: 'page-work-request-add',
  templateUrl: 'work-request-add.html',
})
export class WorkRequestAddPage {

  services: Observable<any>;
  from: string = ""
  to: string = ""
  payload: any
  key: string = ""
  name: string = ""    
  selectedService: any  
  client: any
  
  emailProfissionalEntrega: string = ""

  finalValue: number = 0
  comission: number = 0
  servicesArray: any = []

  public anArray:any=[];

  usersClients: Observable<any>;
  usersClientsArray: any = []
  
  usersWorkers: Observable<any>;
  usersWorkersArray: any = []
  requestSent: Boolean = false

  latitude: any
  longitude: any
  public anArrayRun:any=[];

  GoogleAutocomplete: any;
  autocompleteFrom: any;
  autocompleteTo: any;  
  autocompleteItemsFrom: any;  
  autocompleteItemsTo: any;   
  lastAddress: string = ""
  lastIndex: number = 0
  acceptedsArray: any = []

  constructor(
    public navCtrl: NavController,
    public httpd: HttpdProvider, 
    public uiUtils: UiUtilsProvider,    
    public zone: NgZone,    
    public dataInfo: DataInfoProvider,    
    public db: DatabaseProvider,    
    public routes: GoogleApiProvider,
    public storageNative: Storage,
    public modalCtrl: ModalController,    
    public dataText: DataTextProvider,  
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

  startInterface(){    

    this.clear()  
    this.getServices()
    this.loadValues()  

    this.getClients()
    this.getWorkers()
    this.checkToken()
    
    this.loadMapStuff()
    this.checkBillingType()  
    
    this.acceptedsArray = []
    // this.userLocation()

    if(this.dataInfo.isDev){

      this.dataInfo.isWeb = false      
      this.dev()       
   }

  }


  clientChanged(){    

    this.usersClientsArray.forEach(element => {

      if(element.name === this.client)
          this.from = element.address
      
    });
    

    if(this.from){

      this.uiUtils.showToast("Endereço de coleta modificado para o cliente " + this.client)
      this.Add()
    }
      

  }

  checkBillingType(){

    if(this.dataInfo && this.dataInfo.appConfig && this.dataInfo.appConfig.appUserCredit){

      if(! this.dataInfo.userInfo.credits)
        this.dataInfo.userInfo.credits = 0.00

      this.checkUserCredits()
    }            
  }


  dev(){
        
    this.recoveryLastQuickRun()
    
    setTimeout(() => {
      
    }, 1000);

  }



  checkToken(){
    let token = this.dataInfo.getToken()

    if(!token || token.length === 0){
      this.uiUtils.showToast(this.dataText.errorSent7)
    }    
  }

  loadMapStuff(){
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocompleteFrom = { input: '', };
    this.autocompleteTo = { input: '', };    
    this.autocompleteItemsFrom = [];   
    this.autocompleteItemsTo = [];
  }

  searchFromAddress(){

    if(this.from && this.from.length > 0)
      this.searchAddrGoogle(this.from, 0)
    else 
      this.uiUtils.showToast("Favor informar no mínimo 3 caracteres")
    
  }

  updateSearchResultsNormal(){
    this.searchAddrGoogle(this.to, 1)
  }

  updateSearchResults(idx){             
    this.lastAddress = this.anArray[idx].description
    this.lastIndex = idx
    this.searchAddrGoogle(this.anArray[idx].description, 1)
  }   

  searchAddrGoogle(address, type){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)           
    loading.present()  

    this.GoogleAutocomplete.getPlacePredictions({
      input: address, 
      strictBounds: true,
      componentRestrictions: { country: 'br' },
     },

     (predictions, status) => {

       this.autocompleteItemsTo = [];
       this.autocompleteItemsFrom = [];

       if(predictions){  

        
         this.zone.run(() => {
           predictions.forEach((prediction) => {              

             if(type == 1)
              this.autocompleteItemsTo.push(prediction);

            else
              this.autocompleteItemsFrom.push(prediction);

           });

         });
         
       }
       
       loading.dismiss()  
   });
  }



  selectAddressFrom(address){
    this.from = address.description    
    this.autocompleteItemsFrom = [];    
    this.Add()
  }
  
  selectAddress(address){

    this.anArray.forEach(element => {

      if(element.description && element.description === this.lastAddress){

        element.description = address.description
        this.lastAddress = address
        
        this.confirmSearchResults()
      }      

    });        
  }


  selectAddressNormal(address){
    this.to = address.description
    this.autocompleteItemsFrom = [];    
    this.autocompleteItemsTo = [];   
  }

  confirmSearchResults(){
    this.lastIndex = -1
    this.autocompleteItemsTo = [];
  }


  getClients(){

    this.getClientsContinue()
    
  }

  getClientsContinue(){

    this.db.getClients()
    .subscribe(data => {
        this.getClientsCallback(data)
    })
  }


  getClientsCallback(data){

    this.usersClientsArray = []

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      console.log('info cliente', info)

      if(info.status !== 'Desativado'){

        if(!info.razaoSocial || (info.razaoSocial && info.razaoSocial === this.dataText.textUninformed))
          info.razaoSocial = info.name



          
        if(! info.name){
          info.name = info.email
        }

        this.usersClientsArray.push(info)

      }      
        
      
    });

  }

  getWorkers(){
    this.db.getWorkers()
    .subscribe(data => {
        this.getWorkersCallback(data)
    })
  }

  getWorkersCallback(data){

    this.usersWorkersArray = []

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      if(! info.name){
        info.name = info.email
      }

      if(info.status !== 'Desativado')            
        this.usersWorkersArray.push(info)
      
    });
  }


  segmentChanged(event){

  }

  workersChanged(){

    console.log(this.emailProfissionalEntrega)
  }

  checkUserCredits(){    
    
    let credit = this.dataInfo.userInfo.credits       
    let valueWork = this.dataInfo.appCreditWorkValue
    let totalRun = credit / valueWork
    let totalRunFinal = Math.round(totalRun)        

    let msg = "Atualmente você possui R$ " + credit + " de crédito. "

    if(totalRunFinal < 3){
      msg = "Atualmente você possui R$ " + credit + " de crédito. Faça agora mesmo sua recarga de crédito"
    }
    else if(totalRunFinal <= 0){
      msg = "Você não possui creditos para enviar corridas. Faça agora mesmo sua recarga de crédito"
    }

    this.uiUtils.showAlertSuccess(msg)
  }

  loadValues(){
    this.payload = this.navParams.get('payload')

    if(this.payload){      
      this.name = this.payload.name     
      this.key = this.payload.key      
    }    
  }


  clear(){
  
    this.key = ""
    this.name = ""    
    this.finalValue = 0

    this.from = ""
    this.to = ""
    this.emailProfissionalEntrega = ""
    
  }

  getServices(){
    
    this.services = this.db.getServices()

    this.services.subscribe(data => {
      this.getServicesCallback(data)
    })
  }

  getServicesCallback(data){

    this.servicesArray = []
    
    data.forEach(element => {
      let info = element.payload.val()
      info.key = element.payload.key      
      this.servicesArray.push(info)
    });
  }

  checkCredits(){

    let self = this

    return new Promise<void>(function(resolve, reject){

      if(self.dataInfo.appConfig.appUserCredit && Number(self.dataInfo.userInfo.credits) <= 0){
        reject(this.dataText.errorSent6)
      }

      resolve()

    });    
  }

  add(){

    this.checkCredits()
    .then(() => {
        this.addContinue()
    })

    .catch((error) => {
      this.uiUtils.showAlertError(error)
    })    
  } 
  
  addContinue(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present()  
    
    let service = {


      name: this.selectedService, 
      total: this.finalValue, 
      paymentKey: this.dataText.notAvailable, 
      paymentPath: this.dataText.notAvailable, 
      paymentMethod: this.dataText.notAvailable, 
      clientName: this.client,            
      professionalName: this.dataText.notAvailable,
      uid: this.dataInfo.userInfo.uid
    }    

    this.dataInfo.userInfo.carInfo = service
    let tokens = this.getTokensProfessionals()

    let data = {from: this.from, to: this.to, carInfo: service}

    this.storageNative.set('last', data);    

    this.db.addWorkRequest(
      JSON.stringify(service),
      this.from, 
      this.to, 
      this.anArray.length, 
      this.to,       
      tokens)      

      this.uiUtils.showAlertSuccess(this.dataText.sucess)
      loading.dismiss()
      this.clear()

  }  


  calc(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present()          

    if(this.checkInputs()){      

      let data = this.getDataDeliveryQuick()                      
      
      this.httpd.apiPriceRequest(data)
      .subscribe((result) => {         

        this.calcPricesCallback(result)
        loading.dismiss()
      })
    }
    
    else {
      loading.dismiss()
    }
    
  }

  calcPricesCallback(data){  

    this.finalValue = Number(data.price)
    this.comission = Number(data.vcomissao)

    let msg =  "Preço calculado com sucesso. Total: R$ " + this.finalValue.toFixed(2) + ".<br>" +        
        "Distância total: " + data.distance + " km.<br>" 
        "Tempo estimado: " + data.duration + " minutos"
    
    this.uiUtils.showAlertSuccess(msg)
  }

  

  enviaQuickRun(){

    this.checkAddress()
    .then(() => {
        this.enviaQuickRunOk()
    })  
    .catch(() => {

      this.uiUtils.showAlertError(this.dataText.errorSent5)
    })
          
  }

  checkAddress(){

    return new Promise<void>(function(resolve, reject){      
      resolve()

    });  
  }

  enviaQuickRunOk(){
    
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present()

    this.requestSent = true

    this.checkCredits()
    .then(() => {

        loading.dismiss()

        if(this.checkInputsQuickRun()){
          this.enviaQuickRunFinish()
        }
        else {
          this.requestSent = false
        }
        
    })
    
    .catch((error) => {
      loading.dismiss()
      this.requestSent = false
      this.uiUtils.showAlertError(error)
    })  
  }

  enviaQuickRunFinish(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present()
            
    let element = {origem: this.from, latitude: 0, longitude: 0}        

    this.geocodeAddress(element)
      .then(() => {

        this.latitude = element.latitude
        this.longitude = element.longitude      

        let data = this.getDataDeliveryQuick()   

        this.enviaQuickRunFim(data)

        if(loading)
          loading.dismiss()
          
      })
      
      .catch((error) => {     

        if(loading)
          loading.dismiss()


        this.requestSent = false
        this.uiUtils.showAlertError(error)
      })    
   }

   enviaQuickRunFim(data){
   
    this.storageNative.set('lastQuick', data);     
            
    this.httpd.apiSendRequest(data)
      .subscribe((result) => {              

        this.sendCallback(result, data)
      })      
   }


   sendCallback(result, data){

    if(result.success){      

      data.key = result.key
      this.uiUtils.showAlertSuccess("Notificação enviada com sucesso")   
      
    } 
    else {
      this.uiUtils.showAlertError(this.dataText.errorPleaseSelectAddress)
    }
    
    this.requestSent = false
    this.anArray = []    
   }


   checkInputsQuickRun(): Boolean {

    if(!this.selectedService){
      return false
    }

    if(! this.client){
      return false
    }

    if(! this.finalValue || this.finalValue === 0){
      return false
    }
     
    if(! this.from){
      return false
    }

    if(this.anArray.length === 0){
      return false
    }

    if(this.anArray && !this.anArray[0]){
      return false
    }

    if(this.anArray && this.anArray[0] && !this.anArray[0].description){
      return false
    }

    return true

  }

   checkInputs(): Boolean {

    if(this.dataInfo.userInfo && ! this.dataInfo.userInfo.uid){
      return false
    }
      
    if(! this.selectedService){
      return false
    }
      
    if(! this.dataInfo.getToken()){
      return false
    }
     
    if(! this.from){
      return false
    }


    if(!this.selectedService){
      return false
    }


    if(! this.client){
      return false
    }   

    if(this.anArray.length === 0){
      return false
    }

    
    if(this.anArray && !this.anArray[0]){     
      return false
    }

    if(this.anArray && this.anArray[0] && !this.anArray[0].description){
      return false
    }


    return true;
   }


   getTokensProfessionals(): string {

    let tokens = []
    this.usersWorkersArray.forEach(element => {
      if(this.emailProfissionalEntrega.includes(element.name) && element.token){        
        tokens.push(element.token)
      }
    });

    return tokens.toString()
   }



   
   getDataDeliveryQuick(){




    let service = {
      name: this.selectedService, 
      total: this.finalValue, 
      paymentKey: this.dataText.textUninformed, 
      paymentPath: this.dataText.textUninformed, 
      paymentMethod: this.dataText.textUninformed, 
      paymentChange: "0",
      nameRequest: this.dataInfo.userInfo.name,
      clientRequested: this.client
    }                

    
    let data = this.dataInfo.userInfo 
    data.dropPoints = []
    data.dropPoints.push({description: this.from, startPoint: true, status: this.dataText.textWaiting})    

    this.anArray.forEach(element => {

      if(element.description){                        
        data.dropPoints.push({description: element.description, startPoint: false, status: this.dataText.textWaiting})
      }      
    });

    this.from = data.dropPoints[0].description    
    this.to = data.dropPoints[1].description   
   
    data.totalPoints = this.anArray.length
    data.carInfo = service 
    data.fromAddress = this.from    
    data.origem = this.from    
    data.uidBusiness = this.dataInfo.userInfo.uid
    data.appCreditWorkValue = this.dataInfo.appCreditWorkValue
    data.uf = this.dataInfo.defaultState
    data.state = this.dataInfo.defaultState
    data.status = this.dataText.titleCreated
    data.toReference  = this.dataText.notAvailable
    data.urlFirebase = this.dataInfo.urlFirebase,
    data.agenda  = moment().format()
    data.appType = "Entrega"    
    data.paymentKey = this.dataText.notAvailable
    data.paymentPath = this.dataText.notAvailable
    data.paymentMethod = this.dataText.notAvailable
    data.paymentChange = "0"
    data.apiKey = this.dataInfo.appConfig.googleApiKey   
    data.workComission = this.comission 
    data.datetime = moment().format()          
              
    if(this.emailProfissionalEntrega && this.emailProfissionalEntrega.length > 0)
      data.tokens = this.getTokensProfessionals()    

    return data
   }

  
   recoveryLastQuickRun(){

    this.storageNative.get('lastQuick')

    .then((data)=>{

      if(data)
          this.recoveryLastContinue(data)      
      else 
        this.uiUtils.showAlertError(this.dataText.errorSent4)            
    })
  }   


  recoveryLastContinue(data){
    
    if(data.dropPoints){
      this.addAnArray(data.dropPoints)
    }  

    if(data.instruction && data.instruction > 0){
      this.anArray = []
    }
    

        
    if(data.carInfo)
      this.selectedService = data.carInfo.name

    if(data.emailProfissionalEntrega)
      this.emailProfissionalEntrega = data.emailProfissionalEntrega
 
    if(data.to)
      this.to = data.to

    if(data.from)
      this.from = data.from

  
  }

   

    addAnArray(dropPoints){
      this.anArray = []


      dropPoints.forEach(element => {     
          
        if(element.description){

          let address = element.description.replace(/,/g, '')

          if(element.startPoint){          
            this.from = element.description
          }
          else {          
            element.description = address        
            this.anArray.push(element)
          }        

        }
        
      });
    }
 

    geocodeAddress(element){

      let self = this

      return new Promise<void>(function(resolve, reject){        
      
        self.routes.geocodeAddress(element.origem)
        .then((result) => {

          self.geocodeAddressCallback(element, result)
          resolve()
        }).catch((error) => {
          
          reject(error)
        })                
      })      
    }

    geocodeAddressCallback(element, data){
      element.latitude = data[0].geometry.location.lat()
      element.longitude = data[0].geometry.location.lng()      

    }

    

   

    devEntrega(){
      this.selectedService = 'Entregas'     
      this.from = 'AOS 08 BLOCO C'
      this.to= 'AOS 01 BLOCO C'     
    }

    useCredits(){      

      let credit = this.dataInfo.userInfo.credits      
      let valueWork = this.dataInfo.appCreditWorkValue
      let fvalue = credit - valueWork

      if(! this.dataInfo.appCreditUseTotalValue){
        fvalue = credit - ( valueWork * this.anArray.length )        
      }
      
      this.db.updateUserCredits(fvalue)
      this.dataInfo.userInfo.credits = fvalue
    }

    goPageHistory(){
      this.navCtrl.push('HistoryPage')
    }

    Add(){
      this.anArray.push({'value':''});
    }
   
    remove(idx){         
      this.anArray.splice(idx);
    }


    userLocation(){

      if(this.dataInfo.userInfo.latitude && this.dataInfo.userInfo.longitude){
        this.geocodeLatLng(this.dataInfo.userInfo.latitude, this.dataInfo.userInfo.longitude)                      
      }
      else {
        this.uiUtils.showAlertError("Falha ao pegar localização.")        
      }      
    }

    geocodeLatLng(lat, long){
      
      let loading = this.uiUtils.showLoading("Localizando você")
      loading.present();
      
      let self = this
      
      this.routes.geocodeLatLng(lat, long)
      .then((results) => {

        self.geocodeLatLngCallback(results)
        loading.dismiss();
      })                  
    }

    geocodeLatLngCallback(data){ 
          
      if(data && data.result){
        this.from = data.result.formatted_address                    
      } 
      else {
        this.uiUtils.showToast('Ocorreu uma falha ao realizar sua localização')
      }           
    }

    goPageWorks(){
      this.navCtrl.push('HistoryPage')
    }  
  
    goPageWorkAccept(){
      this.navCtrl.push('WorkAcceptPage')
    }

    
  removeIndex(index){        
    let array = this.anArrayRun.splice(index);
    this.anArrayRun = array
  }


  
  clearProfessionals(){
    this.emailProfissionalEntrega= ""    
  }
    
   
}
