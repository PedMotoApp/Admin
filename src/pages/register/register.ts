import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, ActionSheetController, Platform, NavParams, MenuController, Events } from 'ionic-angular';
import { CameraProvider } from '../../providers/camera/camera'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { StorageProvider } from '../../providers/storage/storage';
import 'rxjs/add/operator/debounceTime';
import { Geolocation } from '@ionic-native/geolocation';
import { FormControl } from '@angular/forms';
import { DatabaseProvider } from '../../providers/database/database';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'
import { GoogleApiProvider } from '../../providers/google-api/google-api'
import { AlertController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',    
})

export class RegisterPage  implements OnInit {

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
  @ViewChild('pixInput') pixInput;      


  public formGroup: FormGroup;     
  base64Image: string = '';
  selectedPhoto: any;  
  selectedBank: string = '';
  agency: string = '';
  account: string = '';
  complement: string = '';  
  pix: string = '';
  uid_: string = ''
  description: string = '';
  cnpj: string = "";
  razaoSocial: string = ""
  prefixo: string  
  brand: string    
  clientInfo: any = []
  primeiroUso: Boolean = false;
  photoChanged: Boolean = false  
  searchControl: FormControl;
  searching: any = false;
  selectedService: string = "Entrega"
  plate: string = ""
  services: any = [];  
  carBrands: Observable<any>;
  carBrandsArray: any = []
  carModelArray: any = []
  cepChanged: Boolean = false
  clientType: string = "Pessoa jurídica"
  totalDistance: string = "2000"

  constructor(
    public navCtrl: NavController, 
    public platform: Platform,
    public actionsheetCtrl: ActionSheetController,
    public uiUtils: UiUtilsProvider,    
    public storage: StorageProvider, 
    public storageNative: Storage,
    public camera: CameraProvider,    
    public navParams: NavParams,
    public geolocation: Geolocation,
    public events: Events,
    public menu: MenuController,
    public db: DatabaseProvider,    
    public alertCtrl: AlertController, 
    private formBuilder: FormBuilder,
    public routes: GoogleApiProvider,
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider) {
    
      this.clear()      
  }

  ngOnInit() {
    this.initForm()    
    this.getBrands()
  }
  
  ionViewDidLoad() {    
    this.loadInterface()                
  }
  
  loadInterface(){    
    
    this.primeiroUso = this.dataInfo.primeiroUso

    if(this.dataText.languageSelected === 0){

      this.formGroup.patchValue({
        cpf: '00000000000'
      })

    }
    
        
    if(this.primeiroUso)      
      this.firstUse()
    else
      this.loadInfo() 
  }

  firstUse(){    
    this.getServices()
    this.menu.enable(false);

    let tel = this.navParams.get("tel")              
        
    this.formGroup.patchValue({
      name: this.dataInfo.userInfo.userName,   
      tel: tel,  
      complement: this.dataText.textUninformed           
    })
    
    this.uiUtils.showAlert(this.dataText.warning, 'Favor preencha os dados e clique em salvar').present()
    .then(() => {

      this.checkClientType()
        
    })


  }

  checkClientType() {
  
    let myAlert = this.alertCtrl.create({
      title: 'Qual é o tipo de cliente que você é?',
      enableBackdropDismiss: true ,
      message:'Selecione o tipo de cliente que você é',
      buttons:[{
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
      
        this.clientType = data
        
        if(this.clientType === 'Pessoa física')
          this.checkLastName()
        else 
          this.checkClientTypeJur()                
    },

    role: ''
  }
  ],
  inputs:[
  {
      type: 'radio',
      id: 'opt1',
      name: 'Pessoa jurídica',
      label: 'Pessoa jurídica',
      value: 'Pessoa jurídica',
      checked: true
  },
  {
      type: 'radio',
      id: 'opt2',
      name: 'Pessoa física',
      label: 'Pessoa física',
      value: 'Pessoa física',
      checked: false
  }
  ]
  });
  myAlert.present();
    
  }


  checkClientTypeJur(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o nome da sua empresa?',
      enableBackdropDismiss: true ,
      message: 'Informe o nome da sua empresa',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
      
        this.razaoSocial = data.name
        this.checkClientCNPJ()
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'Razão Social'
    }
  ]
  });
  myAlert.present();
    

  }

  checkClientCNPJ(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o CNPJ da sua empresa?',
      enableBackdropDismiss: true ,
      message:'Informe o CNPJ da sua empresa para que possamos identificá-la',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
      
        this.cnpj = data.name
        this.checkLastName()
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'CNPJ'
    }
  ]
  });
  myAlert.present();
    

  }

  checkName(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o seu nome?',
      enableBackdropDismiss: true ,
      message:'Informe seu nome para que possamos identificá-lo',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
            
        this.formGroup.patchValue({
          name: data.name
        })

        this.checkLastName()
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'Nome'
    }
  ]
  });
  myAlert.present();
    
  }


  checkLastName(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o seu sobrenome?',
      enableBackdropDismiss: true ,
      message:'Informe seu sobrenome para que possamos identificá-lo',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
            
        this.formGroup.patchValue({
          lastName: data.name
        })        

        this.checkCEP()
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'Sobrenome'
    }
  ]
  });
  myAlert.present();
    
  }


  checkPhone(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o seu telefone?',
      enableBackdropDismiss: true ,
      message:'Informe seu telefone para que possamos entrar em contato',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
            
        this.formGroup.patchValue({          
          tel: data.name
        })

        this.checkCEP()
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'Telefone'
    }
  ]
  });
  myAlert.present();
    
  }

  checkCEP(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o seu CEP?',
      enableBackdropDismiss: true ,
      message:'Informe seu CEP para que possamos verificar sua localização',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {    
                  
        this.formGroup.patchValue({
          postCode: data.name
        })
        
        this.checkNumber()
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'CEP'
    }
  ]
  });
  myAlert.present();
    
  }


  checkNumber(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o seu número?',
      enableBackdropDismiss: true ,
      message: 'Informe o número da sua residência',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
            
        this.formGroup.patchValue({
          numero: data.name
        })

        if(this.dataText.languageSelected === 0)
          this.checkCPF()

        else 
          this.cepInputChanged()
        
            
    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'Número'
    }
  ]
  });
  myAlert.present();
    
  }


  checkCPF(){

    let myAlert = this.alertCtrl.create({
      title: 'Qual é o seu CPF?',
      enableBackdropDismiss: true ,
      message:'Informe seu CPF para que possamos verificar sua identidade',
      buttons:[
  {
      text: "Cancelar",
      handler: data => {
          console.log('Abbrechen clicked. Data -> ' + JSON.stringify(data));
          },
      role: 'cancel'
  },
  {
    text: 'OK',
    handler: data => {            
            
        this.formGroup.patchValue({
          cpf: data.name
        })
        
        this.cepInputChanged()

    },
    role: ''
  }
  ],
  inputs:[
  {
      type: 'text',
      id: 'opt1',
      name: 'name',
      label: 'CPF'
    }
  ]
  });
  myAlert.present();
    
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

  stateChanged(){
    
  }

  cepInputChanged(){    

    if(! this.cepChanged){      
      this.cepChanged = true
      this.cepCheck()
    }
    
  }

  cepCheck(){

    let self = this

    let loading = this.uiUtils.showLoading('Verificando CEP')
    loading.present();

    this.routes.geocodeAddress(this.formGroup.value.postCode)
      .then((result) => {

        self.geocodeAddressCallback(result)

        if(loading)
          loading.dismiss();
      })
      .catch((error) => {

        if(loading)
          loading.dismiss();        

        this.cepChanged = false
        this.uiUtils.showToast('CEP inválido. Favor verificar')
      })
  }

  geocodeAddressCallback(result){

    if(result && result[0]){

      if(result[0].formatted_address){

        this.formGroup.patchValue({      
          address: result[0].formatted_address          
        })
      }


      if(result[0].address_components[1] && result[0].address_components[1].short_name){

        this.formGroup.patchValue({              
          district: result[0].address_components[1].short_name,        
        })

      }

      result[0].address_components.forEach(element => {

        if(element && element.types && element.short_name){          

          element.types.forEach(element1 => {            

            if(element1 === 'administrative_area_level_1'){

              this.formGroup.patchValue({              
                state: element.short_name,        
              })
              
            }

            if(element1 === 'administrative_area_level_2'){

              this.formGroup.patchValue({              
                city: element.short_name,        
              })
              
            }
            
          });

        }
        
      });
    
      if(this.primeiroUso)
        this.checkPhotoWizard()

    } 
    else {
      this.uiUtils.showToast('CEP inválido. Favor verificar')
    }    
  }

  checkPhotoWizard(){

    setTimeout(() => {

      this.cepChanged = false

      this.uiUtils.showAlertSuccess('CEP verificado com sucesso')
      .then(() => {
        this.selectPicture()
      })
      
      
    }, 3000);

    
  }

  numeroInputChanged(){

  }

  districtChanged(){

  }

  cityChanged(){

  }

  telInputChanged(){
    if(this.cpfInput)
      this.cpfInput.setFocus();
  }

  cpfnputChanged(){

    if(this.dataInfo.userInfo.userType === 1)
      this.uiUtils.showAlertSuccess('CPF verificado com sucesso')

    else {

      if(this.prefixoInput)    
        this.prefixoInput.setFocus();

    }
  }

  prefixoInputChanged(){
    if(this.plateInput)    
        this.plateInput.setFocus();
  }

  plateInputChanged(){
    if(this.agencyInput)
      this.agencyInput.setFocus();
  }

  agencyInputChanged(){
    if(this.accountInput)
      this.accountInput.setFocus();
  }

  accountInputChanged(){

    if(this.pixInput)
      this.pixInput.setFocus();
  }

  pixInputChanged(){
   // this.uiUtils.showAlertSuccess(this.dataText.textCheckInfoAndSave)
  }

  cnpjChanged(){      
    /*const ok = this.dataInfo.validaCpfCnpj(this.cnpj)    

    if(!ok){
     // this.uiUtils.showToast("CNPJ inválido. Favor verificar")
    }*/
  }

  initForm() {    
        
    this.formGroup = this.formBuilder.group({   
      name: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      lastName: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      address: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      complement: ['',[Validators.nullValidator, Validators.minLength(3), Validators.maxLength(300)]],      
      postCode: ['',[Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      numero: ['',[Validators.required, Validators.minLength(0), Validators.maxLength(4)]],      
      district: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],      
      state: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(20)]],      
      city: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      cpf: ['',[Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      tel:  ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    });
  }
  
  getServices(){    
    this.db.getServices().subscribe(data => {      
      this.getServicesCallback(data)
    })
  }

  getServicesCallback(data){    
    this.services = []

    data.forEach(element => {
      let val = element.payload.val()
      val.toggle = false      
      val.total = val.value

      this.services.push(val)
    });

    this.dataInfo.services = this.services
  }
  
  
  loadInfo(){ 
        
    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')

  }  

  startInterface(){

    this.menu.enable(true);
    this.clear()
    this.loginInfoUser()   

  }

  loginInfoUser(){
    
    let payload = this.dataInfo.userInfo    

    this.formGroup.patchValue({
      name: payload.name,
      lastName: payload.lastName,
      address: payload.address,
      cpf: payload.cpf,
      tel: payload.tel,
      city: payload.city,
      state: payload.state,
      district: payload.district,
      numero: payload.numero,
      postCode: payload.postCode,
      complement: payload.complement
    })

    this.razaoSocial = payload.razaoSocial    
    this.description = payload.description
    this.base64Image = payload.photo      
    this.agency = payload.agency
    this.selectedBank = payload.bank
    this.account = payload.account
    this.selectedService = payload.carName
    this.plate = payload.carPlate 
    this.cnpj = payload.cnpj     
    this.totalDistance = payload.totalDistance
    this.pix = payload.pix 
    this.clientType = payload.clientType

    console.log(payload)

    setTimeout(() => {

      this.brand = payload.brand
      this.prefixo = payload.prefixo                        

    }, 5000);
    
  }

  getBrands(){
    this.carBrands = this.db.getBrands()

    let sub = this.carBrands.subscribe((data) => {

        this.carBrandsCallback(data)
        this.brandChanged()     
        sub.unsubscribe()
    })

  }

  carBrandsCallback(data){

    data.forEach(element => {

      let val = element.payload.val()
      val.key = element.payload.key

      this.carBrandsArray.push(val)      
    });
  }
 
  save() {
    const errorMappings = {
        name: "Erro no registro: Nome é obrigatório",
        lastName: "Erro no registro: Sobrenome é obrigatório",
        address: "Erro no registro: Endereço é obrigatório",
        numero: "Erro no registro: Número é obrigatório",
        postCode: "Erro no registro: CEP é obrigatório",
        district: "Erro no registro: Bairro é obrigatório",
        tel: "Erro no registro: Telefone é obrigatório",
        cpf: "Erro no registro: CPF é obrigatório",
    };
    
    for (const field in errorMappings) {
        if (errorMappings.hasOwnProperty(field)) {
            const errorMessage = errorMappings[field];
            if (!this.formGroup.value[field] || this.formGroup.value[field].length === 0) {
                this.uiUtils.showAlertError(errorMessage);
                return;
            }
        }
    }

    this.saveCheckContinue();
  }


  saveCheckContinue(){

    let alert = this.uiUtils.showConfirm("Atenção", this.dataText.areYouSure)  
    alert.then((result) => {

      if(result){              
        this.update()    
      }                    
    })
  }

  finish(){
    var self = this

    let alert = this.uiUtils.showConfirm("Atenção", this.dataText.areYouSure)  
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
    this.razaoSocial = ""
    this.uid_ = ''
    this.photoChanged = false
    this.totalDistance = "0"
  }

 
  async update() {
    try {
        let url = "";
        if (this.base64Image) {
            url = this.photoChanged ? await this.uploadWithPic() : this.base64Image;
        }
        await this.uploadFinish(url);
    } catch (error) {
        this.uiUtils.showAlert(this.dataText.warning, error).present();
    }
  }


  async uploadWithPic() {
    const loading = this.uiUtils.showLoading("Salvando foto");
    loading.present();
    try {
        const datanow = moment().format("YYYYDDMMhhmmss");
        const path = "/pictures/" + datanow + '/';
        const snapshot = await this.storage.uploadPicture(this.base64Image);
        const url = await snapshot.ref.getDownloadURL();
        this.events.publish('userInfo:updatePhoto', url);
        return url;
    } catch (err) {
        throw err; 
    } finally {
        loading.dismiss();
    }
  }

  async uploadFinish(url = "") {
    const loading = this.uiUtils.showLoading(this.dataText.pleaseWait);
    loading.present();
    this.defaultValues();
    try {
        await this.db.updateUserRegister(
          this.formGroup.value.name, 
          this.formGroup.value.lastName, 
          this.formGroup.value.address, 
          this.formGroup.value.complement,
          this.formGroup.value.numero,
          this.formGroup.value.postCode,
          this.formGroup.value.district,
          this.formGroup.value.tel, 
          url, 
          this.dataInfo.userInfo.latitude, 
          this.dataInfo.userInfo.longitude, 
          this.dataInfo.userInfo.userType, 
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
          this.brand,
          this.razaoSocial,
          this.pix,
          this.clientType,
          this.totalDistance
        );
        await this.uiUtils.showAlertSuccess("Informações salvas com sucesso");
        this.saveContinue();
    } catch (err) {
        this.uiUtils.showAlertError("Erro ao salvar informações");
    } finally {
        loading.dismiss();
    }
  }

  documents(){
    this.navCtrl.push("DocumentationPage")
  }

  defaultValues() {
    const { value } = this.formGroup;
    const uninformed = this.dataText.textUninformed;

    value.state = value.state ? value.state : "";
    value.city = value.city ? value.city : "";
    value.complement = value.complement || "";
    this.description = "Seja bem vindo ao MotokApp";
    this.selectedService = this.selectedService ? this.selectedService : uninformed;
    this.plate = this.plate ? this.plate : uninformed;
    this.cnpj = this.cnpj ? this.cnpj : uninformed;
    this.pix = this.pix ? this.pix : uninformed;
    this.clientType = this.clientType ? this.clientType : "1";
    this.selectedBank = this.selectedBank ? this.selectedBank : uninformed;
    this.agency = this.agency ? this.agency : uninformed;
    this.account = this.account ? this.account : uninformed;
    this.prefixo = this.prefixo ? this.prefixo : uninformed;
    this.brand = this.brand ? this.brand : uninformed;
    this.razaoSocial = this.razaoSocial ? this.razaoSocial : uninformed;
    this.totalDistance = this.totalDistance || "";
    
    const { userInfo } = this.dataInfo;
    userInfo.latitude = userInfo.latitude || "";
    userInfo.longitude = userInfo.longitude || "";
  }



  saveContinue() {
    const sub = this.db.getUser().subscribe(data => {
        this.saveCallback(sub, data);
    });
  }

  saveCallback(sub, data) {
    sub.unsubscribe();
    data.forEach(element => {
        this.dataInfo.userInfo = element.payload.val();
    });
    if (this.primeiroUso) {
        this.primeiroUso = this.dataInfo.primeiroUso = false;
        this.navCtrl.setRoot('LoginPage', { autoLogin: true, primeiro: false });
        this.menu.enable(true);        
    }
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
 
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)      
    loading.present();

    this.camera.grabPicture().then((imageData) => {
            
      this.selectedPhoto  = this.dataInfo.dataURItoBlob('data:image/jpeg;base64,' + imageData);                  
      this.base64Image = 'data:image/jpeg;base64,' + imageData
      this.photoChanged = true
      
      if(loading)
        loading.dismiss()

    }, (err) => {
      if(loading)
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
      this.uiUtils.showAlert("Atenção", this.dataText.notAvailable).present()
  }

  handlerGalery(){
    if(! this.dataInfo.isWeb)
      this.accessGallery()
    else
      this.uiUtils.showAlert("Atenção", this.dataText.notAvailable).present()
    
  }
  
  openMenu() {
    let actionSheet = this.actionsheetCtrl.create({
      title: "Trocar foto",
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
          text: "Cancelar",
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        }
      ]
      
    });
    actionSheet.present();
  }    
  
  
  brandChanged(){

    this.carModelArray = []
    this.carBrandsArray.forEach(element => {

      if(element.name === this.brand){

        let res = element.models.split(";");         

        res.forEach(bra => {
          this.carModelArray.push(bra)  
        });
                
      }
      
    });
  }
}
