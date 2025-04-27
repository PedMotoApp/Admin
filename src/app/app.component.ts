import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';
import { TranslateService } from '@ngx-translate/core';
import { FcmProvider } from '../providers/fcm/fcm';
import { AudioUtilsProvider } from '../providers/audio-utils/audio-utils';
import { DataInfoProvider } from '../providers/data-info/data-info'
import { AuthProvider } from '../providers/auth/auth'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any = LoginPage;

  constructor(platform: Platform, 
    public fcm: FcmProvider,
    public events: Events,
    public audioUtils: AudioUtilsProvider,
    public dataInfo: DataInfoProvider,
    public auth: AuthProvider,

    private translate: TranslateService) {

    platform.ready().then(() => {
      
      this.startInterface()    
    });
  }

  startInterface(){
    this.initTranslate()
    this.audioUtils.preload('tabSwitch', 'assets/audio/ding.mp3');
    this.subscribeStuff()
    
  }

  subscribeStuff(){

    this.events.subscribe(this.dataInfo.eventFcmNew, payload => {			
			this.newMsg(payload)								
    });
    
    this.events.subscribe('logout', () => {			
			this.logout()				
		});

		this.events.subscribe(this.dataInfo.eventFcmStart, () => {		

			if(! this.dataInfo.isFcmStarted){
				this.dataInfo.isFcmStarted = true
				this.startNotifications()	
			}			
    });    
  }

  startNotifications(){		
		if(this.dataInfo.isWeb)
			this.fcm.startPWA()
		else 
		   this.fcm.startMobile()		
	}

  newMsg(payload_){		
    // console.log(payload_)
		// this.audioUtils.play('tabSwitch');
	}

  initTranslate() {
    
    this.translate.setDefaultLang('pt-br');
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        this.translate.use(this.translate.getBrowserLang());
      }
    } else {
      this.translate.use('pt-br'); 
    }
  }
  
  logout(){		
    
    this.auth.logoutUser()
    .then(() => {

      let autologin = false
		  this.nav.setRoot('LoginPage', { autoLogin: autologin })

    })
		
	}
}
