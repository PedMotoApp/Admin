import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription'
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-work-run-history',
  templateUrl: 'work-run-history.html',
})
export class WorkRunHistoryPage {

  private worksSubscription: Subscription;  

  works: Observable<any>;
  worksArray: any = []
  payload: any

  tablePrice: any 
  
  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public dataInfo: DataInfoProvider,    
    public db: DatabaseProvider,
    public platform: Platform,
    public dataText: DataTextProvider,  
    private iab: InAppBrowser,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {        

    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')          
  }

  startInterface(){
    this.payload = this.navParams.get('payload')

    console.log(this.payload)

    this.getTablePrices()
  }

  ngOnDestroy() {
    this.worksArray = []

   if(this.worksSubscription)
    this.worksSubscription.unsubscribe()
  }   

  getTablePrices(){
    this.tablePrice = this.dataInfo.tablePrice
    this.get()
  }   
      
  get(){   
    
    this.worksArray = []

    let key = this.payload.key

    if(this.payload.serviceKey){
      
      key = this.payload.serviceKey
    }

    console.log(key)

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)    
    loading.present()

    let sub = this.db.getWorkAccept(key)
    .subscribe(data => {

      loading.dismiss()           
      sub.unsubscribe()
    
      this.reloadCallback(data)              
    })            

  }

  reloadCallback(data){

    
    data.forEach(element => {        
      this.payload = element.payload.val()
    })

    let info = this.payload

    if(info.datetimeStart)
      info.datetimeStart = moment(info.datetimeStart).format("DD/MM/YYYY HH:mm:ss")

    if(info.datetimeFinish)
      info.datetimeFinish = moment(info.datetimeFinish).format("DD/MM/YYYY HH:mm:ss")
                        
    if(info.dropPoints){

      info.dropPoints.forEach(element => {          

        if(element.arrived && element.datetimeEnd){

          element.totalWait = moment(element.datetimeEnd).diff(element.arrived, "minutes")

          if(element.totalWait === 0){              
            element.totalWait = moment(element.datetimeEnd).diff(element.arrived, "seconds") + " segundo(s)"
            
          } else {
              element.totalWait = moment(element.datetimeEnd).diff(element.arrived, "minutes") + " minuto(s)"                
          }

          let minutes = moment(element.datetimeEnd).diff(element.arrived, "minutes")            
          info.totalTimeWaiting += minutes
        }

        if(element.datetime)
          element.datetime = moment(element.datetime).format("DD/MM/YYYY HH:mm:ss")

        if(element.datetimeEnd)
          element.datetimeEnd = moment(element.datetimeEnd).format("DD/MM/YYYY HH:mm:ss")

        if(element.arrived)
          element.arrived = moment(element.arrived).format("DD/MM/YYYY HH:mm:ss")     
          
          

                
      });
    }
         
    console.log('info', info)



    
    this.worksArray.push(info)
    this.organizaFila()
  }

  organizaFila(){    

    this.worksArray.sort((a, b) => {

      let date1 = moment(a.datetime, "DD/MM/YYYY HH:mm:ss").format()
      let date2 = moment(b.datetime, "DD/MM/YYYY HH:mm:ss").format()
      
      let isBefore = moment(date1).isBefore(date2)      

      return isBefore ? 1 : -1;
      
    })    
  }
  
  expand(work){
    work.expand = !work.expand    
  }

  open(data){    
    //this.iab.create(data.url);

    let options = 'location=no';
    const browser = this.iab.create(data.url, '_blank', options);

  }
 


}
