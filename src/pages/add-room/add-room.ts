import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'


@IonicPage()
@Component({
  selector: 'page-add-room',
  templateUrl: 'add-room.html',
})
export class AddRoomPage {

  data = { roomname:'' };
  ref = firebase.database().ref('chatrooms/');

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

  }

  addRoom() {
    let newData = this.ref.push();
    newData.set({
      roomname:this.data.roomname
    });
    this.navCtrl.pop();
  }


}
