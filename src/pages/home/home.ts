import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs/Subscription'
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {  

  private serviceSubscription: Subscription;

  paymentTitle: string = "Aguardando"
  totalRegisterCompleted: string = "100"

  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    private geolocation: Geolocation,
    public dataInfo: DataInfoProvider,
    public events: Events,
    public dataText: DataTextProvider,
    private iab: InAppBrowser,    
    public db: DatabaseProvider,
    public navParams: NavParams) {

  }

  ionViewDidLoad() {  
    
    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')  
    
    
    this.subscribeStuff()   
  }

  subscribeStuff(){
    this.events.subscribe(this.dataInfo.eventFcmToken, data => {                
      this.dataInfo.setToken(data)
      this.db.saveToken(data)        
  });       
  }

  ngOnDestroy() {
    this.events.unsubscribe(this.dataInfo.eventFcmStart);

    if(this.serviceSubscription)
      this.serviceSubscription.unsubscribe()
  }

  startInterface(){
    this.events.publish(this.dataInfo.eventFcmStart, 1);
    this.getServices()

    this.getCurrentLocation()
    .subscribe(() => {
      
    })
    if(this.dataInfo.isDev){
      this.dev()    
    }
  }
  
  dev(){
    
    this.navCtrl.setRoot("SettingsPage");          
  }

  goPageClients(){
    this.navCtrl.push('ClientsPage')
  } 

  goPagProfessionals(){
    this.navCtrl.push('ProfessionalsPage')
  }

  goPageAgenda(){
    this.navCtrl.push('AgendaPage')
  }
  
  goPagePromotions(){
    this.navCtrl.push('PromotionsPage')
  }

  goPagePayments(){
    this.navCtrl.push('PaymentsPage')
  }

  goPageWorks(){
    this.navCtrl.push('WorkPage')
  }

  goPageAPI(){
    this.navCtrl.push('ApiPage')
  }

  goPageSettings(){              
    this.navCtrl.push('SettingsPage')    
  }    
  
  logout(){
    this.events.publish('logout')
  }

  getServices(){
         
    this.serviceSubscription= this.db.getServices()

    .subscribe(data => {        
      this.getServicesCallback(data)    
      
      this.serviceSubscription.unsubscribe()
    })
  }

  getServicesCallback(data){  

    let services = []
    let promises = []    
    let self = this

    let loading = this.uiUtils.showLoading("Carregando serviços disponíveis na sua região")

    loading.present();

    data.forEach(element => {

      let promise = new Promise<void>(function(resolve){

        let val = element.payload.val()
        val.toggle = false      
        val.total = val.value                
        services.push(val)   
        
        resolve()

      });      

      promises.push(promise)
                  
    });

    Promise.all(promises).then(function(){
      self.dataInfo.services = services
      loading.dismiss()
    })
      
  }

  getCurrentLocation() {

    let options = {timeout : 10000 , enableHighAccuracy:  true, maximumAge: 0};
    let locationObs = new Observable(observable => {

      this.geolocation.getCurrentPosition(options)
      .then(resp => { 

        this.dataInfo.userInfo.latitude =  resp.coords.latitude
        this.dataInfo.userInfo.longitude = resp.coords.longitude

        console.log(this.dataInfo.userInfo.latitude, this.dataInfo.userInfo.longitude)
               
        this.events.publish('save-lat-long')   
        this.db.saveLatLong(this.dataInfo.userInfo.latitude, this.dataInfo.userInfo.longitude)    
                                
        let location = new google.maps.LatLng(this.dataInfo.userInfo.latitude, this.dataInfo.userInfo.longitude);
        observable.next(location);                
             
      }).catch( error => {      

      
        this.uiUtils.showAlertError(error)

      })
    })
        
    return locationObs;
  }    
      
  showHelp(){
    let url = "https://github.com/MotokApp/Suporte"
    let options = 'location=no';
    const browser = this.iab.create(url, '_blank', options);    
  }

  showRedMine(){    
    let url = "https://github.com/MotokApp/Suporte"
    let options = 'location=no';
    const browser = this.iab.create(url, '_blank', options);    
  }  

  goPageServicess(){
    this.navCtrl.push('ServicessPage')
  }

  goPageTablesPrice(){    
    this.navCtrl.push('TablesPricePage')
  }

  
  goPageBrands(){
    this.navCtrl.push('CarBrandPage')
  }  

  suporte(){
    let url = this.dataInfo.appConfig.appHelp
		window.open(url, '_blank');
  }

  goPageRegions(){
    this.navCtrl.push('RegionsPage')
  }

  goPageManager(){
    this.navCtrl.push('ManagersPage')
  }
      
}
