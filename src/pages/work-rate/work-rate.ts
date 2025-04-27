import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ViewController } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-work-rate',
  templateUrl: 'work-rate.html',
})
export class WorkRatePage {
  
  imageWorker: string 
  displayName: string
  
  comments: string = ""
  valueRate: number = 5
  indicate: boolean = false

  workKey: string  
  workerUid: string
  isRated: Boolean  = false

  clientUid: string

  private payload;

  constructor(
    public navCtl: NavController,
    public dataInfo: DataInfoProvider,
    public uiUtils: UiUtilsProvider,
    public db: DatabaseProvider,
    public events: Events,
    public dataText: DataTextProvider,  
    public viewCtrl: ViewController,
    public navParams: NavParams) {

      
      this.imageWorker = this.dataInfo.imgDefaultClient
  }

  ionViewDidLoad() {
    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtl.setRoot('LoginPage')
  }

  startInterface(){
   
    this.workKey  = this.navParams.get("key")

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)    
    loading.present()

    let sub = this.db.getWorkAccept(this.workKey)
    .subscribe(data => {

      loading.dismiss()           
      sub.unsubscribe()
    
      this.reloadCallback(data)              
    })
  }

  reloadCallback(data){

    data.forEach(element => {
        
      let info = element.payload.val()
      console.log(info)
      
      this.payload = info

      if(info.workerInfo){
        this.imageWorker = info.workerInfo.photo
        this.displayName = info.workerInfo.name
        this.workerUid = info.workerInfo.uid
      }
      
      this.clientUid = info.uid      
      this.isRated = info.isRated
      this.valueRate = info.valueRate
      this.comments = info.comments
    
    });

    if(!this.valueRate)
      this.valueRate = 5

    console.log('Avaliando ', this.displayName)
  }

  goHome(){    
    this.events.publish('clearHome', true)
    this.viewCtrl.dismiss()
  }

  onModelChange(event){
      this.valueRate = event
  } 

  indicateInfo(){

    let element;

    if(this.dataInfo.isWeb)
      element = this.payload.data
    else
      element = JSON.parse(this.payload)
    
    let workerTotalIndications = element.workerInfo.totalIndications

    if(!workerTotalIndications)
      workerTotalIndications = 1

    this.db.updateIndication(this.workerUid, workerTotalIndications++)    
    .then(() => {
      //console.log('Informações de indicação salvas com sucesso!')
    })
    
  } 

  finish(){
    let self = this

    this.uiUtils.showAlert(this.dataText.warning, "Avaliaçaõ realizada com sucesso")
    .present()
    .then(function(){
    
      self.goHome()
   })
  }  
  
  save(){

    if(! this.comments){
      this.comments = ""
    }
   
    this.db.rateAndCommentWork(this.workKey, this.comments, this.valueRate)
    .then(() => {
  
      //this.indicateInfo()
      this.finish()
    })

   
  }

  
}
