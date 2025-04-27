import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ActionSheetController, Platform, NavParams, MenuController, Events } from 'ionic-angular';
import { CameraProvider } from '../../providers/camera/camera'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { StorageProvider } from '../../providers/storage/storage';
import 'rxjs/add/operator/debounceTime';
import { FormControl } from '@angular/forms';
import { DatabaseProvider } from '../../providers/database/database';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs/Observable';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataTextProvider } from '../../providers/data-text/data-text'



@IonicPage()
@Component({
  selector: 'page-clients-add',
  templateUrl: 'clients-add.html',
})
export class ClientsAddPage {

  @ViewChild('razaoSocialInput') razaoSocialInput;
  @ViewChild('cnpjInput') cnpjInput;
  @ViewChild('nameInput') nameInput;
  @ViewChild('lastNameInput') lastNameInput;
  @ViewChild('addressInput') addressInput;
  @ViewChild('complementInput') complementInput;
  @ViewChild('telInput') telInput;
  @ViewChild('cpfInput') cpfInput;
  @ViewChild('plateInput') plateInput;
  @ViewChild('agencyInput') agencyInput;
  @ViewChild('accountInput') accountInput;  
  @ViewChild('prefixoInput') prefixoInput;      

  public formGroup: FormGroup;  
  
  public fullname:string = "";
 	public email:string = "";
  public password:string = "";
  public password1:string = "";

  base64Image: string = '';
  selectedPhoto: any;  
  selectedBank: string = '';
  agency: string = '';
  account: string = '';
  complement: string = '';  
  uid_: string = ''
  description: string = '';
  item: string = ''
  cnpj: string;
  prefixo: string  
  
  clientInfo: any = []
  primeiroUso: Boolean = false;
  photoChanged: Boolean = false
  
  searchControl: FormControl;
  searching: any = false;

  selectedService: string = "Caminhão"
  plate: string = ""

  services: any = [];  

  state_: string = 'RJ'
  city_: string = "Rio de Janeiro"
  citiesArray: any = []
  payload: any 

  tablesPrices: Observable<any>;  
  tablePrice: any
  tableArray: any = []

  ifoodClientId: string = ""
  ifoodClientSecret: string = ""

  constructor(
    public navCtrl: NavController, 
    public platform: Platform,
    public actionsheetCtrl: ActionSheetController,
    public uiUtils: UiUtilsProvider,    
    public storage: StorageProvider, 
    public camera: CameraProvider,    
    public navParams: NavParams,
    public events: Events,
    public menu: MenuController,
    public db: DatabaseProvider,    
    private formBuilder: FormBuilder,
    public auth: AuthProvider,
    public httpd: HttpdProvider,
    public dataText: DataTextProvider,
    public dataInfo: DataInfoProvider) {              
  }

  ngOnInit() {
    this.initForm()    
  }

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')              
  }

  startInterface(){
    
    this.payload = this.navParams.get('payload')    
    this.clear()
    this.stateChanged(this.dataInfo.defaultState)
    this.getServices()

    if(this.payload){      
      this.loadInfo()
    }
  }

  getServices(){        
    
    this.tablesPrices = this.db.getAllTablesPrice()  
    
    this.tablesPrices.subscribe(data => {
      this.getServicesCallback(data)
    })
  }

  getServicesCallback(data){

    this.tableArray = []


    data.forEach(element => {
      
      let info = element.payload.val()
      info.key = element.payload.key


      if(info.type && info.type === 'Cliente'){
        this.tableArray.push(info)
      }      
      
    });
    

    setTimeout(() => {
        
     if(this.payload && this.payload.tablePrice){
      
       this.tablePrice = this.payload.tablePrice       
     }

    }, 3000);
  }


  razaoSocialInputChanged(){
    if(this.cnpjInput)
      this.cnpjInput.setFocus();
  }
  
  cnpjInputChanged(){
    if(this.nameInput)
      this.nameInput.setFocus();
  }

  nameInputChanged(){

    if(this.lastNameInput)
      this.lastNameInput.setFocus();
  }

  lastNameInputChanged(){
    if(this.addressInput)
      this.addressInput.setFocus();
  }

  addressInputChanged(){
    if(this.complementInput)
    this.complementInput.setFocus();
  }

  complementInputChanged(){
    if(this.telInput)
      this.telInput.setFocus();
  }

  cepInputChanged(){

  }

  numeroInputChanged(){

  }

  districtChanged(){

  }

  telInputChanged(){
    if(this.cpfInput)
      this.cpfInput.setFocus();
  }

  cpfnputChanged(){

    if(this.dataInfo.userInfo.userType === 1)
      this.uiUtils.showAlertSuccess("Favor conferir as informações e clicar em 'Salvar'")

    else {

      if(this.prefixoInput)    
        this.prefixoInput.setFocus();

    }
  }


  initForm() {    
        
    this.formGroup = this.formBuilder.group({   

      
      razaoSocial: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cnpj: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      name: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      lastName: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      address: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      complement: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      postCode: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      numero: ['',[Validators.required, Validators.minLength(0), Validators.maxLength(5)]],      
      district: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      cpf: ['',[Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      tel:  ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      state: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(20)]],      
      city: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
    });
  }
  
 
  loadInfo(){   
    this.menu.enable(true);
    this.clear()
    this.loginInfoUser()   
  }   

  loginInfoUser(){
    
    let payload = this.payload    

    this.formGroup.patchValue({
      razaoSocial: payload.razaoSocial,
      cnpj: payload.cnpj,
      name: payload.name,
      lastName: payload.lastName,
      address: payload.address,
      state: payload.state,
      city: payload.city,
      cpf: payload.cpf,
      tel: payload.tel,
      district: payload.district,
      numero: payload.numero,
      postCode: payload.postCode,
      complement: payload.complement
    })    

    this.description = payload.description
    this.base64Image = payload.photo      
    this.agency = payload.agency
    this.prefixo = payload.prefixo
    this.selectedBank = payload.bank
    this.account = payload.account
    this.selectedService = payload.carName
    this.plate = payload.carPlate 
    this.cnpj = payload.cnpj    
    this.state_ = payload.state 
    this.city_ = payload.city     
    this.state_ = payload.state
    this.stateChanged(this.state_)
    this.uid_ = payload.uid


    if(payload.ifoodClientId){
      this.ifoodClientId = payload.ifoodClientId
      this.ifoodClientSecret = payload.ifoodClientSecret
    }
      
    
    


    
  }
 
  save(){

    if(this.formGroup.valid){

      this.saveCheck()
        .then(() => {

          let alert = this.uiUtils.showConfirm(this.dataText.warning, "Tem certeza?")  
          alert.then((result) => {
      
            if(result){              
              this.update()    
            }
              
              
          })   
          .catch((error) => {
            this.uiUtils.showAlertError(error)
          })
        })

    }
    
        
      
    else {            
      this.uiUtils.showAlertError(this.dataText.checkAllFields)   
    }
      

  }

  saveCheck(){

    return new Promise<void>((resolve, reject) => {

      if(! this.formGroup.value.name)
        reject("Favor informar o nome")
    
      else if(! this.formGroup.value.lastName)
        reject("Favor informar o sobrenome")      
    
      else if(! this.formGroup.value.address)
        reject("Favor informar o seu endereço")
    
      else if(! this.formGroup.value.tel)
        reject("Favor informar o seu número para contato")
    
    resolve()

    })    
  }

  finish(){
    var self = this

    let alert = this.uiUtils.showConfirm(this.dataText.warning, "Tem certeza?")  
    alert.then((result) => {

      if(result)  
        self.update()    
    })    
  }

  clear(){
    this.complement = ""       
    this.selectedBank = "" 
    this.agency = "" 
    this.account = ""     
    this.cnpj = ""     
    this.plate = ""
    this.prefixo = ""
    this.prefixo = ""
    this.selectedService = ""
    this.description = ""
    this.uid_ = ''
    this.photoChanged = false
  }

  update(){

    if(this.base64Image){

      if(this.photoChanged)
        this.uploadWithPic()
      else 
        this.uploadFinish(this.base64Image) 
    }
      
    else 
      this.uploadFinish("")   
  }

  uploadWithPic(){    
    let loading = this.uiUtils.showLoading("Carregando")
    loading.present()

    let datanow = moment().format("YYYYDDMMhhmmss")
    let path = "/pictures/" + datanow + '/'    

    this.storage.uploadPicture(this.base64Image)

      .then(snapshot => {

        snapshot.ref.getDownloadURL().then(url => {
          loading.dismiss()

          this.events.publish('userInfo:updatePhoto', url)
          this.uploadFinish(url)           

        }).catch(err => {
          loading.dismiss()
          this.uiUtils.showAlert(this.dataText.warning, err).present()
          
        })
      })
      .catch( error => {
        loading.dismiss()
        this.uiUtils.showAlert(this.dataText.warning, error).present()
      })        
  }

  uploadFinish(url: string){

    if(this.payload)  
        this.updateFinish(url)
      else
        this.addFinish(url)
    
    
  }

  updateFinish(url){

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)
    loading.present()

    let self = this    

    this.defaultValues()
    


    console.log(typeof(this.tablePrice))
    console.log(this.tablePrice)


          
    this.db.updateUser(

      this.uid_,
      this.formGroup.value.razaoSocial, 
      this.formGroup.value.name, 
      this.formGroup.value.lastName, 
      this.formGroup.value.address, 
      this.formGroup.value.complement,
      this.formGroup.value.numero,
      this.formGroup.value.postCode,
      this.formGroup.value.district,
      this.formGroup.value.tel, 
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.dataText.notInformade,
      1, 
      this.dataText.notInformade, 
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.formGroup.value.cpf,
      this.formGroup.value.cnpj,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.formGroup.value.state, 
      this.formGroup.value.city, 
      this.dataText.notInformade,
      this.tablePrice,
      this.ifoodClientId,
      this.ifoodClientSecret,
      "")

  .then( () =>{
    
      loading.dismiss()
      self.uiUtils.showAlertSuccess("Atualizações realizadas com sucesso")
      .then( () => {

        this.navCtrl.pop()     
        
      })      
    })

    .catch( (error) => {      
      console.log(error)

      loading.dismiss()
      this.uiUtils.showAlertError(this.dataText.errorRegister9)
    })
  }

  addFinish(url: string){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    let data = {email: this.email, password: this.password, name: this.formGroup.value.name}
    console.log(data)


    this.httpd.apiAddUser(data)
    .subscribe((callback) => {

      loading.dismiss()

      this.addCallback(callback)      
    })
                      
  }

  addCallback(data){

    if(data.success)
      this.savedOk(data)      
    else
      this.uiUtils.showAlertError(this.dataText.errorRegister)       
  } 

  savedOk(data){                    

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    this.defaultValues() 

    this.db.addUserStart(
      data.uid,
      this.password,
      this.formGroup.value.name, 
      this.formGroup.value.lastName, 
      this.formGroup.value.address, 
      this.formGroup.value.complement,
      this.formGroup.value.numero,
      this.formGroup.value.postCode,
      this.formGroup.value.district,
      this.formGroup.value.tel, 
      "", 
      this.email,       
      1, 
      this.description, 
      this.selectedBank,
      this.agency,
      this.account,
      this.formGroup.value.cpf,
      this.cnpj,      
      this.selectedService,
      this.plate,
      this.formGroup.value.state, 
      this.formGroup.value.city, 
      this.prefixo,
      this.tablePrice,
      this.ifoodClientId,
      this.ifoodClientSecret)



      .then(() => {
        
        loading.dismiss()
        this.navCtrl.pop()
        this.uiUtils.showAlertSuccess(this.dataText.addedSuccess)
        
      })
      .catch((error) => {

        console.log(error)

        loading.dismiss()
        this.uiUtils.showAlertError(this.dataText.errorRegister)

      })
    
    
    
  }


  defaultValues(){
    this.description = this.dataInfo.titleCompleteDescription

    if(! this.selectedService  || this.selectedService.length === 0)
      this.selectedService = this.dataText.notInformade

    if(! this.plate  || this.plate.length === 0)
      this.plate = this.dataText.notInformade

    if(! this.cnpj || this.cnpj.length === 0)
      this.cnpj = this.dataText.notInformade   

    if(! this.selectedBank  || this.selectedBank.length === 0)
      this.selectedBank = this.dataText.notInformade   

    if(! this.agency  || this.agency.length === 0)
      this.agency = this.dataText.notInformade   

    if(! this.account  || this.account.length === 0)
      this.account = this.dataText.notInformade            

    if(! this.prefixo  || this.prefixo.length === 0)
      this.prefixo = this.dataText.notInformade    

    if(!this.tablePrice)    
      this.tablePrice = ""
      
      
    if(!this.ifoodClientId)
      this.ifoodClientId = "b37ac194-2522-4c0f-8179-2de0da16a327"

    if(!this.ifoodClientSecret)
      this.ifoodClientSecret = "4rxsb2ud4q2tuepr00tydl6k5x2mzok3p8lzirkj9qcck8koj9nuhpps9lmyj1syfjp69vd9igmqqykc894nm8pdgp7cu8dezdw"
  }

  selectPicture(){
    this.openMenu()
  }

  openFilePhoto(event){
      this.base64Image = event.srcElement.files[0];
  }

  picChange(event: any) {

    if(event.target.files && event.target.files[0]){
      let reader = new FileReader();

      reader.onload = (event:any) => {
        this.base64Image = event.target.result;
        this.photoChanged = true
      }
      reader.readAsDataURL(event.target.files[0]);
    }    
  }

  grabPicture() {
 
    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)      
    loading.present();

    this.camera.grabPicture().then((imageData) => {

      this.selectedPhoto  = this.dataInfo.dataURItoBlob('data:image/jpeg;base64,' + imageData);                  
      this.base64Image = 'data:image/jpeg;base64,' + imageData
      this.photoChanged = true
      loading.dismiss()

    }, (err) => {
      loading.dismiss()
    });
   }

    onSuccess = (snapshot) => {        
    this.base64Image = snapshot.downloadURL;
  }
  
  onError = (error) => {
   // console.log('error', error);
  }

  accessGallery(){    
     this.camera.getPicture().then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData
      this.photoChanged = true

    }, (err) => {
     //console.log(err);
    });
   }

  delPicture(){
    this.base64Image = ""
  }      

  handlerCamera(){
    
    if(! this.dataInfo.isWeb)
      this.grabPicture()
    else
      this.uiUtils.showAlert(this.dataText.warning, "Disponível apenas no aplicativo mobile").present()
  }

  handlerGalery(){
    if(! this.dataInfo.isWeb)
      this.accessGallery()
    else
      this.uiUtils.showAlert(this.dataText.warning, "Disponível apenas no aplicativo mobile").present()
    
  }
  
  openMenu() {
    let actionSheet = this.actionsheetCtrl.create({
      title: this.dataInfo.titleChangePic,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Camera',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'camera' : null,
          handler: () => {
            this.handlerCamera()
          }
        },
        {
          text: 'Album',
          icon: !this.platform.is('ios') ? 'albums' : null,
          handler: () => {
            this.handlerGalery()
          }
        },       
        {
          text: this.dataText.cancel,
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        }
      ]
      
    });
    actionSheet.present();
  }    
  
  stateChanged(event){
  
  }
  
  passwordInputChanged(){

  }


  signUp(){
    if(this.formGroup.valid && this.email && this.password){

      let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
      alert.then((result) => {

      if(result)  
        this.signupContinue()    
       })
    }
    
    else {
      this.uiUtils.showAlertError(this.dataText.checkAllFields)
    }    
  }

  signupContinue(){
    
    let loading = this.uiUtils.showLoading(this.dataInfo.titleCreatingProfile)    
    loading.present() 

    if(this.base64Image){

      if(this.photoChanged)
        this.uploadWithPic()
      else 
          this.uploadFinish(this.base64Image) 
    }
      
    else 
      this.uploadFinish("")


    loading.dismiss()
    
  }

  ifoodClientIdChanged(){
    
  }

  ifoodClientSecretChanged(){

  }


  tableChanged(event){
    console.log(event)
  }


}
