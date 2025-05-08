import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ClientsPageModule } from '../pages/clients/clients.module';
import { ProfessionalsPageModule } from '../pages/professionals/professionals.module';
import { ProfessionalsAddPageModule } from '../pages/professionals-add/professionals-add.module';



import { LoginPageModule } from '../pages/login/login.module';
import { HistoryPageModule } from '../pages/history/history.module';
import { ClientsAddPageModule } from '../pages/clients-add/clients-add.module';
import { TablesPricePageModule } from '../pages/tables-price/tables-price.module';
import { TablesPriceAddPageModule } from '../pages/tables-price-add/tables-price-add.module';
import { RegisterPageModule } from '../pages/register/register.module';
import { DocumentationPageModule } from '../pages/documentation/documentation.module';
import { StorageProvider } from '../providers/storage/storage';
import { DatabaseProvider } from '../providers/database/database';
import { UiUtilsProvider } from '../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../providers/data-info/data-info';
import { AuthProvider } from '../providers/auth/auth';
import { Camera } from '@ionic-native/camera';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpdProvider } from '../providers/httpd/httpd';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CameraProvider } from '../providers/camera/camera';
import { FcmProvider } from '../providers/fcm/fcm'; 
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { AudioUtilsProvider } from '../providers/audio-utils/audio-utils';
import { Firebase } from '@ionic-native/firebase';
import { MessagingService } from '../shared/scripts/messaging.service';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { GoogleApiProvider } from '../providers/google-api/google-api';
import { SocialSharing } from '@ionic-native/social-sharing';
import { IonicStorageModule } from '@ionic/storage';

import { Ionic2RatingModule } from 'ionic2-rating';
import { Geolocation } from '@ionic-native/geolocation';
import {firebaseConfig} from '../assets/configs/firebase.js'
import { DataTextProvider } from '../providers/data-text/data-text';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,  
    HomePage
  ],  
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    BrowserAnimationsModule,        
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFireAuthModule,
    IonicModule.forRoot(MyApp),    
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  exports: [    
    ClientsPageModule,
    ProfessionalsPageModule,
    LoginPageModule,
    DocumentationPageModule,
    HistoryPageModule,  
    TablesPricePageModule,
    TablesPriceAddPageModule,    
    ClientsAddPageModule,
    ProfessionalsAddPageModule,
    RegisterPageModule
  ],

  providers: [    
    DatabaseProvider,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UiUtilsProvider,
    DataInfoProvider,
    AuthProvider,
    HttpdProvider,
    StorageProvider,
    CameraProvider,
    AudioUtilsProvider,
    FcmProvider,
    Firebase,
    NativeAudio,
    MessagingService, 
    SocialSharing,
    InAppBrowser,
    GoogleApiProvider,
    Ionic2RatingModule,
    Geolocation,
    DataTextProvider

    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
