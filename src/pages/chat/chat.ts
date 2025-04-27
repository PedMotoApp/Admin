import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import * as firebase from 'firebase';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'
import * as moment from 'moment';


@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content;

  data = { type:'', nickname:'', message:'' };
  chats = [];
  roomkey:string;
  nickname:string;
  offStatus:boolean = false;

  constructor(public navCtrl: NavController, 
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,
    public navParams: NavParams) {   
  }

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.reload()    
    else
      this.navCtrl.setRoot('LoginPage')          
  }




  reload(){

    this.roomkey = this.navParams.get("key") as string;
    this.nickname = this.navParams.get("nickname") as string;
    this.data.type = 'message';
    this.data.nickname = this.nickname;



    let joinData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    
    joinData.set({
      type:'join',
      user:this.nickname,
      message:this.nickname+' entrou na sala.',
      sendDate: moment().format("DD/MM/YYYY hh:mm:ss")
    });
    this.data.message = '';

    firebase.database().ref('chatrooms/'+this.roomkey+'/chats').on('value', resp => {
      this.chats = [];
  
      this.chats = snapshotToArray(resp);
      
      this.goBottom()
    });

  }

  goBottom(){

    setTimeout(() => {
      if(this.offStatus === false) {
        this.content.scrollToBottom(300);
      }
    }, 1000);
  }

  sendMessage() {
    let newData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    newData.set({
      type:this.data.type,
      user:this.data.nickname,
      message:this.data.message,
      sendDate: moment().format("DD/MM/YYYY hh:mm:ss")
    });
    this.data.message = '';

    this.goBottom()
  }

  exitChat() {
    let exitData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    exitData.set({
      type:'exit',
      user:this.nickname,
      message:this.nickname+' saiu da sala.',
      sendDate: moment().format("DD/MM/YYYY hh:mm:ss")
    });

    this.offStatus = true;

    this.navCtrl.setRoot('RoomPage', {
      nickname:this.nickname
    });
  }

}


export const snapshotToArray = snapshot => {
  let returnArr = [];

  snapshot.forEach(childSnapshot => {
      let item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};

