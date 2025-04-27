import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-room',
  templateUrl: 'room.html',
})
export class RoomPage {

  rooms = [];
  ref = firebase.database().ref('chatrooms/');

  constructor(public navCtrl: NavController, 
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,
    public navParams: NavParams) {
      

    this.ref.on('value', resp => {

      this.rooms = [];      
      this.rooms = snapshotToArray(resp);      

    });
  }
 

  ionViewDidLoad() {

    if(this.dataInfo.isHome)
      this.reload()    
    else
      this.navCtrl.setRoot('LoginPage')          
  }

  reload(){

  }

  addRoom() {
    this.navCtrl.push('AddRoomPage');
  }

  

  joinRoom(work) {

    this.navCtrl.push('ChatPage', {
      key:work.key,
      nickname: work.key
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
