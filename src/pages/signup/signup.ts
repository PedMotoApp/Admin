import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Storage } from '@ionic/storage';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { DataTextProvider } from '../../providers/data-text/data-text'
import { InAppBrowser } from '@ionic-native/in-app-browser';


@IonicPage()

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  page:any;
  params:any={};
  data: any=[];  
  userTypeName: string;
  
   @ViewChild('signupSlider') signupSlider: any;
   @ViewChild('fullnameInput') fullnameInput;
   @ViewChild('emailInput') emailInput;
   @ViewChild('telInput') telInput;
   @ViewChild('passwordInput') passwordInput;
   @ViewChild('password1Input') password1Input;


 	public fullname: string = "";
  public tel: string = "";
 	public email: string = "";
  public password: string = "";
   
  constructor(public navCtrl: NavController, 
    public authProvider: AuthProvider,
    public storage: Storage,
    public navParams: NavParams,
    public db: DatabaseProvider,
    public events: Events,
    public dataInfo: DataInfoProvider,
    public uiUtils: UiUtilsProvider,
    private iab: InAppBrowser,
    public dataText: DataTextProvider) {    
      
      this.data=  {
        txtHead:'Criar nova conta',
        btnSignUp:this.dataText.register,
        btnForgotPassword:'Esqueci a senha',
        txtFullName:'Nome',
        txtAddress:this.dataText.address,
        txtEmail:'Seu e-mail',
        txtPassword:'Password',
        imgLogo:'assets/imgs/logo.png',
        txtTel: 'Telefone'
     }     

     this.dataInfo.defaultState = 'DF'

  }

  ionViewDidLoad() {    
    this.uiUtils.showAlert('Bem vindo(a)', 'Favor preencha com seus dados e clique em cadastrar').present()
  }

  fullnameInputChanged(){

    if(this.telInput)
      this.telInput.setFocus();  
  } 

  parseTel(){

    if(!this.tel)
      return;

    this.tel = this.tel.replace(/[^0-9]/g, '');        
    this.tel = this.tel.replace(/[^\w\s]/gi, '')    
    this.tel = this.tel.replace(/ /g,'');    
    this.tel = this.tel.replace(/_/g,'');    
    this.tel = this.tel.replace(/-/g,'');    
    this.tel = this.tel.replace(/\+/g,'');    
    this.tel = this.tel.replace(/\(/g,'');    
    this.tel = this.tel.replace(/\)/g,'');
  }

  telInputChanged(){
        
    this.parseTel()

    if(this.emailInput)
      this.emailInput.setFocus();  

  }

  emailInputChanged(){        

    this.parseTel()

    if(this.passwordInput)
      this.passwordInput.setFocus();  
  }

  passwordInputChanged(){

    this.parseTel()

    if(this.password1Input)
      this.password1Input.setFocus();  
  }

  password1InputChanged(){
    this.parseTel()
  }
  
  async signupUser() {
    const alert = await this.uiUtils.showConfirm('Atenção', 'Ao cadastrar-se no aplicativo, você concorda com os termos de uso e política de privacidade.');
    if (alert) {
      await this.storage.set('ion_did_tutorial', false);
      this.signupContinue();
    }
  }

  private async signupContinue() {
    const loading = this.uiUtils.showLoading(this.dataText.pleaseWait);
    loading.present();
    try {
      await this.authProvider.signupUser(this.email, this.password, 1, this.tel);
      await loading.dismiss();
      this.signupUserFinish();
    } catch (error) {
      await loading.dismiss();
      this.treatError(error);
    }
  }


  treatError(error){
    
    if(error.code === 'auth/email-already-in-use')
      this.uiUtils.showAlert(this.dataText.warning, 'Já cadastrado').present()    
    
    else 
      this.uiUtils.showAlert(this.dataText.warning, error).present()            
    
  }
  
  
  signupUserFinish(){    
    let loading = this.uiUtils.showLoading('Criando perfil')    
    loading.present() 
    let self = this

    this.db.addUserStartRegister(this.email, 1, this.fullname, this.dataInfo.defaultState).then( () => {   
      
      if(loading)
          loading.dismiss()

      
      const userConfig = this.db.getUser().subscribe((data) => {
        this.goPageHomeUserContinue(data);
        userConfig.unsubscribe();
      });
      
      
    })    
  }

  goPageHomeUserContinue(data) {
    data.forEach((element) => {
      this.dataInfo.userInfo = element.payload.val();
      this.dataInfo.userType = element.payload.val().userType;
    });

    if (this.dataInfo.userInfo) {
      if (!this.dataInfo.userInfo.ifoodClientId)
        this.dataInfo.userInfo.ifoodClientId = "b37ac194-2522-4c0f-8179-2de0da16a327";

      if (!this.dataInfo.userInfo.ifoodClientSecret)
        this.dataInfo.userInfo.ifoodClientSecret =
          "4rxsb2ud4q2tuepr00tydl6k5x2mzok3p8lzirkj9qcck8koj9nuhpps9lmyj1syfjp69vd9igmqqykc894nm8pdgp7cu8dezdw";

      console.log(
        this.dataInfo.userInfo.ifoodClientId,
        this.dataInfo.userInfo.ifoodClientSecret
      );
    }

    this.getConfigurations();
  }

  getConfigurations() {
    let sub = this.db.getAllSettings().subscribe((data) => {
      this.getCallback(sub, data);
    });
  }

  getCallback(sub, data) {
    data.forEach((element) => {
      this.dataInfo.appConfig = element.payload.val();
      this.dataInfo.appConfig.key = element.payload.key;
    });

    sub.unsubscribe();
    this.goPageHome();
  }

  goPageHome() {
    if (!this.dataInfo.isHome) {
      if (this.dataInfo.userInfo) {
        this.storage.set("default-state", this.dataInfo.defaultState).then(() => {
          console.log("Default state salvo com sucesso!!");
        });

        this.dataInfo.isHome = true;

        this.navCtrl.setRoot('RegisterPage', {primeiroUso: true, tel: this.tel})
        
      } else this.uiUtils.showAlertError("Usuário não localizado ou senha incorreta");
    }
  }
  
  goBack(){
    this.navCtrl.pop()
  } 

  goTerms(){
      
    let url = 'https://github.com/MotokApp/Suporte/blob/master/TERMOS.md'
    let options = 'location=no';

    if(this.dataInfo.isWeb)
      this.iab.create(url, '_blank', options);    
    else 
      this.iab.create(encodeURI(url), '_system', options);
  }


  goPriv(){

    let url = 'https://github.com/MotokApp/Suporte/blob/master/PRIVACIDADE.md'
    let options = 'location=no';

    if(this.dataInfo.isWeb)
      this.iab.create(url, '_blank', options);    
    else 
      this.iab.create(encodeURI(url), '_system', options);

  }

}
