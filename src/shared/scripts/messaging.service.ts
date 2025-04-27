import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
import { Events } from 'ionic-angular';

@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  currentToken;
  subToken: any

  constructor(
    private angularFireMessaging: AngularFireMessaging, public events: Events) {

    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    )
  }  

  ngOnDestroy(){

    this.subToken.unsubscribe()
  }
  
  requestPermission(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        
        this.currentToken = token
        this.events.publish('fcm:netToken', this.currentToken)
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log("Nova mensagem recebida: ", payload);
        
        this.events.publish('fcm:newMsg', payload)
        this.currentMessage.next(payload);
      })
  }

  onNewToken(){
    
  }
}