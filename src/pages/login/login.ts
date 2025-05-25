import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { AuthProvider } from '../../providers/auth/auth';
import { HomePage } from '../../pages/home/home';
import firebase from 'firebase/app';
import 'firebase/auth';
import { DatabaseProvider } from '../../providers/database/database';
import { Storage } from '@ionic/storage';

import { DataTextProvider } from '../../providers/data-text/data-text';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  userConfig: any;
  autoLogin: Boolean = true;
  username: string;
  password: string;
  languageSelected: number = 0;

  constructor(
    public navCtrl: NavController,
    public dataInfo: DataInfoProvider,
    public uiUtils: UiUtilsProvider,
    public authProvider: AuthProvider,
    public storage: Storage,
    public navParams: NavParams,
    public dataText: DataTextProvider,
    public db: DatabaseProvider
  ) {
    this.startInterface();
  }

  ionViewDidLoad() {
    var self = this;
    this.autoLogin = this.navParams.get("autoLogin");

    if (this.autoLogin == undefined) this.autoLogin = true;

    if (this.autoLogin) {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) self.goHome();
      });
    }

    // this.loginDev()
  }

  loginDev() {
    this.username = "cliente@gmail.com";
    this.password = "123456";
    //this.dataInfo.isHome= true
    this.loginUser();
  }

  goHome() {
    this.userConfig = this.db.getUser().subscribe((data) => {
      this.goPageHomeUserContinue(data);
      this.userConfig.unsubscribe();
    });
  }

  goPageHomeUserContinue(data) {
    data.forEach((element) => {
      this.dataInfo.userInfo = element.payload.val();
      this.dataInfo.userType = element.payload.val().userType;
    });

    if (this.dataInfo.userInfo) {
      this.dataInfo.userInfo.state = "DF"
      this.dataInfo.userInfo.defaultState = "DF"
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

        this.navCtrl.setRoot(HomePage);
        ///  this.goPageDev()
      } else this.uiUtils.showAlertError("Usuário não localizado ou senha incorreta");
    }
  }

  goPageDev() {
    setTimeout(() => {
      // this.navCtrl.setRoot('RegionsPage');
    }, 1000);
  }

  startInterface() {
    this.storage.get("default-state").then((data) => {
      if (data) this.dataInfo.defaultState = data;
    }).then(() => {
      this.changeBanks();
    });
  }

  loginUser(): void {
    if (!this.username || this.username.length < 6) {
      this.uiUtils.showAlert(this.dataText.warning, this.dataInfo.titleUsernameMinLenght).present();
    } else if (!this.password || this.password.length < 6) {
      this.uiUtils.showAlert(this.dataText.warning, this.dataInfo.titlePasswordMinLenght).present();
    } else {
      this.loginContinue(this.username.trim(), this.password.trim());
    }
  }

  loginContinue(email, pass) {
    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait);
    loading.present();
    var self = this;

    this.authProvider.loginUser(email, pass).then(
      () => {
        loading.dismiss();
        self.goHome();
      },
      (error) => {
        loading.dismiss().then(() => {
          self.uiUtils.showAlert(this.dataText.warning, this.dataInfo.titleAuthError).present();
        });
      }
    );
  }

  goToSignup(): void {
    this.navCtrl.push("SignupPage");
  }

  goToResetPassword(): void {
    if (this.username.length > 0) {
      this.authProvider.resetPassword(this.username).then(
        () => {
          this.uiUtils.showAlert(this.dataText.warning, this.dataInfo.titleCheckMailbox).present();
        },
        (error) => {
          this.uiUtils.showAlert(this.dataText.warning, this.dataInfo.titleAuthRecoveryError).present();
        }
      );
    } else this.uiUtils.showAlert(this.dataText.warning, this.dataInfo.titleAuthRecoveryError).present();
  }

  selectedStateChanged() {}

  languageChanged() {
    this.languageSelected === 0 ? (this.languageSelected = 1) : (this.languageSelected = 0);
    this.dataText.languageSelected = this.languageSelected;

    this.storage.set("language", this.dataText.languageSelected).then(() => {
      if (this.dataText.languageSelected === 1) {
        this.dataInfo.defaultState = "DF";
        this.dataText.translateEnglish();
      } else this.dataText.translatePortuguese();
    }).then(() => {
      this.changeBanks();
    });
  }

  changeBanks() {
    this.storage.get("language").then((data) => {
      if (data) {
        this.languageSelected = <number>data;
        this.languageSelected === 0 ? this.dataInfo.changeBanksBr() : this.dataInfo.changeBanksScotland();
      } else {
        this.languageSelected = 0;
        this.dataInfo.changeBanksBr();
      }
    });
  }
}
