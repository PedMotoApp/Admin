import { Camera, CameraOptions } from '@ionic-native/camera';
import { Injectable } from '@angular/core';

@Injectable()
export class CameraProvider {

  currentImage: string

  constructor(public camera: Camera) {
    console.log('Hello CameraProvider Provider');
  }

  grabPicture() {

    const options: CameraOptions = {
      quality: 100,
      targetHeight: 200,
      targetWidth: 200,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    return this.camera.getPicture(options)
   }

   getPath(){
     return this.camera.DestinationType.FILE_URI
   }

   getPicture(){
    return this.camera.getPicture({
        sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
        destinationType: this.camera.DestinationType.DATA_URL

     })
    }

    getAlbum(){
      const options: CameraOptions = {
        quality: 100,
        targetHeight: 200,
        targetWidth: 200,
        destinationType: this.camera.DestinationType.DATA_URL,
        mediaType: this.camera.MediaType.ALLMEDIA
      }
  
      return this.camera.getPicture(options)
      }

}