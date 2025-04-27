import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Navbar, ActionSheetController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { GoogleApiProvider } from '../../providers/google-api/google-api'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { HttpdProvider } from '../../providers/httpd/httpd'
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'

declare var google;

@IonicPage()
@Component({
  selector: 'page-search-delivery',
  templateUrl: 'search-delivery.html',
})
export class SearchDeliveryPage {
  
  payload: any  
  fromAddress: string
  toAddress: string
  toAddressData: any
  searching: Boolean = true
  organized: Boolean = false
  toReference: string 
  lastAddress: string
  GoogleAutocomplete: any;
  autocompleteFrom: any;
  autocompleteTo: any;  
  autocompleteItemsFrom: any;  
  autocompleteItemsTo: any;   
  finalValue: number = 0
  finalDistance: any = [] 
  finalDistanceMeters: any = [] 
  finalDuration: any = [] 
  comission: number = 0
  responsibles: any = [] 
  instructions: any = [] 
  tablePricesMsg: string = ""
  tablePricesCallback: any
  totalDistance: any
  totalTime: any
  organizeType: number = 0
  dropPointsTmp: any

  usersWorkers: Observable<any>;
  usersWorkersArray: any = []
  emailProfissionalEntrega

  @ViewChild('navbar') navBar: Navbar;
  @ViewChild('toInput') toInput

  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    public zone: NgZone,    
    public dataInfo: DataInfoProvider,      
    public events: Events,
    public uiUtils: UiUtilsProvider,
    public navParams: NavParams,
    public routes: GoogleApiProvider,
    public httpd: HttpdProvider,
    public actionSheetCtrl: ActionSheetController,
    public dataText: DataTextProvider,  
    public db: DatabaseProvider) {

      this.loadMapStuff()
  }

  ionViewDidLoad() {    
    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')
  }

  startInterface(){

    if(this.navBar){
      this.navBar.backButtonClick = (ev:UIEvent) => {
        this.goBack()
      }
    }
    
    this.getWorkers()

    this.payload = this.navParams.get('payload')
        
    this.uiUtils.showToast(this.dataText.inputAddress)
    
    this.dropPointsTmp = this.payload.dropPoints

    this.dropPointsTmp.forEach(element => {
      element.uid = Date.now() + Math.random()                
    });

    setTimeout(() => {
      this.toInput.setFocus()

      if(this.dataInfo.isDev){
        this.dev()    
      }
      
    }, 3000);

      
  } 
  
  getHaveReturn(){

    let isOk = true

    this.dropPointsTmp.forEach(element => {

      if(element.isReturn)
        isOk= false
    });

    return isOk

  }

  dev(){
    this.toAddress = "Taguatinga"

    //this.selectAddress(this.toAddress)    
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

      if(info.status !== 'Desativado')            
        this.usersWorkersArray.push(info)
      
    });
  }




 toAddressChanged(){

  }  

  goBack(){
    this.navCtrl.pop()
  }

  loadMapStuff(){
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocompleteFrom = { input: '', };
    this.autocompleteTo = { input: '', };    
    this.clearList()  
  }

  clearList(){
    this.autocompleteItemsFrom = [];   
    this.autocompleteItemsTo = [];
  }

  checkFocus(){
  // this.isInputVisible = true      
  }

  updateSearchResults(){     


    if(this.toAddress){

      this.GoogleAutocomplete.getPlacePredictions({
        input: this.toAddress, 
        strictBounds: true,
        componentRestrictions: { country: 'br' },
       },
 
       (predictions, status) => {
 
         this.autocompleteItemsTo = [];
 
         if(predictions){  
           this.zone.run(() => {
             predictions.forEach((prediction) => {              
               this.autocompleteItemsTo.push(prediction);
             });
 
           });
           
         }            
     });

    }

    
  }          
  
  selectAddress(address){
    this.toAddress = address.description
    this.toAddressData = address
    this.lastAddress = this.toAddress
    this.addNewAddressPoint()
  }
  
  addRefence(){
    
  }

  addNewAddressPoint(){

    let alert = this.uiUtils.showConfirm(this.dataText.add, "Deseja adicionar: " + this.toAddress + " ?")
    alert.then((result) => {

      if(result){        
        this.addNewContinue()
      }        
    })        
  }

  addNewContinue(){
      
    this.lastAddress = ""    

    this.dropPointsTmp.splice(this.dropPointsTmp.length - 1, 0, {description: this.toAddress, status: 'Aguardando', addOnRun: true})    

    this.clearList()

    this.uiUtils.showToast(this.dataText.inputAdded + this.toAddress)
    this.toAddress = ""

    this.recalculate()

    setTimeout(() => {        

      if(this.toInput){
        this.toInput.setFocus()
      }
      
    }, 3000);
        
  }  
  

  removeAddress(address){

    let points = []
    let haveNew = false

    this.dropPointsTmp.forEach(element => {      

      if(element.uid !== address.uid){              

        points.push(element)        

        if(element.addOnRun)
          haveNew = true
        
      }
      
    });    

    this.dropPointsTmp = points           

    this.clearNumbers()

    let msg = this.dataText.addressRemoved + address.description          
    this.uiUtils.showAlertSuccess(msg)
    
    this.recalculate()
  }  


  clearNumbers(){
    this.finalDistance = []
    this.finalDistanceMeters = []
    this.finalDuration = []
    this.totalDistance = 0
    this.totalTime = 0
    this.finalValue = 0    
  }

  recalculate(){
    this.uiUtils.showToast(this.dataText.recalcValues)
    this.clearNumbers()
    this.calcAll()
  }  

  addObservation(address) {

    let alert = this.alertCtrl.create({
      title: this.dataText.addObservation,
      inputs: [
        {
          name: 'question',
          placeholder: this.dataText.addInformation
        }
      ],
      buttons: [
        {
          text: this.dataText.cancel,
          role: 'cancel',
          handler: data => {
            console.log('Cancelado')
          }
        },
        {
          text: 'Enviar',
          handler: data => {
            address.obs = data.question            
          }
        }
      ]
    });
    alert.present();
    
  }
 
  
  calculateRoutes(){

    let self = this

    return new Promise<void>((resolve, reject) => {      


      if(this.dropPointsTmp){

        let dropPoints = this.dropPointsTmp        

        if(! dropPoints[0].startPoint)
          dropPoints.unshift({description: self.payload.from, startPoint: true, status: 'Aguardando'})
        

        let promises = []

        for(let i = 0; i < dropPoints.length; i++) {

          let promise = new Promise<void>((resolvePromise) => {

            let element = dropPoints[i]

            let collect = ""
            let delivery = element.description    
                       
            if(dropPoints[i-1]){
              collect = dropPoints[i-1].description         
            }   

           if(dropPoints[i].isReturn){      
             
              collect = dropPoints[i-1].description
              delivery = this.fromAddress
            }
            

            if(delivery && delivery.length > 0 &&  collect && collect.length > 0){              
              
              self.routes.distanceMatrix(collect, delivery)
              .then((result) => {
        
                  element.collect = collect
                  self.calculateRoutesCallback(element, result)
                  resolvePromise()
              })  
            }
            else 
              resolvePromise()     

          });

          promises.push(promise)        
        }  
        
        Promise.all(promises).then(function(){          
          self.dropPointsTmp = dropPoints      
          resolve()
        })

      }   
      
      else {

        reject()
      }
    })   
    
    

  }

  calculateRoutesCallback(dropPoints, data){   
              
      data.rows.forEach(element => {      
        
        element.elements.forEach(elementMatrix => {

          if(elementMatrix.distance){

            dropPoints.distanceMeters = elementMatrix.distance.value
            dropPoints.distance = elementMatrix.distance.value / 1000 
            dropPoints.duration = elementMatrix.duration.text

            this.finalDistance.push(dropPoints.distance)
            this.finalDistanceMeters.push(dropPoints.distanceMeters)
            this.finalDuration.push(dropPoints.duration)          

          }          
        });  

      });        
  }

  calcPrices(){

    let self = this

    return new Promise((resolve) => {

      let loading = self.uiUtils.showLoading("Favor aguarde...")    
      loading.present()
      
      let dropPoints = self.dropPointsTmp

      if(!this.dataInfo.userInfo.tablePrice)
        this.dataInfo.userInfo.tablePrice = "Principal"        

      let data = {'dropPoints': dropPoints, uf: this.dataInfo.defaultState, tablePrice: this.dataInfo.userInfo.tablePrice, apiKey: this.dataInfo.appConfig.googleApiKey}
      
      let sub = self.httpd.apiPriceRequestReceived(data)
      .subscribe((element => {                  

          self.apiPriceRequestCallback(element)
          sub.unsubscribe()                
          
          if(loading)
            loading.dismiss()

          resolve(element)
      }))  
                                           
    })    
    
  }

  apiPriceRequestCallback(element){   

    console.log(element)
        
    this.tablePricesMsg = element.msg      
    this.tablePricesCallback = element
    let price = Number(element.price)
    let comission = Number(element.vcomissao)
    element.value = price

    this.comission = comission    
    this.finalValue += price

    this.uiUtils.showAlertSuccess("Valor cobrado R$ " + element.price)    
  }

  showTableMsg(){    
    this.uiUtils.showAlert(this.dataText.success, this.tablePricesMsg).present()
  }

  addReturnPoint(address){
    this.dropPointsTmp.push({description: address.description, status: 'Aguardando', isReturn: true})            
    this.uiUtils.showAlertSuccess("Retorno adicionado com sucesso. Salve para confirmar")

    this.recalculate()
  }

 

  calcTotalDistanceAndTime(){
    
    let totalTime = this.finalDuration.reduce( function( prevVal, elem ) {   
      let myString = elem.replace(/[^\d-]/g, '');
      return prevVal + Number(myString);
    }, 0 );

    let distance = this.finalDistance.reduce( function( prevVal, elem ) {              
      return prevVal + Number(elem);
    }, 0 );    
      
    isNaN(Number(distance)) ? this.totalDistance = this.dataText.errorUnavailable : this.totalDistance = distance.toFixed(2) + ' Km'    
    isNaN(Number(distance)) ? this.totalTime = this.dataText.errorUnavailable :  this.totalTime = totalTime + ' Minutos'

  }

   
  calcAll(){

    let loading = this.uiUtils.showLoading("Favor aguarde...")    
    loading.present()

    this.calculateRoutes()
      .then(() => {
                             
        this.calc()  
        this.calcTotalDistanceAndTime() 
        this.organized = true                               
        
        if(loading)
          loading.dismiss()
      })
      .catch(() => {

        this.uiUtils.showAlertError("Não foi possível organizar as rota")
        this.organized = false
        this.searching = true

        if(loading)
          loading.dismiss()
      })
  }
 
  calc(){

    this.calcPrices()
    .then((result) => {
      this.calcPricesCallback(result)

    })
    .catch(() => {
      this.uiUtils.showAlertSuccess("Ocorreu um erro ao calcular valores")
    })
  }


  calcPricesCallback(result){

    console.log('Callback preços: ')
    console.log(result)
    
    if(! result.success){

      let msg = "Houve uma falha ao calcular valores. Favor verifique os endereços e tente novamente"
      this.uiUtils.showAlertError(msg)

    } 
  }  
  
  presentActionSheet(address) {    

    let actionSheet = this.actionSheetCtrl.create({
      title: '{{dataText.options}}',
      buttons: [
        {
          text: 'Responsável',
          handler: () => {            
            this.addResponsible(address)
          }
        },
        {
          text: 'Instruções',
          handler: () => {
            this.addDesc(address)
          }
        },
        {
          text: 'Finalizar com senha',
          handler: () => {
            this.addPassword(address)
          }
        },
        {
          text: this.dataText.cancel,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

  addResponsible(address) {

    let alert = this.alertCtrl.create({
      title: "Quem vai receber?",
      inputs: [
        {
          name: 'question',
          placeholder: "Informar responsável"
        }
      ],
      buttons: [
        {
          text: this.dataText.cancel,
          role: 'cancel',
          handler: data => {
            console.log('Cancelado')
          }
        },
        {
          text: 'Enviar',
          handler: data => {
            address.responsible = data.question            
          }
        }
      ]
    });
    alert.present();
    
  }

  addDesc(address) {

    let alert = this.alertCtrl.create({
      title: "O que o mensageiro deve fazer?",
      inputs: [
        {
          name: 'question',
          placeholder: "Exemplo: entregar documento"
        }
      ],
      buttons: [
        {
          text: this.dataText.cancel,
          role: 'cancel',
          handler: data => {
            console.log('Cancelado')
          }
        },
        {
          text: 'Enviar',
          handler: data => {

            address.instructions = data.question
          }
        }
      ]
    });
    alert.present();
    
  }


  addPassword(address) {

    let alert = this.alertCtrl.create({
      title: "Digite uma senha para que o profissional consiga finalizar",
      inputs: [
        {
          name: 'question',
          placeholder: "Informar senha"
        }
      ],
      buttons: [
        {
          text: this.dataText.cancel,
          role: 'cancel',
          handler: data => {
            console.log('Cancelado')
          }
        },
        {
          text: 'Enviar',
          handler: data => {
            address.password = data.question            
          }
        }
      ]
    });
    alert.present();
    
  }

  
  finish(){    


    let total = this.finalValue.toFixed(2)
    let msg = "Deseja modificar a corrida para o valor de R$ " + total + " ?"


    if(this.emailProfissionalEntrega){
        
          if(!total)
              total = "0.00"

          if(total === "0.00"){
            total = this.payload.dropPointsFinalValue
          }
                      
         msg = "Deseja modificar a corrida para o valor de R$ " + total + " e o profissional para " + this.emailProfissionalEntrega + "?"
    }
    
    console.log(msg)
    
    let alert = this.uiUtils.showConfirm(this.dataText.warning, msg)
    alert.then((result) => {

      if(result){        
        this.finishContinue()
      }        
    })
  }

  finishContinue(){    

    this.defaultStuffDropPoints()

    .then(() => {      

      let total = this.finalValue.toFixed(2)

      if(!total)
         total = this.payload.dropPointsFinalValue

      if(total == "0.00")
        total = this.payload.dropPointsFinalValue


      this.payload.dropPointsFinalValue = total
      this.payload.carInfo.finalValue = total
      this.payload.carInfo.total = total
        
      console.log('Recalculando valores')
      
      this.calcPrices()
        .then((result) => {


          this.finishEnd()

      })

      
      

    })

       
  } 


  finishEnd(){

    let old = this.payload.dropPoints
    let neww = this.dropPointsTmp

    this.payload.dropPoints = this.dropPointsTmp
    this.payload.dropPointsResponsible = this.responsibles
    this.payload.dropPointsInstructions = this.instructions
    
    this.payload.dropPointsFinalDistance = this.tablePricesCallback.distanceCharged
    this.payload.dropPointsFinalDuration = this.tablePricesCallback.duration

    this.payload.carInfo.totalDistance = this.tablePricesCallback.distanceCharged + " Km"
    this.payload.carInfo.totalDistanceNum = this.tablePricesCallback.distanceCharged 

    this.payload.carInfo.totalTime = this.tablePricesCallback.duration + " Minutos" 
    this.payload.carInfo.totalTimeNum = this.tablePricesCallback.duration 

    this.payload.workComission = this.comission

    console.log(this.payload.carInfo.totalDistance)
    console.log(this.payload.carInfo.totalTime)    
    
    if(this.emailProfissionalEntrega){
      this.payload.driverUidOld = this.payload.driverUid
      this.payload.workerInfo = this.getProfessionalsInfo()
      this.payload.driverUid = this.payload.workerInfo.uid

    }      

    this.db.updateDistanceInfo(
      this.payload.key, 
      this.payload.dropPointsResponsible, 
      this.payload.dropPointsInstructions,
      this.payload.dropPointsFinalValue, 
      this.payload.dropPointsFinalDistance, 
      this.payload.dropPointsFinalDistanceMeters, 
      this.payload.dropPointsFinalDuration, 
      this.payload.workComission, 
      this.payload.carInfo,
      this.payload.dropPoints,
      this.payload.workerInfo, 
      this.payload.driverUid)


    .then(() => {            

      let token = ""

      if(this.payload.workerInfo && this.payload.workerInfo.token)
        token = this.payload.workerInfo.token

        
      this.db.addNotificationChange(this.payload.key, old, neww, this.dataInfo.userInfo, token)
      .then(() => {        
                      
        this.uiUtils.showAlertSuccess("Corrida modificada com sucesso!")   

        this.restartStatus()
      })

      .catch(() => {
        this.uiUtils.showAlertError("Não foi possível notificar o motoboy")          
      })

      this.navCtrl.pop()
      
    })
    .catch(() => {
      this.uiUtils.showAlertError("Falha ao salvar dados")        
    })    

      
  }

  restartStatus(){

    this.db.changeStatus(this.payload.key, "Modificado")
    .then(() => {
      
      setTimeout(() => {

        this.db.changeStatus(this.payload.key, "Iniciado")
          .then(() => {

            console.log('Status modificado com sucesso')
          })
        
      }, 3000);

    })
  }
    
  defaultStuffDropPoints(){

    let self = this


    return new Promise<void>((resolve, reject) => {

      self.responsibles = []
      self.instructions = []

      self.dropPointsTmp.forEach(element => {

        if(!element.responsible){
          element.responsible = this.dataText.notInformade
        }
    
        if(!element.instructions){
          element.instructions = this.dataText.notInformade
        }    

        self.responsibles.push(element.responsible)
        self.instructions.push(element.instructions)
      
    });

    resolve()

    })

    
                                         
  }


  goUp(address, i){
  
    if(this.dropPointsTmp[i-i]){
  
      let point = this.dropPointsTmp[i-1]

      if(point){

        if(!point.isReturn && ! point.startPoint && point.status === 'Aguardando'){        
          this.array_move(this.dropPointsTmp, i, i-1)
        }

      }
      

    }

    

  }

  goDown(address, i){




    let point = this.dropPointsTmp[i+i]

    if(point){
      
      if(!point.isReturn && !point.startPoint && point.status === 'Aguardando'){        
        this.array_move(this.dropPointsTmp, i, i+ 1)
      }

      if(point.status === 'Finalizado'){        
        this.array_move(this.dropPointsTmp, i, i+ 1)
      }

    }

  }



  array_move(arr, old_index, new_index) {

    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};






  clearProfessionals(){
    this.emailProfissionalEntrega= ""    
  }

  workersChanged(){
    console.log(this.emailProfissionalEntrega)
  }


  getProfessionalsInfo(): any {

    let info


    console.log(this.emailProfissionalEntrega)


    this.usersWorkersArray.forEach(element => {
      if(this.emailProfissionalEntrega.includes(element.name) && element.token){        
        info = element
      }
    });


    return info
  }




}


