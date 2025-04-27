import { AlertController, LoadingController  } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'


@Injectable()
export class UiUtilsProvider {

  constructor(public alertCtrl: AlertController, 
    public toastCtrl: ToastController,
    public dataText: DataTextProvider,  
    public dataInfo: DataInfoProvider,
    public loadingCtrl: LoadingController) {
    
  }

  showLoading(title: string){
    let loading = this.loadingCtrl.create({
      content: title
    });

    return loading
  }

  showAlert(title_: string, subtitle_: string) {
    
    let alert = this.alertCtrl.create({
      title: title_,
      subTitle: subtitle_,
      buttons: ['OK']
    });
    
    return alert
  }

  showConfirm(title_: string, subtitle_: string): Promise<boolean> {
    return new Promise((resolve, reject) =>{
      this.alertCtrl.create({
        title: title_,
        message: subtitle_,
        buttons: [{
            text: 'Não',
            handler:_=> resolve(false)            
          },
          {
            text: 'Sim',
            handler:_=> resolve(true)
          }
        ]
      }).present()
  })
    
  }

  showToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 4000,
      position: 'bottom'
    });

    toast.present(toast);
  }

  showAlertSuccess(msg: string){
    return this.showAlertTimeout(this.dataText.success, msg)
  }

  showAlertError(msg: string){
    
    this.showAlertTimeout(this.dataText.warning, msg)
  }

  showAlertTimeout(title: string, msg: string){
    let alert = this.showAlert(title, msg)
      
    return alert.present()
    .then( () => {
      setTimeout(function(){
        alert.dismiss();
      }, 3000);        
    })
  }  

}

