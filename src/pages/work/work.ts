import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { DataTextProvider } from '../../providers/data-text/data-text'
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable'
import { RegisterPage } from '../register/register'; // Import the RegisterPage class

@IonicPage()
@Component({
  selector: 'page-work',
  templateUrl: 'work.html',
})
export class WorkPage {

  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public dataInfo: DataInfoProvider,    
    private geolocation: Geolocation,
    public db: DatabaseProvider,    
    public dataText: DataTextProvider,  
    public events: Events,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtrl.setRoot('LoginPage')             
  }

  startInterface(){

    if(!this.dataInfo.userInfo.isAdmin){

      this.subscribeStuff()        
      this.events.publish(this.dataInfo.eventFcmStart, 1);  
    }    
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

  subscribeStuff(){

    this.getCurrentLocation()
    .subscribe((location) => { 

        console.log(location)
      })
    
    this.events.subscribe(this.dataInfo.eventFcmToken, data => {   
                  
      this.dataInfo.setToken(data)
      this.db.saveToken(data)        
    });       
  }

  goPageWorks(){
    this.navCtrl.push('WorkRequestPage')
  }  

  goPageWorksAdd(){
    this.navCtrl.push('WorkRequestAddPage')
    //this.uiUtils.showAlertError("Em manutenção. Favor utilizar o acesso web do aplicativo cliente")    
  } 

  goPageHistory(){    
    this.navCtrl.push('HistoryPage')
  }  

  goPageCredits(){
    this.navCtrl.push('CreditsPage')
  }

  logout(){
    this.events.publish('logout')
  }

  goPageIfood(){
    this.navCtrl.push('IfoodOrdersPage')
  }

  goPageOnPedido(){
    this.navCtrl.push('OnpedidoPage');
  }

  goPageWorkWatch(){    
    this.navCtrl.push('WorkWatchPage');
  }

  goPageChat(){
    this.navCtrl.push('RoomPage');
  } 

  goPageRegister(){
    this.navCtrl.push(RegisterPage);
  }


}

