import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { StorageProvider } from '../../providers/storage/storage';
import { CameraProvider } from '../../providers/camera/camera'
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-servicess-add',
  templateUrl: 'servicess-add.html',
})
export class ServicessAddPage {

  payload: any

  key: string = ""
  name: string = ""
  type: string = "Entregas"
  valueStart: number = 0
  valueMeter: number = 0
  base64Image: string = '';  
  
  selectedPhoto: any;
  photoChanged: Boolean = false

  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public platform: Platform,
    public dataInfo: DataInfoProvider,
    public actionsheetCtrl: ActionSheetController,
    public camera: CameraProvider,    
    public storage: StorageProvider, 
    public dataText: DataTextProvider,  
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
    this.clear()  
    this.loadValues()
    this.stateChanged(this.dataInfo.defaultState)
  }

  loadValues(){
    this.payload = this.navParams.get('payload')

    if(this.payload){      

      this.name = this.payload.name
      this.valueStart = this.payload.value
      this.valueMeter = this.payload.valueMeter
      this.key = this.payload.key
      this.selectPicture = this.payload.url
      this.base64Image = this.payload.url

    }    
  }

  clear(){
    this.key = ""
    this.name = ""
    this.valueStart = 0
    this.valueMeter = 0
    
    this.base64Image = ""
  }

  add(){
    
    if(this.name){      
      
      if(this.base64Image.length === 0)
        this.uiUtils.showAlert(this.dataText.warning, "Favor anexar uma imagem para o tipo").present()          
      else
        this.uploadWithPic()

    } else {

      this.uiUtils.showAlertError(this.dataText.checkAllFields)
    }

    
  } 

  uploadWithPic(){    
    
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)
    loading.present()

    this.storage.uploadPicture(this.base64Image)

      .then(snapshot => {

        snapshot.ref.getDownloadURL().then(url => {
          loading.dismiss()
          this.addContinue(url)
          

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
  
  addContinue(url: string){

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)      
    loading.present();

    this.db.addService(this.name, this.valueStart, url, this.valueMeter, this.dataInfo.userInfo.state, this.type)
      .then( () => {
        this.uiUtils.showAlert(this.dataText.success, this.dataText.addedSuccess).present()
        loading.dismiss()
        this.navCtrl.pop()
      })
  }

  save(){
    

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)      
    loading.present();
    
    this.db.updateService(this.key, this.name, this.valueStart, this.base64Image, this.valueMeter, this.dataInfo.userInfo.state, this.type)
    .then( () => {

      loading.dismiss()
      this.uiUtils.showAlert(this.dataText.success, this.dataText.savedSuccess).present()
      this.navCtrl.pop()
    })  
  }

  goBack(){
    this.navCtrl.pop()
  }

  openMenu() {
    let actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectImage,
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

  handlerCamera(){
    if(! this.dataInfo.isWeb)
      this.grabPicture()
    else
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.unavailable).present()
  }

  handlerGalery(){
    if(! this.dataInfo.isWeb)
      this.accessGallery()
    else
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.unavailable).present()    
  }

  selectPicture(){
      this.openMenu()
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


  edit(data){
    console.log(data)
    this.key = data.payload.key
    this.name = data.payload.val().name
    this.valueStart = data.payload.val().value
    this.valueMeter = data.payload.val().valueMeter
    this.base64Image = data.payload.val().url    

  }
 
  stateChanged(event){

    

  }
}
