import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

@Injectable()
export class DatabaseProvider {
  db: any;
  services: AngularFireList<any>;

  constructor(
    afDatabase: AngularFireDatabase,
    public dataInfo: DataInfoProvider,
    public authProvider: AuthProvider
  ) {
    this.db = afDatabase;
  }

  saveToken(currentToken: string): Promise<void> {
    if (!currentToken) return Promise.resolve();

    let uid = this.authProvider.currentUserUid();
    return this.db.list('/userProfile/').update(uid, { token: currentToken });
  }

  getAppConfig(): Observable<any> {
    let path = `/configurations/${this.dataInfo.defaultState}/`;
    return this.db.list(path).snapshotChanges();
  }

  getUser(): Observable<any> {
    let uid = this.authProvider.currentUserUid();
    let path = '/userProfile/';
    return this.db.list(path, ref => ref.orderByKey().equalTo(uid)).snapshotChanges();
  }

  getClients(): Observable<any> {
    let path = '/userProfile/';
    return this.db.list(path, ref => ref.orderByChild('userType').equalTo(1)).snapshotChanges();
  }

  getUserUid(uid: string): Observable<any> {
    let path = '/userProfile/';
    return this.db.list(path, ref => ref.orderByChild('uid').equalTo(uid)).snapshotChanges();
  }

  getManagers(): Observable<any> {
    let path = '/userProfile/';
    return this.db.list(path, ref => ref.orderByChild('userType').equalTo(3)).snapshotChanges();
  }

  updateIndication(uid_: string, indications_: number): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { totalIndications: indications_ });
  }

  rateAndCommentWork(key_: string, comment_: string, rate_: number): Promise<void> {
    let path = `/notificationsAll/${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    return this.db.list(path).update(key_, { comment: comment_, rate: rate_, isRated: true, datetimeRated: moment().format() });
  }

  addUserStartRegister(email_: string, type_: number, name_: string, state_: string): Promise<void> {
    let uid = this.authProvider.currentUser().uid;
    let path = '/userProfile/';
    let status = 'Perfil verificado';
    let credits = 100;

    return this.db.list(path).update(uid, {
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
    });
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
    bank_: string,
    agency_: string,
    account_: string,
    cpf_: string,
    cnpj_: string,        
    state_: string,
    city_: string,    
    tablePrice: string,    
  ): Promise<void> {
    let path = '/userProfile/';
    return this.db.list(path).update(uid_, {
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
      state: state_,
      city: city_,      
      tablePrice: tablePrice,
      pathRequest: path,
      ranking: 'Bronze',
      status: 'Perfil verificado'
    });
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
    bank_: string,
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
    ifoodClientSecret: string
  ): Promise<void> {
    let path = '/userProfile/';
    return this.db.list(path).update(uid_, {
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
      ranking: 'Bronze',
      status: 'Perfil verificado',
      ifoodClientId: ifoodClientId,
      ifoodClientSecret: ifoodClientSecret,
      datetime: moment().format(),
      manager: true
    });
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
    bank_: string,
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
    totalDistance_: string
  ): Promise<void> {
    let uid = this.authProvider.currentUser().uid;
    let path = '/userProfile/';
    return this.db.list(path).update(uid, {
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
    });
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
    latitude_: number,
    longitude_: number,
    tipo_: number,
    description_: string,
    bank_: string,
    agency_: string,
    account_: string,
    cpf_: string,
    cnpj_: string,    
    state_: string,
    city_: string,    
    tablePrice: string    
  ): Promise<void> {
    let path = `/userProfile/`;
    return this.db.list(path).update(uid_, {
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
      state: state_,
      city: city_,            
      tablePrice: tablePrice,      
    });
  }

  updateUserStatus(uid_: string, status_: string): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { status: status_ });
  }

  updateUserCredit(uid_: string, credit_: number): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { credits: credit_ });
  }

  getWorkers(): Observable<any> {
    let path = '/userProfile/';
    return this.db.list(path, ref => ref.orderByChild('userType').equalTo(2)).snapshotChanges();
  }

  updateRankingUser(key_: string, ranking_: string): Promise<void> {
    return this.db.list('/userProfile/').update(key_, { ranking: ranking_ });
  }

  updateProfileStatusUser(key_: string, status_: string): Promise<void> {
    return this.db.list('/userProfile/').update(key_, { status: status_ });
  }

  updatePrePaid(uid_: string, prePaid_: boolean): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { prePaid: prePaid_ });
  }

  updateCanChangeFinalValue(uid_: string, isPremium_: boolean): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { isPremium: isPremium_ });
  }

  updateManager(uid_: string, manager: boolean): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { manager: manager, userType: 3 });
  }

  updateManagerRegion(uid_: string, region: string): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { managerRegion: region });
  }

  addWorkRequest(
    service: any,
    fromAddress_: string,
    toAddress_: string,
    totalPoints: number,
    reference_: string,
    tokens_: string
  ): Promise<any> {
    let uid = this.authProvider.currentUser().uid;
    let path = '/orders/';
    let ref = this.db.list(path);
    let body = this.dataInfo.userInfo;

    body.carInfo = service;
    body.fromAddress = fromAddress_;
    body.toAddress = toAddress_;
    body.uid = uid;
    body.uidBusiness = uid;
    body.appCreditWorkValue = this.dataInfo.appConfig.appCreditWorkValue;
    body.tokens = tokens_;
    body.agenda = '';
    body.totalPoints = totalPoints;
    body.status = 'Criado';
    body.respostaPergunta = 'Não informado';
    body.toReference = reference_;
    body.paymentKey = 'Não informado';
    body.paymentPath = 'Não informado';
    body.paymentMethod = 'Não informado';
    body.appOperation = '1';
    body.datetime = moment().format();

    return ref.push(body);
  }

  getWorksRequests(year: string, month: string): Observable<any> {
    let path = '/orders/';
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  getAllWorks(year: string, month: string): Observable<any> {
    let uid = this.authProvider.currentUser().uid;
    let path = '/orders/';
    return this.db.list(path, ref => ref.orderByChild('uid').equalTo(uid)).snapshotChanges();
  }

  getWorkIfood(orderId: string): Observable<any> {
    let path = '/orders/';
    return this.db.list(path, ref => ref.orderByChild('ifoodOrderId').equalTo(orderId)).snapshotChanges();
  }

  getWorksRequestKey(key_: string): Observable<any> {
    let path = '/orders/';
    return this.db.list(path, ref => ref.orderByKey().equalTo(key_)).snapshotChanges();
  }

  updateDropPoints(key_: string, points_: any): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { dropPoints: points_ });
  }

  updateDistanceInfo(
    key_: string,
    dropPointsResponsible_: string,
    dropPointsInstructions_: string,
    dropPointsFinalValue_: string,
    dropPointsFinalDistance_: string,
    dropPointsFinalDistanceMeters_: string,
    dropPointsFinalDuration_: string,
    workComission_: number,
    carInfo_: any,
    dropPoints: any,
    workerInfo: any,
    driverUid: string
  ): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, {
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
      carInfo: carInfo_
    });
  }

  addNotificationChange(key_: string, pointsOld_: any, pointsNew_: any, user_: any, token_: string): Promise<void> {
    let path = `/notificationsChanged/${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    return this.db.list(path).push({
      key: key_,
      pointsOld: pointsOld_,
      pointsNew: pointsNew_,
      userInfo: user_,
      token: token_,
      datetime: moment().format()
    });
  }

  updateWorkerInfo(key_: string, workerInfo_: any, driverUid_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { workerInfo: workerInfo_, driverUid: driverUid_ });
  }

  updateClientInfo(key_: string, name_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { name: name_ });
  }

  saveLatLong(lat: string, long: string): Promise<void> {
    if (!lat) return Promise.resolve();

    let uid = this.authProvider.currentUser().uid;
    return this.db.list('/userProfile/').update(uid, { latitude: lat, longitude: long, lastDatetime: moment().format() });
  }

  getWorksSchedules(year: string, month: string): Observable<any> {
    let path = `/notificationsDelivery/${this.dataInfo.defaultState}/${year}/${month}`;
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  getAllWorksAccepteds(): Observable<any> {
    let path = '/orderHistory/';
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  getAllWorksAcceptedsDate(): Observable<any> {
    let path = '/orderHistory/';
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  removeWorkRequest(key_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).remove(key_);
  }

  removeAllWorksAccepteds(): Promise<void> {
    return this.db.list('/orders/').remove();
  }

  addWorkAccept(workerInfo_: string, clientInfo_: any): Promise<any> {
    let path = '/orders/';
    let ref = this.db.list(path);
    return ref.push({
      uid: this.authProvider.currentUserUid(),
      workerInfo: workerInfo_,
      clientInfo: clientInfo_,
      appOperation: 1,
      status: 'Aceito'
    });
  }

  changeStatus(key_: string, status_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { status: status_ });
  }

  restartWork(work_: any): Promise<void> {
    let path = '/orders/';

    if (work_.dropPoints) {
      work_.datetime = moment().format();
      work_.dropPoints.forEach(element => {
        element.status = 'Aguardando';
        if (element.arrived) element.arrived = '';
        if (element.datetimeEnd) element.datetimeEnd = '';
        if (element.msg) element.msg = '';
      });
    }

    return this.db.list(path).update(work_.key, {
      status: 'Criado',
      datetimeOld: work_.datetime,
      datetime: moment().format(),
      datetimeAccepted: '',
      datetimeFinish: '',
      datetimeCancel: '',
      datetimeProfessionalAccepted: '',
      datetimeStart: '',
      driverUid: '',
      dropPoints: work_.dropPoints
    });
  }

  getAllServices(): Observable<any> {
    return this.db.list('/services/', ref => ref.orderByKey()).snapshotChanges();
  }

  addService(name_: string, value_: number, url_: string, valueMeter_: number, state_: string, type_: string): Promise<void> {
    return this.db.list('/services/').push({ name: name_, value: value_, valueMeter: valueMeter_, url: url_, state: state_, type: type_ });
  }

  updateService(key_: string, name_: string, value_: number, url_: string, valueMeter_: number, state_: string, type_: string): Promise<void> {
    return this.db.list('/services/').update(key_, { name: name_, value: value_, valueMeter: valueMeter_, url: url_, state: state_, type: type_ });
  }

  removeService(key_: string): Promise<void> {
    return this.db.list('/services/').remove(key_);
  }

  getAllTablesPrice(): Observable<any> {
    let path = `/priceTables/${this.dataInfo.defaultState}`;
    return this.db.list(path, ref => ref.orderByChild('region')).snapshotChanges();
  }

  addTablesPrice(
    name_: string,
    description_: string,
    valueStart_: number,
    valuePerKm_: number,
    valueReturn_: number,
    region_: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!name_) return reject(new Error('Nome é obrigatório'));
      if (!description_) return reject(new Error('Descrição é obrigatória'));
      if (valueStart_ === undefined || valueStart_ === null) return reject(new Error('Preço base é obrigatório'));
      if (valuePerKm_ === undefined || valuePerKm_ === null) return reject(new Error('Valor por km é obrigatório'));

      const region = region_ || 'Todas';
      const valueReturn = valueReturn_ || 0;

      const table = {
        name: name_,
        description: description_,
        valueStart: Number(valueStart_),
        valuePerKm: Number(valuePerKm_),
        valueReturn: Number(valueReturn),
        region: region,
        createdAt: moment().format()
      };

      let path = `/priceTables/${this.dataInfo.defaultState}`;
      this.db.list(path).push(table)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  updateTablesPrice(
    key_: string,
    name_: string,
    description_: string,
    valueStart_: number,
    valuePerKm_: number,
    valueReturn_: number,
    region_: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!name_) return reject(new Error('Nome é obrigatório'));
      if (!description_) return reject(new Error('Descrição é obrigatória'));
      if (valueStart_ === undefined || valueStart_ === null) return reject(new Error('Preço base é obrigatório'));
      if (valuePerKm_ === undefined || valuePerKm_ === null) return reject(new Error('Valor por km é obrigatório'));

      const region = region_ || 'Todas';
      const valueReturn = valueReturn_ || 0;

      const table = {
        name: name_,
        description: description_,
        valueStart: Number(valueStart_),
        valuePerKm: Number(valuePerKm_),
        valueReturn: Number(valueReturn),
        region: region
      };

      let path = `/priceTables/${this.dataInfo.defaultState}`;
      this.db.list(path).update(key_, table)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  removeTablesPrice(key_: string): Promise<void> {
    let path = `/priceTables/${this.dataInfo.defaultState}`;
    return this.db.list(path).remove(key_);
  }

  getAllSettings(): Observable<any> {
    let path = `/configurations/${this.dataInfo.defaultState}`;
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  addSetting(value_: any): Promise<void> {
    let path = `/configurations/${this.dataInfo.defaultState}`;
    return this.db.list(path).push(value_);
  }

  updateSetting(key_: string, value_: any): Promise<void> {
    let path = `/configurations/${this.dataInfo.defaultState}`;
    return this.db.list(path).update(key_, value_);
  }

  addNotification(title_: string, msg_: string, uid_: string): Promise<void> {
    let path = `/notifications/${this.dataInfo.defaultState}`;
    return this.db.list(path).push({ title: title_, msg: msg_, uid: uid_ });
  }

  addState(name_: string, uf_: string): Promise<void> {
    let path = '/states/';
    return this.db.list(path).push({ name: name_, uf: uf_ });
  }

  addCity(name_: string, uf_: string): Promise<void> {
    let path = '/cities/';
    return this.db.list(path).push({ name: name_, uf: uf_ });
  }

  addReport(
    data_: string,
    dataEnd_: string,
    totalJobs: number,
    totalComissionStr: string,
    totalPrePaidStr: string,
    totalCardStr: string,
    totalMoneyStr: string,
    totalFinalStr: string,
    clients: any = {},
    professionals: any = {}
  ): Promise<any> {
    let path = `${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    let ref = this.db.list(`/reportsAdmin/${path}`);
    let dateToday = moment().format('DD/MM/YYYY HH:mm:ss');

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
    });
  }

  removeReports(key_: string): Promise<void> {
    let path = `${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    let ref = this.db.list(`/reportsAdmin/${path}`);
    return ref.remove(key_);
  }

  getReports(): Observable<any> {
    let path = `${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    let uid = this.authProvider.currentUserUid();
    return this.db.list(`/reportsAdmin/${path}`, ref => ref.orderByChild('uid').startAt(uid).endAt(uid + '\uf8ff')).snapshotChanges();
  }

  getUserInfo(uid: string): Observable<any> {
    return this.db.list('/userProfile/', ref => ref.orderByKey().equalTo(uid)).snapshotChanges();
  }

  getUserName(name: string): Observable<any> {
    let path = '/userProfile/';
    return this.db.list(path, ref => ref.orderByChild('name').startAt(name).endAt(name + '\uf8ff')).snapshotChanges();
  }

  getWorkAccept(key_: string): Observable<any> {
    let path = '/orders/';
    return this.db.list(path, ref => ref.orderByKey().equalTo(key_)).snapshotChanges();
  }

  startWork(key_: string, msg_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { status: 'Iniciado', msg: msg_, datetimeStart: moment().format() });
  }

  cancelWork(key_: string, msg_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { status: 'Cancelado', msgCancel: msg_, datetimeCancel: moment().format() });
  }

  finishWork(key_: string, msg_: string): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { status: 'Finalizado', msgFinish: msg_, datetimeFinish: moment().format() });
  }

  updateTotalWorks(uid_: string, totalWorks_: number): Promise<void> {
    let path = '/userProfile/';
    return this.db.list(path).update(uid_, { totalWorks: totalWorks_ });
  }

  removeUser(uid_: string): Promise<void> {
    let path = `/userProfile/${uid_}`;
    return this.db.list(path).remove();
  }

  changeDropPointStatusDelivery(key_: string, msg_: string, dropPoints_: any): Promise<void> {
    let path = '/orders/';
    return this.db.list(path).update(key_, { msg: msg_, dropPoints: dropPoints_ });
  }

  getServices(): Observable<any> {
    return this.db.list('/services/').snapshotChanges();
  }

  addPaymentCredits(data_: any): Promise<any> {
    let path = `${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    let ref = this.db.list(`/paymentsCredits/${path}`);
    let dateToday = moment().format('DD/MM/YYYY HH:mm:ss');

    return ref.push({
      uid: this.authProvider.currentUserUid(),
      data: data_,
      status: this.dataInfo.titlePaymentOk,
      datetime: dateToday
    });
  }

  getPaymentsCredits(year_: string, month_: string): Observable<any> {
    let uid = this.authProvider.currentUser().uid;
    let path = `/paymentsCredits/${this.dataInfo.defaultState}/${year_}/${month_}`;
    return this.db.list(path, ref => ref.orderByChild('uid').startAt(uid).endAt(uid + '\uf8ff')).snapshotChanges();
  }

  updateUserCredits(credits_: number): Promise<void> {
    let uid = this.authProvider.currentUser().uid;
    let path = '/userProfile/';
    return this.db.list(path).update(uid, { credits: credits_ });
  }

  addMessage(msg_: string): Promise<any> {
    let path = `/messages/${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    let ref = this.db.list(path);
    let body = { msg: msg_, title: 'Solicitação de suporte', datetime: moment().format() };
    return ref.push(body);
  }

  getBrands(): Observable<any> {
    return this.db.list('/carBrands/', ref => ref.orderByKey()).snapshotChanges();
  }

  addBrands(name_: string, description_: string, url_: string, models_: string): Promise<void> {
    return this.db.list('/carBrands/').push({ name: name_, description: description_, models: models_, url: url_ });
  }

  updateBrands(key_: string, name_: string, description_: string, url_: string, models_: string): Promise<void> {
    return this.db.list('/carBrands/').update(key_, { name: name_, description: description_, models: models_, url: url_ });
  }

  removeBrands(key_: string): Promise<void> {
    return this.db.list('/carBrands/').remove(key_);
  }

  addIfoodVerification(uid_: string, data: any): Promise<void> {
    return this.db.list('/userProfile/').update(uid_, { ifood: data });
  }

  addIfoodEvent(data: any): Promise<void> {
    data.uid = this.authProvider.currentUser().uid;
    return this.db.list(`/ifood/${this.dataInfo.defaultState}`).push(data);
  }

  getOrdersIfood(): Observable<any> {
    return this.db.list('/ifood/', ref => ref.orderByKey()).snapshotChanges();
  }

  getOrdersIfoodByUid(): Observable<any> {
    let uid = this.authProvider.currentUser().uid;
    return this.db.list('/ifood/', ref => ref.orderByChild('uid').startAt(uid).endAt(uid + '\uf8ff')).snapshotChanges();
  }

  updateIfoodOrder(key_: string): Promise<void> {
    return this.db.list('/ifood/').update(key_, { actionOk: true, datetimeChanged: moment().format() });
  }

  getOrdersOnPedido(): Observable<any> {
    let path = `/onPedido/${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  updateOnPedidoOrder(key_: string, status: string): Promise<void> {
    let path = `/onPedido/${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    return this.db.list(path).update(key_, { '/pedido/0/pedido/0/info/0/status-pedido/0/texto': status });
  }

  updateOnPedidoKey(key_: string, keyy: string): Promise<void> {
    let path = `/onPedido/${this.dataInfo.defaultState}/${moment().format('YYYY')}/${moment().format('MM')}`;
    return this.db.list(path).update(key_, { serviceKey: keyy });
  }

  getRegions(): Observable<any> {
    let path = `/regions/${this.dataInfo.defaultState}`;
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  removeRegion(key_: string): Promise<void> {
    return this.db.list(`/regions/${this.dataInfo.defaultState}`).remove(key_);
  }

  addRegion(name_: string, description_: string): Promise<void> {
    let path = `/regions/${this.dataInfo.defaultState}`;
    return this.db.list(path).push({
      name: name_,
      description: description_
    });
  }

  getAcquaintances(): Observable<any> {
    let path = '/acquaintances/';
    return this.db.list(path, ref => ref.orderByKey()).snapshotChanges();
  }

  addToOrderHistory(historyData: any): Promise<any> {
    let path = '/orderHistory/';
    let ref = this.db.list(path);
    let uid = this.authProvider.currentUserUid();
    return ref.push({
      ...historyData,
      uid: uid,
      datetime: moment().format(),
      datetimeAccepted: historyData.datetimeAccepted || '',
      datetimeStart: historyData.datetimeStart || '',
      datetimeFinish: historyData.datetimeFinish || '',
      datetimeCancel: historyData.datetimeCancel || '',
      datetimeRated: historyData.datetimeRated || '',      
      });
    }
}