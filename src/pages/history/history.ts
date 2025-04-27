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
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {

  private worksSubscription: Subscription;  

  works: Observable<any>;
  worksArray: any = []
  reportsArray: any = []
  usersWorkersArray: any = []
  clientsWorkersArray: any = []
  usersWorkers: any = []  
  client: any
  worker: any
  selectedDate: string
  selectedDateEnd: string  
    
  totalJobs: number = 0
  totalMoney: number = 0
  totalMoneyStr: string
  
  totalPrePaid: number = 0  
  totalPrePaidStr: string

  totalCard: number = 0  
  totalCardStr: string

  totalComission: number = 0  
  totalComissionStr: string  

  totalFinal: number = 0
  totalFinalStr: string  
  
  isReportOpen: Boolean = false
  textHeader: string = "Relatórios"
  
  tablePrice: any  
  status: string = "" 

  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public dataInfo: DataInfoProvider,    
    public db: DatabaseProvider,
    public platform: Platform,
    private iab: InAppBrowser,
    public dataText: DataTextProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {    
    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtrl.setRoot('LoginPage')
  }

  
  ngOnDestroy() {
   if(this.worksSubscription)
    this.worksSubscription.unsubscribe()
  }  

  startInterface(){

    this.isReportOpen = false
    this.status = "Finalizado"    
    let statustmp = this.navParams.get('status')

    if(statustmp)
      this.status = statustmp    
    
    this.tablePrice = this.dataInfo.tablePrice   

    this.selectedDateEnd = moment().format() 
    this.selectedDate = moment().startOf('month').format() 
    
    this.usersWorkers = []
    this.getWorkers()
    this.getClients()
  


  }

  getClients(){
    
    this.db.getClients()
    .subscribe(data => {
        this.getClientsCallback(data)
    })
  }

  getClientsCallback(data){

    this.clientsWorkersArray = []
    

    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key
      
      if(info.status !== 'Desativado')
        this.checkRegionClient(info)                                                          
              
    });

  }

  checkRegionClient(info){

    if(this.dataInfo.userInfo.isAdmin)
      this.clientsWorkersArray.push(info)
    
    if(this.dataInfo.userInfo.managerRegion)
      
      if(info.region === this.dataInfo.userInfo.managerRegion)
        this.clientsWorkersArray.push(info)          

    else 
      if(info.uid === this.dataInfo.userInfo.uid){
        this.clientsWorkersArray.push(info)                
      }

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
        this.checkRegionWorker(info)      
    });

  }



  

  checkRegionWorker(info){

    if(this.dataInfo.userInfo.isAdmin)
      this.usersWorkersArray.push(info)
    
    if(this.dataInfo.userInfo.managerRegion)
      
      if(info.region === this.dataInfo.userInfo.managerRegion)
        this.usersWorkersArray.push(info)          
  }


  workersChanged(event){    

    console.log('modificado')
    console.log(event)


    //this.get()
  }

  clientChange(event){    

    console.log('modificado: ')
    console.log(event.value.uid)

    // this.get()
  }

  clear(){    
    this.client = ""
    this.worker = ""
    this.status = "Todos"
   
    this.worksArray= []    
    this.reportsArray = []    

    this.clearMoney()
    
  }

  clearMoney(){
    this.totalMoney = 0
    this.totalComission = 0
    this.totalPrePaid = 0
    this.totalCard = 0
    this.totalFinal = 0   
    this.totalCardStr = "0.00"
    this.totalComissionStr = "0.00"
    this.totalFinalStr = "0.00"
    this.totalJobs = 0
    this.totalMoneyStr = "0.00"
    this.totalPrePaidStr = "0.00" 
  }

  showReport(){
    this.isReportOpen = true
    this.textHeader = "Relatórios"
    this.showReports()
  }


  showHistory(){   

    if(moment(this.selectedDate).isAfter(moment(this.selectedDateEnd)), 'days'){


      if(moment(this.selectedDate).diff(moment(this.selectedDateEnd)) > 30 )
        this.uiUtils.showAlertError("Limite de 30 dias excedido!")
      
      else         
          this.backHistory()                

    }

    else {
      this.uiUtils.showAlertError("Data final não pode ser anterior a data inicial")
    }
    
  }


  backHistory(){

    this.isReportOpen = false
    this.textHeader = "Histórico"
    this.getHistory()
  }

  getHistory(){


    let loading = this.uiUtils.showLoading(this.dataText.loading)
    loading.present()    

    this.clearMoney()
    this.totalJobs = 0    
    this.worksArray= []    
    this.reportsArray = []                  
    let totalm = moment(this.selectedDateEnd).diff(this.selectedDate, 'months')
    
    if(totalm > 0){

      loading.dismiss()    

      for (let index = 0; index < totalm; index++) {
      
        let tmp = this.selectedDate.replace("-03:00", "")    
        let dateYear = moment(tmp).add(index, 'month').format('YYYY')  
        let dateMonth = moment(tmp).add(index, 'month').format('MM')  
  
        this.workGet(dateMonth, dateYear)          
      }

    } else {

      loading.dismiss()    

      let tmp = this.selectedDate.replace("-03:00", "")    
      let dateYear = moment(tmp).format('YYYY')  
      let dateMonth = moment(tmp).format('MM')  
    
      this.workGet(dateMonth, dateYear)          



    }

    
  }  

  workGet(month, year){    

    let loading = this.uiUtils.showLoading(this.dataText.loading)
    loading.present()    

    this.works = this.db.getAllWorksAcceptedsDate(year, month)
      
    this.worksSubscription = this.works.subscribe( data => {
      this.worksCallback(data)      
      loading.dismiss()    
    })
  }

    
  worksCallback(data){   
    
    this.worksArray = []
    
    data.forEach(element => {

      let info = element.payload.val()
      info.key = element.payload.key       
      info.showIfood = false

      this.checkRegionJob(info)                              
    });    


    this.organizaFila()

  }


  checkRegionJob(info){

    if(this.dataInfo.userInfo.isAdmin){
      this.checkArray(info)
    }
          
    else if(this.dataInfo.userInfo.managerRegion){

      if(info.region === this.dataInfo.userInfo.managerRegion)
        this.checkArray(info)          

    }
    else {

      if(info.uid === this.dataInfo.userInfo.uid){
        this.checkArray(info)          
      }
    }            
  }
  

  checkArray(info){

    let same = moment(info.datetime).isBetween(moment(this.selectedDate).startOf('day'), moment(this.selectedDateEnd).endOf('day'), 'day') || 
                moment(info.datetime).isSame(moment(this.selectedDate), 'day') || 
                moment(info.datetime).isSame(moment(this.selectedDateEnd), 'day')



           
    if(same) {


      let cliente = ""
      let cliente1 = ""

      let profissional = ""
      let profissional1 = ""
      
      if(this.client){
        cliente = this.client.uid
      }
        

      if(info.uid){
        cliente1 = info.uid     
      }
        
             
      if(this.worker){
        profissional = this.worker.uid        
      }
        

      if(info.workerInfo && info.workerInfo.uid){
        profissional1 = info.workerInfo.uid

      }



                      
      if(cliente.length > 0 && profissional.length === 0){        

        if(cliente === cliente1){
          this.checkStatusAndAdd(info)
        }
        
      }
                    

      else if(profissional.length > 0 && cliente.length === 0){

        if(profissional === profissional1){
          this.checkStatusAndAdd(info)        
        }
        
      }
        


      else if(cliente.length > 0 && profissional.length > 0){        

        if(profissional === profissional1 && cliente === cliente1){          
          this.checkStatusAndAdd(info)         
        }
          

      }
              

      else if(cliente.length === 0 && profissional.length === 0){        
        this.checkStatusAndAdd(info) 
      }


    }
    
  }

  checkStatusAndAdd(info){

    if(this.status === "Todos")
      this.workAddArray(info)

    else if(this.status && this.status === info.status)
      this.workAddArray(info)
           
  }

  workAddArray(info){

    
    if(info.carInfo && info.status === 'Finalizado'){      

       

      if(info.carInfo.total){

        this.totalJobs++            
        

        if(isNaN(info.carInfo.total))
          info.carInfo.total = 0


        this.totalFinal += Number(info.carInfo.total)

        if(info.workComission){                
    
          if(isNaN(info.workComission))
            info.workComission = 0
  
          this.totalComission += Number(info.workComission)
  
          this.totalComissionStr =  this.totalComission.toFixed(2)                  
        }     


      }
        

      this.totalFinalStr =  this.totalFinal.toFixed(2)  

      if(info.carInfo.paymentMethod){

          if(info.carInfo.paymentMethod === "Dinheiro"){

            if(info.carInfo.total)
              this.totalMoney += Number(info.carInfo.total)

            this.totalMoneyStr =  this.totalMoney.toFixed(2)                  

          }

          if(info.carInfo.paymentMethod === "Faturado"){

            if(info.carInfo.total)
              this.totalPrePaid += Number(info.carInfo.total)


            this.totalPrePaidStr =  this.totalPrePaid.toFixed(2)                  
            
          }

          if(info.carInfo.paymentMethod === "Cartão"){
            
            if(info.carInfo.total)
              this.totalCard += Number(info.carInfo.total)


            this.totalCardStr =  this.totalCard.toFixed(2)                                
          }

      }

    }

    info.expand = false
    info.vencido = false  
    info.totalTimeWaiting = 0    
    info.totalRun = 0

    if(info.carInfo && info.carInfo.total)
      info.totalRun = Number(info.carInfo.total)

    let timeLimit = moment(info.datetime).add(15, 'minutes').format()
    
    if(info.status === 'Criado')
      info.vencido = moment().isBefore(timeLimit)        

    if(info.datetime){        
        info.datetime = moment(info.datetime).format("DD/MM/YYYY HH:mm:ss")
      }

    if(info.datetimeStart){      
      info.datetimeStart = moment(info.datetimeStart).format("DD/MM/YYYY HH:mm:ss")
    }

    if(info.datetimeFinish){      
      info.datetimeFinish = moment(info.datetimeFinish).format("DD/MM/YYYY HH:mm:ss")       
    }
        
    if(info.workComission){

      if(typeof(info.workComission) === 'number')
        info.workComission = info.workComission.toFixed(2)
      
      else 
        info.workComission = Number(info.workComission).toFixed(2)                    
    }                           

    if(info.dropPoints){

      info.dropPoints.forEach(element => {          


        if(element.arrived && element.datetimeEnd){

          if(moment(element.arrived).isValid() && moment(element.datetimeEnd).isValid()){

            element.totalWait = moment(element.datetimeEnd).diff(element.arrived, "minutes")

            if(element.totalWait === 0)        
              element.totalWait = moment(element.datetimeEnd).diff(element.arrived, "seconds") + " segundo(s)"
              
            else 
                element.totalWait = moment(element.datetimeEnd).diff(element.arrived, "minutes") + " minuto(s)"                      

            let minutes = moment(element.datetimeEnd).diff(element.arrived, "minutes")            
            info.totalTimeWaiting += minutes
                        

          }

          

        }

        this.tablePrice = info.tablePrice

        

        if(this.tablePrice){

          if(info.totalTimeWaiting && info.totalTimeWaiting > Number(this.tablePrice.workFreeMinutes)){

            let valueNow = Number(info.total)
            let totalTimeWaiting = ( Number(this.tablePrice.workMinuteValue) * info.totalTimeWaiting)
            totalTimeWaiting = Number(totalTimeWaiting.toFixed(2))
            valueNow += Number(totalTimeWaiting.toFixed(2))
  
            info.totalWaitMoney = Number(totalTimeWaiting.toFixed(2))
            info.totalWaitHowMuch = Number(this.tablePrice.workMinuteValue)
            info.total = valueNow.toFixed(2)                              
          } 
                    

        }
      
        if(info.status === 'Criado')
          info.vencido = moment().isBefore(timeLimit)   
      
        if(element.datetime){
          element.datetime = moment(element.datetime).format("DD/MM/YYYY HH:mm:ss")
        }
        
        if(element.datetimeEnd){
          element.datetimeEnd = moment(element.datetimeEnd).format("DD/MM/YYYY HH:mm:ss")
        }

        if(element.arrived){
          element.arrived = moment(element.arrived).format("DD/MM/YYYY HH:mm:ss")  
        }

                          
        
      });
    }

    if(info.totalWaitMoney)
      info.totalRun += Number(info.totalWaitMoney)

    this.worksArray.push(info)
  }

  organizaFila(){    
           
    this.worksArray.sort((a, b) => {

      let date1 = moment(a.datetime, "DD/MM/YYYY hh:mm:ss").format()
      let date2 = moment(b.datetime, "DD/MM/YYYY hh:mm:ss").format()
      
      let isBefore = moment(date1).isBefore(date2)      

      return isBefore ? 1 : -1;
      
    })

  }

  organizaFilaRelatorios(){    

    this.reportsArray.sort((a, b) => {

      let date1 = moment(a.datetime).format()
      let date2 = moment(b.datetime).format()
      
      let isBefore = moment(date1).isBefore(date2)      

      return isBefore ? 1 : -1;
      
    })
  }
  
  downloadExcel(){


    let alert = this.uiUtils.showConfirm(this.dataText.warning, "Deseja realizar o download via excel?")  
    alert.then((result) => {

      if(result){
        this.downloadExcelContinue()      
      }        
    })       
  }
  
  downloadExcelContinue(){

    let loading = this.uiUtils.showLoading(this.dataText.loading)
    loading.present()        

    this.db.addReport(
      this.selectedDate, 
          this.selectedDateEnd,       
          this.totalJobs, 
          this.totalComissionStr, 
          this.totalPrePaidStr, 
          this.totalCardStr, 
          this.totalMoneyStr, 
          this.totalFinalStr,
          this.client,
          this.worker)


    .then(() => {

      loading.dismiss()
      this.uiUtils.showAlertSuccess("Favor aguarde. Estamos processando seu relatório")
      this.showReports()
    })
  }

  showReports(){

    let loading = this.uiUtils.showLoading(this.dataText.loading)
    loading.present()
    
    this.db.getReports()
    .subscribe((data => {

      this.showReportsContinue(data)
      loading.dismiss()

    }))
  }


  showReportsContinue(data){

    this.reportsArray = []
    this.worksArray = []

    data.forEach(element => {

      let info = element.payload.val()

      info.key = element.payload.key
      info.data = moment(info.data).format("MM/YYYY")
      info.dataEnd = moment(info.dataEnd).format("DD/MM/YYYY")            
      info.datetimeStart = moment(info.datetimeStart).format("DD/MM/YYYY")
      info.datetimeEnd = moment(info.datetimeEnd).format("DD/MM/YYYY")
      
      this.reportsArray.push(info)
    });

    this.organizaFilaRelatorios()
    
  }
  
  expand(work){
    work.expand = !work.expand    
  }

  expandIfood(work){
    work.showIfood = !work.showIfood
  }

  open(data){        
    this.iab.create(data.url);
  }

  removeReport(report){

    console.log('Remover: ')
    console.log(report)


    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
    alert.then((result) => {

        if(result){

          this.db.removeReports(report.key)
          .then(() => {
  
            this.uiUtils.showAlertSuccess("Relatório removido com sucesso")
            this.showReports()


          })


        }

    })


    
  }
  
  openDirect(data){  
      
    let options = 'location=no';

    if(data.directLink){

      if(this.dataInfo.isWeb)
        this.iab.create(data.directLink, '_blank', options);    
      else 
        this.iab.create(encodeURI(data.directLink), '_system', options);

    }            
  }  

  get(){
    this.getHistory()
  }


  removeWork(work){
    let alert = this.uiUtils.showConfirm(this.dataText.warning, "Deseja realmente remover?")  
    alert.then((result) => {

      if(result)  
        this.removeWorkContinue(work)
    })  
  }

  removeWorkContinue(work){  

    this.db.removeWorkRequest(work.key)
    .then( () => {
        this.uiUtils.showAlert(this.dataText.warning, this.dataText.removeSuccess)
        this.get()
    })
  }  

  cancelWork(work){
    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantCancel)  
    alert.then((result) => {

      if(result)  
        this.cancelWorkContinue(work)
    })  
  }

  cancelWorkContinue(work){  

    let msg = "Cancelado pelo painel às " + moment().format("DD/MM/YYYY hh:mm:ss")

    this.db.cancelWork(work.key, msg)

    .then( () => {
        this.uiUtils.showAlert(this.dataText.warning, "Cancelado com sucesso!")
        this.get()
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

    this.db.changeStatus(work.key, "Finalizado")

    .then( () => {

        this.uiUtils.showAlert(this.dataText.warning, this.dataText.finishedSuccess)        
        this.get()
    })
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
        this.get()
    })
  }  



  edit(work){    
   this.navCtrl.push('SearchDeliveryPage', {payload: work})    
  }  
  

  recovery(work){

    this.db.getUserUid(work.uid)
    .subscribe((data) => {

      this.recoveryClientContinue(data, work)

    })

    if(work.workerInfo.uid){

      this.db.getUserUid(work.workerInfo.uid)      

      .subscribe((data1) => {
        this.recoveryWorkerContinue(data1, work)

      })

    }
       
  }

  recoveryClientContinue(data, work){

    data.forEach(element => {

      let info = element.payload.val()
      work.name = info.name
      
    });

    this.db.updateClientInfo(work.key, work.name)
    .then(() => {

      

    })


    this.uiUtils.showToast("Informações atualizadas com sucesso")
    
  }


  recoveryWorkerContinue(data, work){

    data.forEach(element => {

      let info = element.payload.val()
      work.workerInfo.name = info.name
      
    });


    this.db.updateWorkerInfo(work.key, work.workerInfo, work.driverUid)
    .then(() => {      

    })
  }
  


}
