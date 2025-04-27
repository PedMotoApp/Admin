import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AuthProvider } from '../../providers/auth/auth';
import * as moment from 'moment';

@Injectable()
export class StorageProvider {

  picturePath: string;
  client: string;  
  pathFinal: string;

  constructor(public authProvider: AuthProvider) {
    console.log('Hello StorageProvider Provider');

    this.client = 'Boa_Vista'
    this.picturePath = this.authProvider.currentUserUid() + '.jpg'
    this.pathFinal = '/fotos/'
  }

  getUploadedPhotoUrl() {
    return firebase.storage().ref(this.pathFinal).child(this.picturePath).getDownloadURL()     
  }  

  uploadPicture(selected) {
    this.picturePath = this.authProvider.currentUserUid() + moment().format("YYYYHHDDhhmmss") + '.jpg'
    return firebase.storage().ref(this.pathFinal).child(this.picturePath).putString(selected, 'data_url')
  }
  
  removePicture(url) {    
     console.log(url)
     return firebase.storage().ref(this.pathFinal).child(url).delete()
  }

  

}