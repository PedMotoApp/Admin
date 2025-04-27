import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';

import { Firebase } from '@ionic-native/firebase';
import { DatabaseProvider } from '../../providers/database/database';
import { MessagingService } from "../../shared/scripts/messaging.service";
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { AuthProvider } from '../../providers/auth/auth';
import { tap } from 'rxjs/operators';
import { AudioUtilsProvider } from '../../providers/audio-utils/audio-utils';

@Injectable()
export class FcmProvider {

  private message;

  constructor(    
    public firebaseNative: Firebase,
    private messagingService: MessagingService,
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,
    public authProvider: AuthProvider,
    public audioUtils: AudioUtilsProvider,

    public events: Events,    		    
    private platform: Platform) {

      this.audioUtils.preload('tabSwitch', 'assets/audio/ding.mp3');

  } 

  ngOnDestroy() {
    this.firebaseNative.unsubscribe("")
  }

  async getToken() {              
    let token;

    if (this.platform.is('android')) {
      token = await this.firebaseNative.getToken()
    } 
  
    else if (this.platform.is('ios')) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    } 
   
    return token
  }  
  
  public saveToken(token) {
    if (!token) return; 
    this.db.saveToken(token)
  }

  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen()
  }

  public startMobile(){

    this.firebaseNative.getToken()
    .then(token=> {				

      this.dataInfo.setToken(token)

    }) 
    .catch(error => console.error(error));
    
   this.listenToNotifications().pipe(
      tap(msg => {
                
        console.log("Evento Recebido", msg)     
           
        this.events.publish(this.dataInfo.eventFcmToken, msg)        
      })
    )
    .subscribe()
  }

  public startPWA(){    

    const userId = this.authProvider.currentUserUid();
    
    this.messagingService.requestPermission(userId)
    this.messagingService.receiveMessage()
    this.message = this.messagingService.currentMessage       

    console.log("Iniciando fire messaging: ", userId)
  }

  handleDataNative(payload){
    
    console.log("Notificação recebida: " + payload.data.type)    
    console.log("Payload", payload.data)  

    this.audioUtils.play('tabSwitch');
  }
	
 
}
