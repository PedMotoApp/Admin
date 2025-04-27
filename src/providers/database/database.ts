import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import * as moment from 'moment';

@Injectable()
export class DatabaseProvider {
      
  db: any
  services: AngularFireList<any>;

  dateYear: string = ""
  dateMonth: string = ""

  constructor(afDatabase: AngularFireDatabase, 
    public dataInfo: DataInfoProvider,
    public authProvider: AuthProvider) {      
    
    this.db = afDatabase    
    this.dateYear = moment().format('YYYY')  
    this.dateMonth = moment().format('MM')      
  }  

  saveToken(currentToken: string){    
    if (!currentToken) return; 

    let uid = this.authProvider.currentUserUid()       
    return this.db.list("/userProfile/")
        .update(uid, {token: currentToken} )
  }  

  getAppConfig(){    
    
    let path = "/configurations/"  + this.dataInfo.defaultState + "/"
    
    return this.db.list(path)
      .snapshotChanges()            
  }

  getUser(){
    let uid = this.authProvider.currentUserUid()          
    let path = "/userProfile/" + "/"    
    

    console.log(path)

    return this.db.list(path, 
          ref => ref.orderByKey()
            .equalTo(uid))
            .snapshotChanges()            
  }

  getClients(){    
    let path = "/userProfile/" + "/"

    return this.db.list(path, 
          ref => ref.orderByChild("userType")
            .equalTo(1))
            .snapshotChanges()            
  }      

  getUserUid(uid){    

    let path = "/userProfile/" + "/"

    return this.db.list(path, 
          ref => ref.orderByChild("uid")
            .equalTo(uid))
            .snapshotChanges()            
  }    


  getManagers(){    
    let path = "/userProfile/" + "/"

    return this.db.list(path, 
          ref => ref.orderByChild("userType")
            .equalTo(3))
            .snapshotChanges()            
  }      
  

  updateIndication(uid_, indications_: number){    
    return this.db.list("/userProfile/")
    .update(uid_, { totalIndications: indications_ } ) 
  }

  rateAndCommentWork(key_: string, comment_: string, rate_: number){    
    let path = "/notificationsAll/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth          

    return this.db.list(path)
        .update(key_, {comment: comment_, rate: rate_, isRated: true, datetimeRated: moment().format()})
  } 

  addUserStartRegister(email_: string, type_: number, name_: string, state_: string){  

    let uid = this.authProvider.currentUser().uid   
    let path = "/userProfile/"

    let status = 'Perfil verificado'    
    let credits = 100
            
    return this.db.list(path)
      .update(uid, {

          email: email_, 
          userType: type_, 
          name: name_, 
          ranking: 'Bronze', 
          totalWorks: 0, 
          totalIndications: 0, 
          cpf: '',
          state: state_, 
          country: 'Brasil', 
          city: '', 
          street: '', 
          district: '', 
          postCode: '',
          number: '', 
          status: status, 
          totalDistance: 20000,
          credits: credits,            
          isPremium: false,
          isPrePaid: true
        })
  }

  addUserStart(
    uid_: string,
    razaoSocial_: string,
    nome_: string,
    sobrenome_: string,
    endereco_: string, 
    complemento_: string, 
    numero_: string, 
    cep_: string, 
    district_: string, 
    telefone_: string, 
    foto_: string,  
    email_: string,     
    tipo_: number, 
    description_: string, 
    bank_:string, 
    agency_: string, 
    account_: string, 
    cpf_: string,
    cnpj_: string,
    carName_: string,
    carPlate_: string,
    state_: string,
    city_: string,    
    prefixo_: string,
    tablePrice: string,
    ifoodClientId: string,
    ifoodClientSecret: string){

      let path = "/userProfile/"
    
      return this.db.list(path)

      .update(uid_, {
        uid: uid_,
        razaoSocial: razaoSocial_, 
        email: email_,
        name: nome_, 
        lastName: sobrenome_, 
        address: endereco_, 
        complement: complemento_, 
        numero: numero_,
        postCode: cep_,
        district: district_,
        userType: tipo_, 
        url: foto_,
        tel: telefone_, 
        description: description_,
        cpf: cpf_,
        cnpj: cnpj_,
        bank: bank_,
        agency: agency_,
        account: account_,
        carName: carName_,
        state: state_,
        city: city_,
        carPlate: carPlate_,
        prefixo: prefixo_,
        tablePrice: tablePrice,
        pathRequest: path,
        ranking: "Bronze",
        status: "Perfil verificado",
        ifoodClientId: ifoodClientId,
        ifoodClientSecret: ifoodClientSecret,
        datetime: moment().format()
      })                
  }

  addUserManager(
    uid_: string,
    razaoSocial_: string,
    nome_: string,
    sobrenome_: string,
    endereco_: string, 
    complemento_: string, 
    numero_: string, 
    cep_: string, 
    district_: string, 
    telefone_: string, 
    foto_: string,  
    email_: string,     
    tipo_: number, 
    description_: string, 
    bank_:string, 
    agency_: string, 
    account_: string, 
    cpf_: string,
    cnpj_: string,
    carName_: string,
    carPlate_: string,
    state_: string,
    city_: string,    
    prefixo_: string,
    tablePrice: string,
    ifoodClientId: string,
    ifoodClientSecret: string){

      let path = "/userProfile/"
    
      return this.db.list(path)

      .update(uid_, {
        uid: uid_,
        razaoSocial: razaoSocial_, 
        email: email_,
        name: nome_, 
        lastName: sobrenome_, 
        address: endereco_, 
        complement: complemento_, 
        numero: numero_,
        postCode: cep_,
        district: district_,
        userType: tipo_, 
        url: foto_,
        tel: telefone_, 
        description: description_,
        cpf: cpf_,
        cnpj: cnpj_,
        bank: bank_,
        agency: agency_,
        account: account_,
        carName: carName_,
        state: state_,
        city: city_,
        carPlate: carPlate_,
        prefixo: prefixo_,
        tablePrice: tablePrice,
        pathRequest: path,
        ranking: "Bronze",
        status: "Perfil verificado",
        ifoodClientId: ifoodClientId,
        ifoodClientSecret: ifoodClientSecret,
        datetime: moment().format(),
        manager: true
      })                
  }

  updateUserRegister(
    nome_: string, 
    sobrenome_: string,
    endereco_: string, 
    complemento_: string, 
    numero_: string, 
    cep_: string, 
    district_: string, 
    telefone_: string, 
    foto_: string,  
    latitude_: string, 
    longitude_: string, 
    tipo_: number, 
    description_: string, 
    bank_:string, 
    agency_: string, 
    account_: string, 
    cpf_: string,
    cnpj_: string,
    carName_: string,
    carPlate_: string,
    state_: string,
    city_: string,
    prefixo_: string,
    brand_: string,
    razaosocial_: string,
    pix_: string,
    clientType_: string,
    totalDistance_: string){

     let uid = this.authProvider.currentUser().uid      

      let path = "/userProfile/"

      return this.db.list(path)

      .update(uid, {
        name: nome_, 
        lastName: sobrenome_, 
        address: endereco_, 
        email: this.authProvider.currentUserEmail(), 
        uid: this.authProvider.currentUserUid(),
        complement: complemento_, 
        numero: numero_,
        postCode: cep_,
        district: district_,
        photo: foto_, 
        latitude: latitude_, 
        longitude: longitude_, 
        userType: tipo_, 
        tel: telefone_, 
        description: description_,
        cpf: cpf_,
        cnpj: cnpj_,
        bank: bank_,
        agency: agency_,
        account: account_,
        carName: carName_,
        pix: pix_,
        state: state_,
        city: city_,
        carPlate: carPlate_,
        prefixo: prefixo_,
        brand: brand_,
        razaoSocial: razaosocial_,
        clientType: clientType_,
        totalDistance: totalDistance_
      })                
  }
  

  updateUser(
    uid_: string, 
    razaoSocial_: string,
    nome_: string,
    sobrenome_: string,
    endereco_: string, 
    complemento_: string, 
    numero_: string, 
    cep_: string, 
    district_: string, 
    telefone_: string, 
    foto_: string,  
    latitude_: string, 
    longitude_: string, 
    tipo_: number, 
    description_: string, 
    bank_:string, 
    agency_: string, 
    account_: string, 
    cpf_: string,
    cnpj_: string,
    carName_: string,
    carPlate_: string,
    state_: string,
    city_: string,
    prefixo_: string,
    tablePrice: string,
    ifoodClientId: string,
    ifoodClientSecret: string,
    pix: string){

      let path = "/userProfile/" + this.dataInfo.defaultState
    
      return this.db.list(path)

      .update(uid_, {
        razaoSocial: razaoSocial_, 
        name: nome_, 
        lastName: sobrenome_, 
        address: endereco_, 
        uid: uid_,
        complement: complemento_, 
        numero: numero_,
        postCode: cep_,
        district: district_,
        userType: tipo_, 
        tel: telefone_, 
        description: description_,
        cpf: cpf_,
        cnpj: cnpj_,
        bank: bank_,
        agency: agency_,
        url: foto_,
        account: account_,
        carName: carName_,
        state: state_,
        city: city_,
        carPlate: carPlate_,
        prefixo: prefixo_,
        tablePrice: tablePrice,
        ifoodClientId: ifoodClientId,
        ifoodClientSecret: ifoodClientSecret
      })                
  }

  updateUserStatus(uid_, status_){
    return this.db.list("/userProfile/").update(uid_, { status: status_ })
  }

  updateUserCredit(uid_, credit_){
    return this.db.list("/userProfile/").update(uid_, { credits: credit_ })
  }


  getWorkers(){        
    let path = "/userProfile/" 

    return this.db.list(path, 
          ref => ref.orderByChild("userType")
            .equalTo(2))
            .snapshotChanges()            
  }  

  updateRankingUser(key_, ranking_){
    return this.db.list("/userProfile/")
          .update(key_, {ranking: ranking_} )          
  }

  updateProfileStatusUser(key_, status_){
    return this.db.list("/userProfile/")
        .update(key_, {status: status_} )          
  }  

  updatePrePaid(uid_, prePaid_: Boolean){          
    return this.db.list("/userProfile/")
    .update(uid_, { prePaid: prePaid_ } ) 
  }


  updateCanChangeFinalValue(uid_, isPremium_: Boolean){          
    return this.db.list("/userProfile/")
    .update(uid_, { isPremium: isPremium_ } ) 
  }



  updateManager(uid_, manager: Boolean){          
    return this.db.list("/userProfile/")
    .update(uid_, { manager: manager, userType: 3 } ) 
  }

  updateManagerRegion(uid_, region: string){          
    return this.db.list("/userProfile/")
    .update(uid_, { managerRegion: region } ) 
  }
    
  /*************
   * Works Requests
   ********************/

  addWorkRequest(
    service: any,
    fromAddress_: string, 
    toAddress_: string, 
    totalPoints: number, 
    reference_: string,     
    tokens_: string){ 

    let uid = this.authProvider.currentUser().uid
    let path = '/notificationsAll/'  +  this.dataInfo.defaultState + "/" + this.dateYear + "/" + this.dateMonth

    let ref = this.db.list(path)
    let body = this.dataInfo.userInfo
    
    body.carInfo = service
    body.fromAddress = fromAddress_
    body.toAddress = toAddress_
    body.uid = uid
    body.uidBusiness = uid
    body.appCreditWorkValue = this.dataInfo.appConfig.appCreditWorkValue
    body.tokens = tokens_
    body.agenda = ""
    body.totalPoints = totalPoints
    body.status = "Criado"    
    body.respostaPergunta = "Não informado"
    body.toReference = reference_
    body.paymentKey = "Não informado"
    body.paymentPath = "Não informado"
    body.paymentMethod = "Não informado"
    body.appOperation = "1"
    body.datetime = moment().format()  
    
    return ref.push(body)
  }  


  getWorksRequests(year, month){

    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  year + "/" + month
  
    return this.db.list(path, 
      ref => ref.orderByKey())
      .snapshotChanges()         
  }  
  
  getAllWorks(year, month){    
    let uid = this.authProvider.currentUser().uid
    let path = '/notificationsAll/' +  this.dataInfo.defaultState + "/" +  year + "/" + month
    
    return this.db.list(path, 
      ref => ref.orderByChild('uid')
      .equalTo(uid))
      .snapshotChanges()           
  } 


  getWorkIfood(orderId){    

    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth 
    
    return this.db.list(path, 

      ref => ref.orderByChild('ifoodOrderId')
      .equalTo(orderId))
      .snapshotChanges()  

  }

  
  getWorksRequestKey(key_){

    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth 
    
    return this.db.list(path, 
      ref => ref.orderByKey()
      .equalTo(key_))
      .snapshotChanges()  
  }  


  updateDropPoints(key_: string, points_: any){    
    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth     
    return this.db.list(path).update(key_, { dropPoints: points_ } ) 
  }



  updateDistanceInfo(key_, dropPointsResponsible_, dropPointsInstructions_,
       dropPointsFinalValue_, dropPointsFinalDistance_, dropPointsFinalDistanceMeters_, dropPointsFinalDuration_, workComission_, carInfo_, dropPoints, 
       workerInfo, driverUid){

    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth

    return this.db.list(path)
          .update(key_, {
            dropPoints: dropPoints,
            dropPointsResponsible: dropPointsResponsible_, 
            dropPointsInstructions: dropPointsInstructions_, 
            dropPointsFinalValue: dropPointsFinalValue_,
            dropPointsFinalDistance: dropPointsFinalDistance_, 
            dropPointsFinalDistanceMeters: dropPointsFinalDistanceMeters_,
            dropPointsFinalDuration: dropPointsFinalDuration_,
            workComission: workComission_,
            workerInfo: workerInfo,
            driverUid: driverUid,
            carInfo: carInfo_} )
  }


  addNotificationChange(key_: string, pointsOld_: any, pointsNew_: any, user_, token_){ 

    let path = '/notificationsChanged/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth     
    return this.db.list(path).push({ key: key_,  pointsOld: pointsOld_, pointsNew: pointsNew_, userInfo: user_, token: token_, datetime: moment().format()} ) 

  }

  updateWorkerInfo(key_: string, workerInfo_: any, driverUid_){        
    
    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth     
    return this.db.list(path).update(key_, { workerInfo: workerInfo_, driverUid: driverUid_ } ) 
  }

  updateClientInfo(key_: string, name_: any){    

    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth     
    return this.db.list(path).update(key_, { name: name_ } ) 
  }
  
  

  saveLatLong(lat: string, long: string){        
    
    if (!lat) return; 
   
    let uid = this.authProvider.currentUser().uid       

    return this.db.list("/userProfile/")
      .update(uid, {latitude: lat, longitude: long} )
  }
  


  /******************
   * SCHEDULES
   **********************/


  getWorksSchedules(year, month){

    let path = '/notificationsDelivery/'+ this.dataInfo.defaultState + "/" +  year + "/" + month    
    console.log('path', path)

    return this.db.list(path, 
      ref => ref.orderByKey())
      .snapshotChanges()         
  }  


  /**************
   * Works accepteds
   ********************/

  getAllWorksAccepteds(){        

    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth

    return this.db.list(path, 
      ref => ref.orderByKey())
      .snapshotChanges()  
  }

  getAllWorksAcceptedsDate(year, month){  
    
    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  year + "/" + month
    console.log(path)

    return this.db.list(path, 
      ref => ref.orderByKey())
      .snapshotChanges()     
  } 

  removeWorkRequest(key_){
    let path = "/notificationsAll/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    return this.db.list(path).remove(key_) 
  }

  removeWorkDeliveryRequest(key_){
    let path = "/notificationsDelivery/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    console.log(path)

    return this.db.list(path).remove(key_) 
  }

  removeAllWorksAccepteds(){
    return this.db.list("/notificationsAll/").remove() 
  }

  addWorkAccept(workerInfo_: string, clientInfo_){   
            
    let path = '/notificationsAll/'+ this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    console.log(path)
    
    let ref = this.db.list(path)

    return ref.push({        
        uid: this.authProvider.currentUserUid(), 
        workerInfo: workerInfo_, 
        clientInfo: clientInfo_, 
        appOperation: 1,
        status: 'Aceito'})
  }    


  changeStatus(key_: string, status_: string){
    let path = "/notificationsAll/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    return this.db.list(path).update(key_, {status: status_})
  } 

  restartWork(work_: any){
        
    let path = "/notificationsAll/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    
    if(work_.dropPoints){


      work_.datetime = moment().format()

      
      work_.dropPoints.forEach(element => {

        element.status = "Aguardando"

        if(element.arrived)
          element.arrived = ""
        
        if(element.datetimeEnd)
          element.datetimeEnd = ""        

        if(element.msg)
          element.msg = ""
        
      });
    }        

    
    return this.db.list(path).update(work_.key, {status: "Criado",  datetimeOld: work_.datetime, datetime: moment().format(), datetimeAccepted: "",    
              datetimeFinish: "", datetimeCancel: "", datetimeProfessionalAccepted: "",  datetimeStart: "", driverUid: "", dropPoints: work_.dropPoints })
  } 


  /********************
   * Services
   *********************/

  getAllServices(){

    return this.db.list("/services/", 
        ref => ref.orderByKey())
        .snapshotChanges()             
  }

  addService(name_: string, value_: number, url_: string, valueMeter_: number, state_: string, type_: string){
    
    return this.db.list("/services/").push({name: name_, value: value_, valueMeter: valueMeter_, url: url_, state: state_, type: type_})
  }

  updateService(key_: string, name_: string, value_: number, url_: string, valueMeter_: number, state_: string, type_: string){    
    return this.db.list("/services/").update(key_, {name: name_, value: value_, valueMeter: valueMeter_, url: url_, state: state_, type: type_} )   
  }  
  
 removeService(key_: string){
    return this.db.list("/services/").remove(key_)
  } 

   /********************
   * Tables prices
   *********************/

  getAllTablesPrice(){

    let path = "/tablesPrice/" + this.dataInfo.defaultState

    return this.db.list(path, 
        ref => ref.orderByKey())
        .snapshotChanges()             
  }

  addTablesPrice(
    name_: string, 
    description_: string, 
    valueStart_: number, 
    valueReturn_: number, 
    valuePoint_: number, 
    valueMeter_: number, 
    valueHeight_: number, 
    valueCubic_: number,     
    workComission_: number,
    workComissionMoney_: number,
    workFreeMinutes_: number,
    workFreeMeters_: number,
    workFreePoints_: number,
    workMinuteValue_: number,
    distanceValueType_: string,
    anArray_: any,
    anArray1_: any,
    returnValueType_: any,
    returnArray_: any,
    returnArray1_: any,
    clientsArray_: any,
    type_: any,
    regiao: string){

    let path = "/tablesPrice/" + this.dataInfo.defaultState    

    return this.db.list(path).push({
        type: type_,
        name: name_, 
        description: description_, 
        valueStart: valueStart_, 
        valueReturn: valueReturn_,
        valuePoint: valuePoint_, 
        valueMeter: valueMeter_, 
        valueHeight: valueHeight_, 
        valueCubic: valueCubic_, 
        workComissionMoney_: workComissionMoney_,
        workComission: workComission_,
        workFreeMinutes: workFreeMinutes_,
        workFreeMeters: workFreeMeters_,
        workMinuteValue: workMinuteValue_,
        workFreePoints: workFreePoints_,
        distanceValueType: distanceValueType_,
        anArray: anArray_,
        anArray1: anArray1_,
        returnValueType: returnValueType_,
        returnArray: returnArray_,
        returnArray1: returnArray1_,
        clientsArray: clientsArray_,
        regiao: regiao
      })
  }

  updateTablesPrice(
    key_: string, 
    name_: string, 
    description_: string, 
    valueStart_: number, 
    valueReturn_: number,
    valuePoint_: number, 
    valueMeter_: number, 
    valueHeight_: number, 
    valueCubic_: number, 
    workComission_: number,
    workComissionMoney_: number,
    workFreeMinutes_: number,
    workFreeMeters_: number,
    workFreePoints_: number,
    workMinuteValue_: number,    
    distanceValueType_: string,
    anArray_: any,
    anArray1_: any,
    returnValueType_: any,
    returnArray_: any,
    returnArray1_: any,
    clientsArray_: any,
    type_: any,
    regiao: string){          
      
      let path = "/tablesPrice/" + this.dataInfo.defaultState

      return this.db.list(path).update(key_, {        
        type: type_,
        name: name_, 
        description: description_, 
        valueStart: valueStart_, 
        valueReturn: valueReturn_,
        valuePoint: valuePoint_, 
        valueMeter: valueMeter_, 
        valueHeight: valueHeight_, 
        valueCubic: valueCubic_, 
        workComission: workComission_,
        workComissionMoney: workComissionMoney_,
        workFreeMinutes: workFreeMinutes_,
        workFreeMeters: workFreeMeters_,
        workFreePoints: workFreePoints_,
        workMinuteValue: workMinuteValue_,
        anArray: anArray_,
        anArray1: anArray1_,
        clientsArray: clientsArray_,
        distanceValueType: distanceValueType_,
        returnValueType: returnValueType_,
        returnArray: returnArray_,
        returnArray1: returnArray1_,
        regiao})   
  }
  
 removeTablesPrice(key_: string){
    return this.db.list("/tablesPrice/" + this.dataInfo.defaultState ).remove(key_)
  } 
  

  /***************
   * SETTINGS
   ******************/

  getAllSettings(){

    let path = "/configurations/" + this.dataInfo.defaultState 
    
    return this.db.list(path, 
        ref => ref.orderByKey())
        .snapshotChanges()             
  }
  
  addSetting(value_: any){
    let path = "/configurations/" + this.dataInfo.defaultState     
    return this.db.list(path).push(value_)
  }

  updateSetting(key_: string, value_: any){
    let path = "/configurations/" + this.dataInfo.defaultState 
    return this.db.list(path).update(key_, value_ )   
  }
  

  /***************
   * NOTIFICATIONS
   ******************/  
  
  addNotification(title_: string, msg_: string, uid_: string){
    let path = "/notifications/" + this.dataInfo.defaultState     
    return this.db.list(path).push({title: title_, msg: msg_, uid: uid_})
  }  

  /***************
   * STATES AND CITIES
   ******************/  

  addState(name_: string, uf_: string){
    let path = "/states/"       
    return this.db.list(path).push({name: name_, uf: uf_})
  }  

  addCity(name_: string, uf_: string){
    let path = "/cities/"
    return this.db.list(path).push({name: name_, uf: uf_})
  }  

    /****************
   * REPORTS
   **********************/



    
  addReport(data_, dataEnd_, totalJobs, totalComissionStr, totalPrePaidStr, totalCardStr, totalMoneyStr, totalFinalStr, clients = {}, professionals = {}){ 

    let path = this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    let ref = this.db.list('/reportsAdmin/'+ path)
    let dateToday = moment().format('DD/MM/YYYY HH:mm:ss')

    console.log(clients, professionals)


    
    return ref.push({
      uid: this.authProvider.currentUserUid(), 
      data: data_, 
      dataEnd: dataEnd_,   
      state: this.dataInfo.defaultState,   
      statusReport: 'Processando',      
      datetime: dateToday,      
      totalJobs: totalJobs,
      totalComissionStr: totalComissionStr,
      totalPrePaidStr: totalPrePaidStr,
      totalCardStr: totalCardStr,
      totalMoneyStr: totalMoneyStr,
      totalFinalStr: totalFinalStr,
      clients: clients,
      professionals: professionals
    })
  }

  removeReports(key_: string){

    let path = this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    let ref = this.db.list('/reportsAdmin/'+ path)

    
    return ref.remove(key_)
  } 

  getReports(){    

    let path = this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    console.log(path)

    let uid = this.authProvider.currentUserUid()

    return this.db.list("/reportsAdmin/" + path, 
      ref => ref.orderByChild('uid')
      .startAt(uid)
      .endAt(uid + "\uf8ff"))
      .snapshotChanges()        
  }


  getUserInfo(uid){    

    return this.db.list("/userProfile/" , 
          ref => ref.orderByKey()
            .equalTo(uid))
            .snapshotChanges()            
  }

  getUserName(name){    

    let path = "/userProfile/"

     return this.db.list(path, 
      ref => ref.orderByChild('name')
      .startAt(name)
      .endAt(name + "\uf8ff"))
      .snapshotChanges()            
  }

  getWorkAccept(key_: string){
    
    let path = "/notificationsAll/" +  this.dateYear + "/" + this.dateMonth          

    return this.db.list(path, 
      ref => ref.orderByKey()
      .equalTo(key_))
      .snapshotChanges()  
  }  


  startWork(key_: string, msg_: string){    
    let path = "/notificationsAll/" +  this.dateYear + "/" + this.dateMonth          

    return this.db.list(path)
        .update(key_, {status: "Iniciado", msg: msg_, datetimeStart: moment().format()})
  }
  

  cancelWork(key_: string, msg_: string){        
    let path = "/notificationsAll/" +  this.dateYear + "/" + this.dateMonth          

    return this.db.list(path)
        .update(key_, {status: "Cancelado", msgCancel: msg_, datetimeCancel: moment().format()})
  } 
  
  finishWork(key_: string, msg_: string){    
    let path = "/notificationsAll/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth          

    return this.db.list(path)
        .update(key_, {status: "Finalizado", msgFinish: msg_, datetimeFinish: moment().format()})
  }

  updateTotalWorks(uid_, totalWorks_: number){   
    let path = "/userProfile/"    

    return this.db.list(path)
      .update(uid_, { totalWorks: totalWorks_ } ) 
  }  

  removeUser(uid_){   
    let path = "/userProfile/" + '/' + uid_
    return this.db.list(path).remove()
      
  }  

  changeDropPointStatusDelivery(key_: string, msg_: string, dropPoints_: any){    
    let path = "/notificationsAll/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth          

    return this.db.list(path)
        .update(key_, {msg: msg_, dropPoints: dropPoints_})
  } 
  
  getServices(){
    return  this.db.list('/services/').snapshotChanges()       
  }

  /** ********
    * TABLES PRICE
    **********/

   getTablesPrice(){    

    let path = '/tablesPrice/' 
    console.log(path)   

    return this.db.list(path, 
          ref => ref.orderByChild('selectedServiceType')
          
            .equalTo('Cliente'))
            .snapshotChanges()
  } 

   /***************
   * PAGAMENTOS CREDITS
   ****************/

  addPaymentCredits(data_){ 

    let path = this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth
    let ref = this.db.list('/paymentsCredits/'+ path)
    let dateToday = moment().format('DD/MM/YYYY HH:mm:ss')

    return ref.push({
      uid: this.authProvider.currentUserUid(), 
      data: data_,       
      status: this.dataInfo.titlePaymentOk, 
      datetime: dateToday})
  }
  
  getPaymentsCredits(year_: string, month_: string){
    
    let uid = this.authProvider.currentUser().uid
    let path = '/paymentsCredits/' + this.dataInfo.defaultState + "/" +  year_ + "/" + month_

    return this.db.list(path, 
      ref => ref.orderByChild('uid')
      .startAt(uid)
      .endAt(uid + "\uf8ff"))
      .snapshotChanges()  
  }

  updateUserCredits(credits_: any){
    let uid = this.authProvider.currentUser().uid       
    let path = "/userProfile/"
    return this.db.list(path).update(uid, { credits: credits_ } ) 
  }

  /**
   * SISTEMA  
   */

  addMessage(msg_: string){

    let path = "/messages/" + this.dataInfo.defaultState + "/" +  this.dateYear + "/" + this.dateMonth 
    let ref = this.db.list(path)
  
    let body = {msg: msg_, title: "Solicitação de suporte", datetime: moment().format()}
    return ref.push(body)
   }


   /********************
   * Car brands
   *********************/

  getBrands(){

    return this.db.list("/carBrands/", 
        ref => ref.orderByKey())
        .snapshotChanges()             
  }

  addBrands(name_: string, description_: string, url_: string, models_: string){
    return this.db.list("/carBrands/").push({name: name_, description: description_, models: models_, url: url_})
  }

  updateBrands(key_: string, name_: string, description_: string, url_: string, models_: string){    
    return this.db.list("/carBrands/").update(key_, {name: name_, description: description_, models: models_, url: url_} )   
  }  
  
 removeBrands(key_: string){
    return this.db.list("/carBrands/").remove(key_)
  } 


  /** IFOOD */

  addIfoodVerification(uid_, data){        
    return this.db.list("/userProfile/").update(uid_, { ifood: data } ) 
  }

  addIfoodEvent(data){        
    
    data.uid = this.authProvider.currentUser().uid    
    return this.db.list("/ifood/"  + this.dataInfo.defaultState).push(data) 
  }
  

  getOrdersIfood(){

    return this.db.list("/ifood/", 
        ref => ref.orderByKey())
        .snapshotChanges()             
  }


  getOrdersIfoodByUid(){

    let uid = this.authProvider.currentUser().uid

    return this.db.list("/ifood/", 
        ref => ref.orderByChild('uid')
        .startAt(uid)
        .endAt(uid + "\uf8ff"))
  }
  

  updateIfoodOrder(key_: string){    
    return this.db.list("/ifood/").update(key_, {actionOk: true, datetimeChanged: moment().format()} )   
  }  



  /** ON PEDIDOS */
  
  getOrdersOnPedido(){        
    let path = '/onPedido/'  +  this.dataInfo.defaultState + "/" + this.dateYear + "/" + this.dateMonth

    return this.db.list(path, 
        ref => ref.orderByKey())
          .snapshotChanges()          
  }  


  updateOnPedidoOrder(key_: string, status){ 
    let path = '/onPedido/'  +  this.dataInfo.defaultState + "/" + this.dateYear + "/" + this.dateMonth   
    return this.db.list( path).update(key_, {'/pedido/0/pedido/0/info/0/status-pedido/0/texto': status})   
  }  

  updateOnPedidoKey(key_: string, keyy){ 
    let path = '/onPedido/'  +  this.dataInfo.defaultState + "/" + this.dateYear + "/" + this.dateMonth   
    return this.db.list( path).update(key_, {serviceKey: keyy})   
  }  


  /** REGIÕES */

    getRegions(){

      let path = "/regions/" + this.dataInfo.defaultState
      console.log(path)
  
      return this.db.list(path, 
          ref => ref.orderByKey())
          .snapshotChanges()             
    }


    removeRegion(key_: string){
      return this.db.list("/regions/" + this.dataInfo.defaultState ).remove(key_)
    } 


    addRegion(
      name_: string, 
      description_: string){
  
      let path = "/regions/" + this.dataInfo.defaultState    
  
      return this.db.list(path).push({
          name: name_, 
          description: description_
        })
    }



 /** DENUNCIAS */
  
  getAcquaintances(){        
    let path = '/acquaintances/' 

    return this.db.list(path, 
        ref => ref.orderByKey())
          .snapshotChanges()          
  }  

}