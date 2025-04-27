import { Component, ViewChild, ElementRef, NgZone, OnInit } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'
import * as moment from 'moment';

declare var google;

@IonicPage()
@Component({
  selector: 'page-work-watch',
  templateUrl: 'work-watch.html',
})
export class WorkWatchPage implements OnInit {

  @ViewChild('maprun') mapElement: ElementRef;

  works: Observable<any>;  
  map: any;  
  
  markers: any = []   
  startPosition: any
  bounds: any
  status: string = "Criado"        
  searchTerm: string = '';
  
  icon: string 
  requestType: string = "Todos"

  allJobs: any = [] 
  allJobsFinished: any = []
  allJobsCanceled: any = []
  allOnline: any = [] 
  allClientsOnline: any = [] 
  allWorking: any = [] 
  allJobsList: any = []   
  
  totalOnline: number = 0
  totalWorks: number = 0
  totalWorksFinished: number = 0
  totalWorksOpen: number = 0
  totalWorksCanceled: number = 0
  totalOnlineClients: number = 0
  latLngInterval: any

  worksInterval: any
  worksNowInterval: any


  constructor(
    public navCtl: NavController, 
    public dataInfo: DataInfoProvider,
    public uiUtils: UiUtilsProvider,
    public events: Events,
    public _ngZone: NgZone,
    public alertCtrl: AlertController,
    public db: DatabaseProvider,
    public httpd: HttpdProvider,
    public dataText: DataTextProvider,  
    public navParams: NavParams) {
  }

  ngOnInit() {
    window["angularComponentRef"] = { component: this, zone: this._ngZone };
  }

  ngOnDestroy(){  
    
    if(this.worksNowInterval)
      clearInterval(this.worksNowInterval)

    if(this.worksInterval)
      clearInterval(this.worksInterval)
  }

  ionViewDidLoad() {    
    
    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtl.setRoot('LoginPage')    
  }

  startInterface(){
    
    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)    
    loading.present() 

    this.icon = this.dataInfo.iconLocationClient

    if(this.dataInfo && this.dataInfo.appConfig && this.dataInfo.appConfig.iconLocationClient)
      this.icon = this.dataInfo.appConfig.iconLocationClient

    
    this.initializeMap()    
    this.centerMap()
    this.getClients()    
    this.getWorksNow()  
    this.loadOnlines()
    this.startIntervalJobs()    
    
    setTimeout(() => {

      loading.dismiss()   
    }, 3000);

  }


  startIntervalWorkers(){

    let time = 30000

    if(this.dataInfo.appConfig && this.dataInfo.appConfig.updateMapTimeWatch){
      time = this.dataInfo.appConfig.updateMapTimeWatch
    }
    
    this.worksInterval = setInterval(() => {
      this.getWorksNow()  
      
    }, time);
      

  }


  startIntervalJobs(){

    let time = 30000

    if(this.dataInfo.appConfig && this.dataInfo.appConfig.updateMapTimeWatch)
      time = this.dataInfo.appConfig.updateMapTimeWatch
    
    
    this.worksNowInterval = setInterval(() => {
      
      this.loadWorks()  
      
    }, time);      

  }


  loadOnlines(){

    this.getWorkers()
    .then(() => {

      this.addOnline()      
    })
  }

  
  
  initializeMap() {
    
    this.bounds = new google.maps.LatLngBounds();
    this.startPosition = new google.maps.LatLng(this.dataInfo.userInfo.latitude, this.dataInfo.userInfo.longitude);

		const mapOptions = {
      center: this.startPosition,
      zoom: 12
		}
	 
    this.map = new google.maps.Map(document.getElementById('mapwatch'), mapOptions);     
  }

  zoomMap(){
    this.map.zoom = 12
  }

  
  clearMarkers(map){
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }

  }

  clearAll(){
    this.clearMarkers(null)
    this.markers = []    
  } 
  
  
  setFilteredItems(){

    this.clearMarkers(null)
    this.markers = []    

    this.allJobs.forEach(element => {
        this.searchAndAdd(element)
    })

  }

  searchAndAdd(element){
    
    if(element.name.includes(this.searchTerm)){
      this.loadUsersMarkers(element)
    }      
    else if(element.workerInfo && element.workerInfo.name.includes(this.searchTerm)){
      this.loadUsersMarkers(element)
    }              
  }  


  fit(){
    this.map.fitBounds(this.bounds);
  }

  

  centerMap(){
    var center = new google.maps.LatLng(this.dataInfo.userInfo.latitude, this.dataInfo.userInfo.longitude);    
    this.map.panTo(center);
  }  

  getContent(works){

    var contentString = '<div id="iw-container">' +
        '<div class="iw-title">Status da corrida ' + works.key + '</div>' +
        '<div class="iw-content">' +
          '<div class="iw-subTitle"><p><b> {{dataText.name}} do cliente: </b>' + works.name + ' </p></div>' +
          '<p><b> {{dataText.name}} do profissional: </b>' + works.workerInfo.name + ' </p>' +          
          '<p><b> Status: </b>' + works.status + ' </p>' +
          '<p><b> Origem: </b>' + works.fromAddress + ' </p>' +
          '<p><b> Destino(s): </b>' + works.toAddress + ' </p>' +
          '<p><b> Mensagem: </b>' + works.msg + ' </p>' +

          '<button block class="btn btn-primary btn-lg btn-block" onclick="window.angularComponentRef.zone.run(() => {window.angularComponentRef.component.showHistory(\'' + works.key + '\');})">Histórico da corrida</button>' +
        '</div>' +
      '</div>';



    return contentString
  }

  getContentOnline(works){

    var contentString = '<div id="iw-container">' +
        '<div class="iw-title">Última vez online ' + works.last + '</div>' +
        '<div class="iw-content">' +
          '<div class="iw-subTitle"><p><b> {{dataText.name}} do motoboy: </b>' + works.name + ' </p></div>' +
          '<p><b> Telefone: </b>' + works.tel + ' </p>' +
          '<p><b> Endereço: </b>' + works.address + ' </p>' +
        '</div>' +
      '</div>';



    return contentString
  }
 

  showPrompt(info) {

    const prompt = this.alertCtrl.create({
      title: 'Enviar Mensagem',
      message: "Favor digite a mensagem que deseja enviar",
      inputs: [
        {
          name: 'Histórico da corrida',
          placeholder: 'Histórico da corrida'
        }
      ],
      buttons: [
        {
          text: this.dataText.cancel,
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enviar',
          handler: data => {

            this.db.addNotification('Mensagem do sistema', info, data.title)      
            this.uiUtils.showAlertSuccess("Notificação enviada com sucesso!")      
          }
        }
      ]
    });

    prompt.present();
}
  

  showPromptSMS(tel){

    if(tel){

      const prompt = this.alertCtrl.create({
        title: 'Enviar Mensagem',
        message: "Favor digite a mensagem que deseja enviar",
        inputs: [
          {
            name: 'title',
            placeholder: 'Escrever mensagem'
          },
        ],
        buttons: [
          {
            text: this.dataText.cancel,
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Enviar',
            handler: data => {                            
              
            }
          }
        ]
      });

      prompt.present();      

    }


    else {
      this.uiUtils.showAlertError("Profissional não possui número cadastrado")
    }    
  }
 

  goBack(){
    this.navCtl.pop()
  }
   
  showHistory(key){            

    if(this.latLngInterval)
      clearInterval(this.latLngInterval)
      
    let payload = {key : key}
    this.navCtl.push('WorkRunHistoryPage', {payload: payload})
  }


  showOpen(){
    this.navCtl.push('HistoryPage', {status: 'Criado'})
  }

  showCanceled(){
    this.navCtl.push('HistoryPage', {status: 'Cancelado'})
  }

  showFinished(){
    this.navCtl.push('HistoryPage', {status: 'Finalizado'})
  }

  

  cancelWorkDelivery(work){
    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantCancel)  
    alert.then((result) => {

      if(result)  
        this.cancelDeliveryContinue(work)
    })  
  }

  cancelDeliveryContinue(work){ 
    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)    
    loading.present() 

    let msg = "Cancelado pelo painel às " + moment().format("DD/MM/YYYY HH:mm:ss")


    this.db.cancelWork(work.key, msg)

    .then( () => {
        this.uiUtils.showAlert(this.dataText.warning, this.dataText.removeSuccess)
        
        if(loading)
          loading.dismiss() 



        this.showWorksNow()
    })
  }  

  finishWorkDelivery(work){

    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantFinish)  
    alert.then((result) => {

      if(result)  
        this.finishDeliveryContinue(work)
    })  
  }

  finishDeliveryContinue(work){  

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)    
    loading.present() 

    this.db.changeStatus(work.key, "Finalizado")

    .then( () => {

        this.uiUtils.showAlert(this.dataText.warning, this.dataText.finishedSuccess)             

        if(loading)
          loading.dismiss() 

      this.addOnline()  
    })
  }  
  



  edit(work){    

    if(this.latLngInterval)
      clearInterval(this.latLngInterval)

   this.navCtl.push('SearchDeliveryPage', {payload: work})    
  }  


  getClients(){

    this.db.getClients()

    .subscribe(data => {
      this.getClientsCallback(data)              
    })
    
  }

  getClientsCallback(data){   

    this.totalOnlineClients = 0
    this.allClientsOnline = []
    
    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key      
      info.lastDatetimeStr = moment(info.lastDatetime).format("DD/MM/YYYY hh:mm:ss")

      if(info.status !== 'Desativado' && info.status !== 'Removido'){                

        if(info.lastDatetime){

          if(moment(info.lastDatetime).isSame(moment(), 'day') && 
               moment(info.lastDatetime).add(10, 'minutes').isAfter(moment())){        
                                        
  
            if(this.dataInfo.userInfo.isAdmin)          
              this.getClientsContinue(info)
            
            if(this.dataInfo.userInfo.managerRegion){
      
              if(info.region === this.dataInfo.userInfo.managerRegion)
                this.getClientsContinue(info)
              
            }
          }

        }
        

      }

      

    })

  }


  getClientsContinue(info){

    this.totalOnlineClients++
    this.allClientsOnline.push(info)
  }
  
  getWorkers(){

    return new Promise<void>((resolve, reject) => {

      this.db.getWorkers()

      .subscribe(data => {
          this.getWorkersCallback(data)
          resolve()      
        
        })

    })
    
  }

  getWorkersCallback(data){      
    
    this.allJobsList = []
    this.allOnline = []     
    this.allWorking = []
    this.totalOnline = 0   

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      info.lastDatetimeStr = moment().format("DD/MM/YYYY hh:mm:ss")      
      const isWorking = this.isWorking(info)

      if(info.status !== 'Desativado' && info.status !== 'Removido'){

        if(info.statusJob){

          if(!isWorking){
            
            if(moment(info.lastDatetime).add(10, 'minutes').isAfter(moment())){

              if(this.dataInfo.userInfo.isAdmin)          
                this.getWorkersContinue(info)    
                          
              else if(info.region === this.dataInfo.userInfo.region)
                  this.getWorkersContinue(info)    
                                    
            }                    
          } else {          
  
            this.allJobs.forEach(element => {
  
              if(element.driverUid === info.uid){              
  
                element.workerInfo.latitude = info.latitude
                element.workerInfo.longitude = info.longitude
              }
              
            });
  
  
            this.allWorking.push(info)
  
          }
          
        }

      }
            
     
        
        
    });

    this.sortOnline()
  }

  getWorkersContinue(info){

    this.totalOnline++
    this.allOnline.push(info)
    this.allJobsList.push(info)
  }

  sortOnline(){

    let tmp = this.allOnline.sort(function(a,b) {

      if(a.name && b.name){

        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
      }
      
      return 0;

    })    

    this.allOnline = tmp
  }
  
  getWorksNow(){          

    this.works = this.db.getAllWorksAccepteds()

    this.works.subscribe( data => {   
        this.loadWorksCallback(data)                                      
    }) 

  }

  loadWorksCallback(data){
    
    this.allJobs = []
    this.totalWorks = 0
    this.totalWorksFinished = 0
    this.totalWorksCanceled = 0
    this.totalWorksOpen = 0
   
    data.forEach(element => {
  
      let info = element.payload.val()              
      info.key = element.key

      if(info.datetime){        

        if(this.dataInfo.userInfo.isAdmin){
          this.loadWorksAddNow(info)
        }

        else {

          if(info.uid === this.dataInfo.userInfo.uid){
            this.loadWorksAddNow(info)          
          }

        }                
      }      

    })     
    
    this.sortWorks()    
            
  }


  loadWorksAddNow(info){

    let today = moment()        

    if(moment(info.datetime).isSame(today, 'day')){    
                  
      info.lastDatetimeStr = moment().format("DD/MM/YYYY hh:mm:ss")
          
      if(info.status === 'Aceito' || info.status === 'Iniciado'){      

        info.image = this.icon                      

        this.allJobs.push(info)  
        this.totalWorks++                             
      }    
      
      
      else if(info.status === 'Criado'){
        this.totalWorksOpen++
      }
      
      else if(info.status === 'Finalizado'){
        this.allJobsFinished.push(info)
        this.totalWorksFinished++
      }


      else if(info.status === 'Cancelado'){
        this.allJobsCanceled.push(info)
        this.totalWorksCanceled++
      }


    }
  }

  sortWorks(){

    let tmp = this.allOnline.sort(function(a,b) {


      if(a.workerInfo && b.workerInfo){

        if(a.workerInfo.name < b.workerInfo.name) { return -1; }
        if(a.workerInfo.name > b.workerInfo.name) { return 1; }
        
      }
      
      return 0;

    })    

    this.allOnline = tmp
  }

  
  addClientsOnline(){

    this.uiUtils.showToast(this.dataText.showClients)
    this.requestType = 'Cliente'    
    this.clearAll()   

    this.allClientsOnline.forEach(info => {

        if(info.datetime){
           info.datetime = moment(info.datetime).format("DD/MM/YYYY HH:mm:ss")
        }

        this.loadOnlineMarkers(info)
    });
        

  }

  addOnline(){        

    this.uiUtils.showToast(this.dataText.showProfessionals)
    this.requestType = "Todos"
    this.clearAll()   

    this.allOnline.forEach(info => {

        if(info.datetime){
           info.datetime = moment(info.datetime).format("DD/MM/YYYY HH:mm:ss")
        }

        this.loadOnlineMarkers(info)
    });
        
  }
 

  loadOnlineMarkers(info){    
    
      let marker = new google.maps.Marker({        
        label: {
          color: 'black',
          fontWeight: 'bold',
          text: info.name,
        },
        icon: {
          labelOrigin: new google.maps.Point(11, 50),
          url:this.icon,
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(11, 40),
        },        
        position: new google.maps.LatLng(info.latitude, info.longitude),
        map: this.map, 
        id: 1
  
      });      
  

      this.bounds.extend(marker.position);              
      this.markers.push(marker)            
  }
  
  
  showWorksNow(){     
    this.requestType = "Serviço"            
    this.loadWorks()            
  }

  loadWorks(){    


    this.clearAll()

    if(this.allJobs.length > 0){      

      this.allJobs.forEach(element => {    

        if(this.dataInfo.userInfo.isAdmin){
            this.loadWorksAdd(element)          
        }
        else {

          if(element.uid === this.dataInfo.userInfo.uid){
            this.loadWorksAdd(element)          
          }

        }

           

      });    

    } else {

      this.uiUtils.showToast(this.dataText.noJobsRunning)      
    }

    
  }

  loadWorksAdd(element){

    if(element.datetime)
      element.datetimeStr = moment(element.datetime).format("DD/MM/YYYY HH:mm:ss")
  

    this.loadUsersMarkers(element)     

  }


  loadUsersMarkers(info){        
    
    
    let latitude = info.workerInfo.latitude
    let longitude = info.workerInfo.longitude    

    if(info.workerInfo && latitude && longitude){
           
      info.image = this.icon

        let marker = new google.maps.Marker({        
          label: {
            color: 'black',
            fontWeight: 'bold',
            text: info.workerInfo.name,
          },
          icon: {
            labelOrigin: new google.maps.Point(11, 50),
            url: this.icon,

            
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11, 40),

          },        

          position: new google.maps.LatLng(latitude, longitude),
          map: this.map, 
          id: 1
    
        }); 
                        
      
        this.markers.push(marker)
        this.bounds.extend(marker.position);       
        
    }        

  } 
  


  
  
  isWorking(element): Boolean{

    let working = false

    this.allJobs.forEach(job => {

      if(job.workerInfo){

        if(job.workerInfo.uid === element.uid)
          working = true
      }
      
    });


  return working
}



restartWork(work){


  let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantRestart)  
  alert.then((result) => {

    if(result)  
      this.restartWorkContinue(work)
  })  

}

restartWorkContinue(work){              
  
  this.db.restartWork(work)

  .then( () => {
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.restartOk)                        
  })
 }  


 
}
