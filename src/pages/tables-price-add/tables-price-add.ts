import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-tables-price-add',
  templateUrl: 'tables-price-add.html',
})
export class TablesPriceAddPage {

  services: Observable<any>;
  regions: Observable<any>;  

  payload: any
  tableType: any = "Cliente"

  key: string = ""
  name: string = ""
  description: string = ""
  
  valueStart: number = 0
  valueReturn: number = 0
  valuePoint: number = 0
  valueMeter: number = 0
  valueHeight: number = 0
  valueCubic: number = 0
  
  workComission: number = 0
  workComissionMoney: number = 0

  distanceValueType: string = "Fixo por KM"
  returnValueType: string = "Fixo por KM"

  workFreeMinutes: number = 0
  workFreeMeters: number = 0
  workFreePoints: number = 0
  workMinuteValue: number = 0

  public anArray:any=[];
  public anArray1:any=[];

  public returnArray:any=[];
  public returnArray1:any=[];

  usersWorkers: any
  clients: any
  clientsArray:any=[];


  region: string = ""
  regionsArray = []
  
  
  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public platform: Platform,
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,  
    public actionsheetCtrl: ActionSheetController,    
    public db: DatabaseProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtrl.setRoot('LoginPage')     

  }

  startInterface(){


    this.tableType = "Cliente"
    this.clear()  
    this.getRegions()
    this.loadValues()    

    this.reloadClients()

    if(this.dataInfo.isDev)
      this.dev()
  }

  dev(){

    this.name = "Nome " + moment().format("YYYYMMSShhmmss")
    this.description = "{{dataText.description}} " + moment().format("YYYYMMSShhmmss")
    this.valueStart = 10
    this.valuePoint = 1
    this.valueMeter = 1.40
    this.valueHeight = 0
    this.valueCubic = 0
    this.workComission = 10

    this.workFreeMinutes = 0
    this.workFreeMeters = 0
    this.workFreePoints= 0
    this.workMinuteValue = 0

  }

  loadValues(){
    this.payload = this.navParams.get('payload')     
    
    if(this.payload){      

      this.key = this.payload.key
      this.name = this.payload.name
      this.description = this.payload.description
      this.valueStart = this.payload.valueStart
      this.valuePoint = this.payload.valuePoint
      this.valueMeter = this.payload.valueMeter
      this.valueHeight = this.payload.valueHeight
      this.valueCubic = this.payload.valueCubic
      this.workComission = this.payload.workComission

      this.workFreeMinutes = this.payload.workFreeMinutes
      this.workFreeMeters = this.payload.workFreeMeters
      this.workFreePoints= this.payload.workFreePoints
      this.workMinuteValue = this.payload.workMinuteValue
     
      this.distanceValueType = this.payload.distanceValueType
      this.anArray = this.payload.anArray
      this.anArray1 = this.payload.anArray1
      
      this.returnValueType = this.payload.returnValueType
      this.returnArray = this.payload.returnArray
      this.returnArray1 = this.payload.returnArray1

      this.valueReturn = this.payload.valueReturn
      this.tableType = this.payload.type
      this.clients = this.payload.clientsArray

      if(this.payload.regiao)
        this.region = this.payload.regiao
      

    }    
    else {
      this.Add()
    }
       
  }

  clear(){
    this.key = ""
    this.name = ""
    this.description = ""
    this.valueStart = 0
    this.valuePoint = 0
    this.valueMeter = 0
    this.valueHeight = 0
    this.valueCubic = 0
    this.workComission = 0    
    this.region = ""
 }

  getRegions(){
    
    this.regions = this.db.getRegions()

    this.regions.subscribe(data => {
      this.getRegionsCallback(data)
    })
  }

  getRegionsCallback(data) {
    data.forEach(element => {
      const info = element.payload.val();
      info.key = element.payload.key;
  
      const isAdmin = this.dataInfo.userInfo.isAdmin;
      const isManagerRegion = info.regiao === this.dataInfo.userInfo.managerRegion;
  
      if (isAdmin || isManagerRegion) {
        this.regionsArray.push(info);
      }
    });
  }
  

  
  
  async checkValues() {
    try {
      // Check if name and description are provided
      if (!this.name) throw "Favor preencher o nome";
      if (!this.description) throw "Favor preencher a descrição";
  
      // Check if valueStart or valueMeter is provided
      if (!this.valueStart && !this.valueMeter && !this.anArray) {
        throw "Favor preencher o valor inicial ou valor por metro";
      }
  
      // Check if tableType is provided
      if (!this.tableType) throw "Favor preencher o tipo de tabela";
  
      // Check if region is provided when tableType is "Região"
      if (this.tableType === "Região" && !this.region) {
        throw "Favor selecionar a região";
      }
  
      // Set default values for optional fields
      this.workComission = this.workComission || 0;
      this.workComissionMoney = this.workComissionMoney || 0;
      this.valueHeight = this.valueHeight || 0;
      this.valuePoint = this.valuePoint || 0;
      this.valueReturn = this.valueReturn || 0;
      this.valueCubic = this.valueCubic || 0;
      this.workFreeMinutes = this.workFreeMinutes || 0;
      this.workFreeMeters = this.workFreeMeters || 0;
      this.workFreePoints = this.workFreePoints || 0;
      this.workMinuteValue = this.workMinuteValue || 0;
      this.distanceValueType = this.distanceValueType || "Fixo por KM";
      this.returnValueType = this.returnValueType || "Fixo por KM";
      this.anArray = this.anArray || [];
      this.anArray1 = this.anArray1 || [];
      this.returnArray = this.returnArray || [];
      this.returnArray1 = this.returnArray1 || [];
      this.clients = this.clients || [];
  
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  

  checkRegion(){

    if(!this.region)
      this.region = "Não informada"      

    if(this.dataInfo.userInfo.manager && this.dataInfo.userInfo.managerRegion){

      if(this.tableType === "Cliente" || this.tableType === "Profissional")
        this.region = this.dataInfo.userInfo.managerRegion          
    }
  }
  
  add(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present() 

    this.checkValues()
    .then(() => {      

      this.db.addTablesPrice(
        this.name, 
        this.description, 
        this.valueStart, 
        this.valueReturn,
        this.valuePoint, 
        this.valueMeter, 
        this.valueHeight, 
        this.valueCubic, 
        this.workComission,
        this.workComissionMoney,
        this.workFreeMinutes,
        this.workFreeMeters,
        this.workFreePoints,
        this.workMinuteValue,
        this.distanceValueType,
        this.anArray,
        this.anArray1,
        this.returnValueType,
        this.returnArray,
        this.returnArray1,
        this.clients,
        this.tableType,
        this.region)

      .then( () => {
        loading.dismiss() 
        this.uiUtils.showAlert(this.dataText.success, this.dataText.addedSuccess).present()
        this.navCtrl.pop()
      })

    })
    .catch((error => {
      loading.dismiss() 
      this.uiUtils.showAlertError(error)
    }))
    
  }

  save(){    
    
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present()     
        
    this.checkValues()
    .then(() => {

      
      this.db.updateTablesPrice(
        this.key, 
        this.name, 
        this.description, 
        this.valueStart, 
        this.valueReturn,
        this.valuePoint, 
        this.valueMeter, 
        this.valueHeight, 
        this.valueCubic,         
        this.workComission,
        this.workComissionMoney,
        this.workFreeMinutes,
        this.workFreeMeters,
        this.workFreePoints,
        this.workMinuteValue,                               
        this.distanceValueType,
        this.anArray,
        this.anArray1,
        this.returnValueType,
        this.returnArray,
        this.returnArray1,
        this.clients,
        this.tableType,
        this.region)

        .then( () => {
          loading.dismiss() 

          let msg = this.dataText.savedSuccess

          
          this.uiUtils.showAlert(this.dataText.success, msg).present()
          this.navCtrl.pop()
        })  
    })
    .catch((error => {
      loading.dismiss() 
      this.uiUtils.showAlertError(error)
    }))
        
  } 

  Add(){

    if(!this.anArray){
      this.anArray = []
    }

    this.anArray.push({'distance':''});
    this.Add1()
    
  }

  Add1(){

    if(!this.anArray1){
      this.anArray1 = []
    }

    this.anArray1.push({'distance':''});
  }
 
  remove(idx){         

    if(this.anArray){
      
      this.anArray.splice(idx);
      this.anArray1.splice(idx);
    }
    
  }


  removeArrayReturn(idx){

    if(this.returnArray){      
      this.returnArray.splice(idx);
      this.returnArray1.splice(idx);
    }
  }

  addArrayReturn(){

    if(!this.returnArray){
      this.returnArray = []
    }

    this.returnArray.push({'distance':''});
    this.addArrayReturn1()
    
  }
  

  addArrayReturn1(){

    if(!this.returnArray1){
      this.returnArray1 = []
    }

    this.returnArray1.push({'distance':''});
  }

  distanceValueTypeChanged(){

    if(!this.anArray){
      this.Add()
    }

  }

  returnValueTypeChanged(){

    if(!this.returnArray1){
      this.addArrayReturn()
    }

  }

  typeChanged(){
    console.log('Tipo de tabela modificado ', this.tableType)
  }

  clientChanged(event){

    console.log(event.value)
  }

  reloadClients(){
    let loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations)
    loading.present()

    this.usersWorkers = this.db.getClients()

    let sub = this.usersWorkers.subscribe(data => {

        sub.unsubscribe()
        this.reloadCallback(data)
        loading.dismiss()        
    });
  }

  reloadCallback(data){

    
    this.clientsArray = []

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key

      if(info.userType === 1){
        
        if(info.status !== 'Desativado' && info.status !== 'Removido')            
          this.clientsArray.push({name: info.name, uid:  info.uid})
      }              
    });    
    
  }

  

}
