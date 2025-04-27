
import { Component } from '@angular/core';
import { NavController, Platform, NavParams, Events, IonicPage } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-credits-manual',
  templateUrl: 'credits-manual.html',
})
export class CreditsManualPage {

  public creditNew: number = 0;
  public creditNow: number = 0;
  
  uid_ : string = ""
  payload: any 

  constructor(
    public navCtrl: NavController, 
    public platform: Platform,
    public uiUtils: UiUtilsProvider,      
    public navParams: NavParams,    
    public events: Events,
    public dataText: DataTextProvider,
    public db: DatabaseProvider,
    public dataInfo: DataInfoProvider) {                       
      
      this.clear()
  }

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtrl.setRoot('LoginPage')       
  }

  startInterface(){
    
    this.payload = this.navParams.get('payload')

    
    if(this.payload){    
      this.loadInfo()
    }

    console.log('Iniciando creditos', this.payload)
  }


  loadInfo(){

    let pay = this.payload
    console.log(pay)
    

    this.creditNow = pay.credits  
    this.uid_ = pay.uid
  }
  
  save(){
    if(true){

      let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
      alert.then((result) => {

      if(result)  
        this.update()    
       })
    }    
  }

  clear(){
    this.creditNew = 0
    this.uid_ = ""  
  }   

  update(){

    if(this.uid_)
        this.updateContinue()    
    else 
      this.uiUtils.showAlert(this.dataText.warning, "Falha ao atualizar créditos. Favor verificar o cadastro do profissional").present()            
  }

  updateContinue(){

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)
    loading.present()

    let self = this  

    this.db.updateUserCredit(      
      this.uid_,
      this.creditNew
  )
  .then( () =>{
    
      console.log('Atualizando creditos', this.payload)

      self.events.publish('update', this.payload)

      self.clear()
      loading.dismiss()
      this.navCtrl.pop()
      this.uiUtils.showAlertSuccess('Atualizado com sucesso')
    })

    .catch( error => {      

      console.log(error)

      loading.dismiss()
      this.uiUtils.showAlert(this.dataText.warning, "Falha ao atualizar créditos. Favor verificar o cadastro do profissional").present()

    })   
  }


}
