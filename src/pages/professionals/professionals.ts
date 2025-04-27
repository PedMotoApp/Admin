import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Platform, Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'
import { DocumentationPage } from '../../pages/documentation/documentation'
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-professionals',
  templateUrl: 'professionals.html',
})
export class ProfessionalsPage {

  usersWorkers: Observable<any>;
  usersWorkersArray: any = []
  workInfo: any;

  worker: any

  searchTerm: string = '';
  searching: any = false;
  select: Boolean = false
  orderType: any

  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public dataInfo: DataInfoProvider,
    public platform: Platform,
    public db: DatabaseProvider,
    public events: Events,
    public httpd: HttpdProvider,
    public actionsheetCtrl: ActionSheetController,
    public dataText: DataTextProvider,
    public navParams: NavParams) {

  }

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtrl.setRoot('LoginPage')
    
  } 
  
  startInterface(){

    this.orderType = "1"

    
  
    this.events.subscribe('reload-professionals', payload => {			
			this.reload()
    });

    this.events.subscribe('update', payload => {			
			if(payload.userType === 2){
        this.reload()
      }
    });


    this.getDenuncias()

    this.select = this.navParams.get('select')
    this.workInfo = this.navParams.get('workInfo')
    this.reload()
  }

  ngOnDestroy() {
    this.events.unsubscribe('update');  
    this.events.unsubscribe('reload-professionals');  
  }

  setFilteredItems(){
    
    this.usersWorkers = this.db.getUserName(this.searchTerm)    

    this.usersWorkers.subscribe(data => {
      this.reloadCallback(data)
    });
  }  


  reload(){
    let loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations)
    loading.present()
    
    this.usersWorkers = this.db.getWorkers()

    let sub = this.usersWorkers.subscribe(data => {
      loading.dismiss()

      this.reloadCallback(data)

      if(this.select)
        this.uiUtils.showToast(this.dataText.selectProfessional)

      setTimeout( () => {        
        sub.unsubscribe()
      })
    })
    
  }

  reloadCallback(data){

    this.usersWorkersArray = []

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      info.lastDatetimeStr = moment(info.lastDatetime).format("DD/MM/YYYY hh:mm:ss")

      if(info.userType === 2){

        if(info.status !== 'Desativado' && info.status !== 'Removido'){
          this.addArray(info)
          
        }                     
          
      }
    });
  
    this.checkOrder()
  } 

  addArray(element){   

    if(element.datetime)
      element.datetime = moment(element.datetime).format("DD/MM/YYYY hh:mm:ss")

    if(element.lastDatetime)
      element.lastDatetime = moment(element.lastDatetime).format("DD/MM/YYYY hh:mm:ss")
    
    if(this.worker && this.worker.name === element.name)
      this.checkRegion(element)    
      
    else 
      this.checkRegion(element)
        
  }

  checkRegion(info){


    if(this.dataInfo.userInfo.isAdmin)
      this.usersWorkersArray.push(info)
    

    if(this.dataInfo.userInfo.managerRegion){
      
      if(info.region === this.dataInfo.userInfo.managerRegion)
        this.usersWorkersArray.push(info)
      
    }

  }


  checkOrder(){

    if(this.orderType === "1"){
        this.orderAlpha()    
    }
    
    else if(this.orderType === "2"){
      this.orderAlphaDesc()    
    }

    else if(this.orderType === "3"){
      this.orderDatetime()    
    }

    else if(this.orderType === "4"){
      this.orderAccess()    
    }

    else {
      this.uiUtils.showToast(this.dataText.errorFilter)
    }

  }

  orderAlpha(){

    let tmp = this.usersWorkersArray.sort(function(a,b) {

      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;

    })    


    this.usersWorkersArray = tmp
  }

  orderAlphaDesc(){

    let tmp = this.usersWorkersArray.sort(function(a,b) {

      if(a.name > b.name) { return -1; }
      if(a.name < b.name) { return 1; }
      return 0;

    })    


    this.usersWorkersArray = tmp
  }

  orderDatetime(){

    let tmp = this.usersWorkersArray.sort(function(a,b) {

      if(a.datetime < b.datetime) { return 1; }
      if(a.datetime > b.datetime) { return -1; }
      return 0;

    })    


    this.usersWorkersArray = tmp
  }


  orderAccess(){

    let tmp = this.usersWorkersArray.sort(function(a,b) {

      
      if(a.lastDatetime && b.lastDatetime){
        if(a.lastDatetime > b.lastDatetime) { return -1; }
        if(a.lastDatetime < b.lastDatetime) { return 1; }
      }
      
      return 0;

    })    


    this.usersWorkersArray = tmp
  }

  goPageUserDetails(worker_){    
  }

  updateRanking(user, ranking){
    this.db.updateRankingUser(user, ranking)
    .then( () => {

      this.uiUtils.showAlert(this.dataText.success, this.dataText.savedSuccess).present()
      this.reload()
    })
  }
    
  changeRanking(key) {

    let actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectRank,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Ouro',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'medal' : null,
          handler: () => {            
            this.updateRanking(key, this.dataInfo.titleRankingGold)
          }
        },
        {
          text: 'Prata',
          icon: !this.platform.is('ios') ? 'medal' : null,
          handler: () => {
            this.updateRanking(key, this.dataInfo.titleRankingSilver)
          }
        },
        {
          text: 'Bronze',
          icon: !this.platform.is('ios') ? 'medal' : null,
          handler: () => {
            this.updateRanking(key, this.dataInfo.titleRankingBronze)
          }
        },
        {
          text: 'Top',
          icon: !this.platform.is('ios') ? 'md-trophy' : null,
          handler: () => {
            this.updateRanking(key, this.dataInfo.titleRankingStar)
          }
        },
        {
          text: this.dataText.cancel,
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'star' : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  changeProfileStatus(key){

    let actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectRank,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: this.dataText.verifiedProfile,          
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'checkmark-circle' : null,
          handler: () => {            
            this.updateProfileStatus(key, this.dataInfo.titleProfileVerified)
          }
        },        
        {
          text: this.dataText.notVerifiedProfile,
          icon: !this.platform.is('ios') ? 'remove-circle' : null,
          handler: () => {
            this.updateProfileStatus(key, this.dataInfo.titleStatusNotVerified)
          }
        },
        {
          text: this.dataText.cancel,
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();

  }

  updateProfileStatus(key, status){

    this.db.updateProfileStatusUser(key, status)
    .then(data => {
      this.uiUtils.showAlert(this.dataText.success, this.dataText.savedSuccess).present()

      this.reload()
    })
  }

  documentations(worker){

    this.navCtrl.push(DocumentationPage, {info: worker})
  }

  options(payload_){

    let actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectOption,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: this.dataText.edit,
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'checkmark-circle' : null,
          handler: () => {            
            this.edit(payload_)
          }
        },   
        {
          text: this.dataText.disableUser,
          icon: !this.platform.is('ios') ? 'md-close-circle' : null,
          handler: () => {
            this.disableUser(payload_)
          }
        },                
        {
          text: this.dataText.remove,
          icon: !this.platform.is('ios') ? 'md-trash' : null,
          handler: () => {
            this.removeUser(payload_)
          }
        },
        {
          text: this.dataText.credits,
          role: 'destructive',
          icon: 'cash',
          handler: () => {            
            this.credit(payload_)
          }
        },
        {
          text: this.dataText.documents,
          role: 'destructive',
          icon: 'clipboard',
          handler: () => {            
            this.documentations(payload_)
          }
        },
        {
          text: this.dataText.cancel,
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  edit(payload_){    
    this.navCtrl.push('ProfessionalsAddPage', {payload: payload_})
  }

  removeUser(payload_){


    console.log(payload_)
    
    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.areYouVerySure)  
    alert.then((result) => {

      if(result){
        if(!this.dataInfo.isTest)
          this.removeUserContinue(payload_)
        
        else 
          this.uiUtils.showAlertError(this.dataText.accessDenied)                        
      }    

      
    })       
  }

  removeUserContinue(payload_){    

    let loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations)
    loading.present()

    if(!payload_.uid)
      payload_.uid = payload_.key
                     
    this.httpd.apiRemoveUser({uid: payload_.uid})
      .subscribe((result) => {              

        console.log(result)

        this.uiUtils.showAlertSuccess(this.dataText.removeSuccess)

        this.db.removeUser(payload_.uid)
        .then(() => {

          loading.dismiss()
          this.reload()
        })        
      })    
  }

  addProfessional(){
    this.navCtrl.push('ProfessionalsAddPage')
  }  

  credit(payload_){
    this.navCtrl.push('CreditsManualPage', {payload: payload_})
  }

  disableUser(payload_){

    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantDisableUser)  
    alert.then((result) => {

      if(result){
        if(!this.dataInfo.isTest)
          this.inativate(payload_)
        
        else 
          this.uiUtils.showAlertError(this.dataText.accessDenied)                        
      }    

    })       
  }

  
  inativate(payload_){

    this.db.updateUserStatus(payload_.uid, 'Desativado')
    .then(() => {
      this.reload()
    })      

    

  }

  workerChanged(event){

    console.log(event)
    this.reload()

  }


  getDenuncias(){

    this.db.getAcquaintances()
    .subscribe((data) => {

        this. getDenunciasCallback(data)
      
    })

  }


  getDenunciasCallback(data){

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      console.log(info)

      this.checkDenuncia(info)
      
    });

  }

  checkDenuncia(info){

    this.usersWorkersArray.forEach(element => {

      
      if(info.uid === element.key){

        if(!element.denuncia)
          element.denuncia = 0

        element.denuncia++
      }
      
    });
  }

}
