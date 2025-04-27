
import { Component, NgZone, OnInit } from '@angular/core';
import { NavController, ActionSheetController, Platform, NavParams, Events, IonicPage } from 'ionic-angular';
import { CameraProvider } from '../../providers/camera/camera'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { AuthProvider } from '../../providers/auth/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'


@IonicPage()
@Component({
  selector: 'page-professionals-add',
  templateUrl: 'professionals-add.html',
})
export class ProfessionalsAddPage implements OnInit {  

  public fullname:string = "";
 	public email:string = "";
  public password:string = "";
  public password1:string = "";

  step: number = 2; 

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

  selectedService: string = ""
  plate: string = ""

  services: any = [];  

  state_: string = 'DF'
  city_: string = ""
  citiesArray: any = []

  public formGroup: FormGroup;
  payload: any 

  tablesPrices: Observable<any>;  
  tablePrice: any
  tableArray: any = []

  pix: string = ""

  constructor(
    public navCtrl: NavController, 
    public platform: Platform,
    public authProvider: AuthProvider,
    public actionsheetCtrl: ActionSheetController,
    public uiUtils: UiUtilsProvider,    
    public storage: StorageProvider, 
    public camera: CameraProvider,    
    public navParams: NavParams,    
    public zone: NgZone,
    public events: Events,
    public db: DatabaseProvider,
    public auth: AuthProvider,
    public dataText: DataTextProvider,  
    private formBuilder: FormBuilder,
    public httpd: HttpdProvider,
    public dataInfo: DataInfoProvider) {                                   
  }

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')              
  }

  ngOnInit() {
    this.initForm()
  }

  startInterface(){

    this.clear()
    this.payload = this.navParams.get('payload')
    this.stateChanged(this.dataInfo.defaultState) 
    this.getServices()
    
    if(this.payload){      
      this.loadInfo()
    }
  }

  initForm() {

    this.formGroup = this.formBuilder.group({   
      name: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      lastName: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      address: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      complement: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      postCode: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      numero: ['',[Validators.required, Validators.minLength(0), Validators.maxLength(4)]],      
      district: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      cpf: ['',[Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      state: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(20)]],      
      city: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      tel:  ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    });
  }

  loadInfo(){

    let payload = this.payload
    console.log("Payload recebido", payload)
    
    this.formGroup.patchValue({
      name: payload.name,
      lastName: payload.lastName,
      state: payload.state,
      city: payload.city,
      address: payload.address,
      cpf: payload.cpf,
      tel: payload.tel,
      district: payload.district,
      numero: payload.numero,
      postCode: payload.postCode,
      complement: payload.complement
    })
    
    this.uid_ = payload.uid
    this.description = payload.description
    this.base64Image = payload.photo      
    this.agency = payload.agency    
    this.selectedBank = payload.bank
    this.account = payload.account    
    this.state_ = payload.state         

    this.plate = payload.carPlate 
    this.prefixo = payload.prefixo
    this.cnpj = payload.cnpj
    this.selectedService = payload.carName

    if(payload.pix)
      this.pix = payload.pix
    

    this.stateChanged(this.state_) 
    
    setTimeout(() => {
      this.city_ = payload.city
    }, 1000);
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


      if(info.type && info.type === 'Profissional'){
        this.tableArray.push(info)
      }      
      
    });
    

    setTimeout(() => {


     if(this.payload){

       this.tablePrice = this.payload.tablePrice

       console.log(this.tablePrice)
     }

    }, 3000);
  }

  
  save(){
    if(this.formGroup.valid){

      let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure)  
      alert.then((result) => {

      if(result)  
        this.update()    
       })
    }    
    
    else {
      this.checkErrorField()
    }
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
    this.pix = ""
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
    let loading = this.uiUtils.showLoading(this.dataInfo.titleUploading)
    loading.present()

    this.storage.uploadPicture(this.base64Image)

      .then(snapshot => {

        snapshot.ref.getDownloadURL().then(url => {
          this.uploadFinish(url) 
          loading.dismiss()

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
                
  }

  updateFinish(url: string){

    let loading = this.uiUtils.showLoading(this.dataInfo.titleUploading)
    loading.present()

    this.defaultValues()
          
    this.db.updateUser(
      this.uid_,
      "",
      this.formGroup.value.name, 
      this.formGroup.value.lastName, 
      this.formGroup.value.address, 
      this.formGroup.value.complement,
      this.formGroup.value.numero,
      this.formGroup.value.postCode,
      this.formGroup.value.district,
      this.formGroup.value.tel, 
      url, 
      'this.dataInfo.longitude', 
      'this.dataInfo.longitude', 
      2, 
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
      "",
      "",
      this.pix)

  .then( () =>{
    
      loading.dismiss()      
      this.uiUtils.showAlertSuccess(this.dataText.savedSuccess)
      this.events.publish('reload-professionals')

      this.navCtrl.pop()
    })
    .catch( () => {      
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
      2, 
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
      "",
      "")
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
    console.log('error', error);
  }

  accessGallery(){    
     this.camera.getPicture().then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData
      this.photoChanged = true

    }, (err) => {
     console.log(err);
    });
   }

  delPicture(){
    this.base64Image = ""
  }      

  handlerCamera(){
   if(! this.dataInfo.isWeb)
      this.grabPicture()
    else
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.errorUnavailable).present()
  }

  handlerGalery(){
    if(! this.dataInfo.isWeb)
      this.accessGallery()
    else
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.errorUnavailable).present()
    
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


  updateProfilePassword(payload_){

    this.auth.resetPassword(payload_.email)
    .then(() => {
      this.uiUtils.showAlertSuccess(this.dataText.weSentYouALink)
    })
    .catch(() => {
      this.uiUtils.showAlertSuccess(this.dataText.errorResetPassword)
    })
  }


  checkErrorField(){
    
    if(! this.formGroup.value.name){      
      this.uiUtils.showAlertError(this.dataText.errorRegister10)  
    }

    else if(! this.formGroup.value.lastName){      
      this.uiUtils.showAlertError(this.dataText.errorRegister11)  
    }

    else if(! this.formGroup.value.address){      
      this.uiUtils.showAlertError(this.dataText.errorRegister12)  
    }

    else if(! this.formGroup.value.complement){      
      this.uiUtils.showAlertError(this.dataText.errorRegister13)  
    }

    else if(! this.formGroup.value.numero){      
      this.uiUtils.showAlertError(this.dataText.errorRegister14)  
    }

    else if(! this.formGroup.value.postCode){      
      this.uiUtils.showAlertError(this.dataText.errorRegister15)  
    }

    else if(! this.formGroup.value.district){      
      this.uiUtils.showAlertError(this.dataText.errorRegister16)  
    }

    else if(! this.formGroup.value.tel){      
      this.uiUtils.showAlertError(this.dataText.errorRegister17)  
    }

    else if(! this.formGroup.value.state){      
      this.uiUtils.showAlertError(this.dataText.errorRegister18)  
    }

    else if(! this.formGroup.value.city){      
      this.uiUtils.showAlertError(this.dataText.errorRegister19)  
    }

    else {
      this.uiUtils.showAlertError(this.dataText.checkAllFields)  
    }

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
      this.checkErrorField()
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
  

  stateChanged(event){    
  }

  numeroInputChanged(){

  }

  telInputChanged(){

  }

  cpfnputChanged(){

  }

  complementInputChanged(){

  }

  cityChanged(){

  }

  districtChanged(){

  }


  addressInputChanged(){


  }

  cepInputChanged(){

  }

  
  lastNameInputChanged(){

  }

  nameInputChanged(){
    
  }


  tableChanged(event){
    console.log(event)
  }



}
