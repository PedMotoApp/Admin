import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ActionSheetController, Platform, NavParams, Events } from 'ionic-angular';
import { CameraProvider } from '../../providers/camera/camera';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable, Subscription } from 'rxjs';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataTextProvider } from '../../providers/data-text/data-text';
import * as moment from 'moment';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { firebaseConfig } from '../../assets/configs/firebase';

interface Client {
  uid: string;
  razaoSocial: string;
  cnpj: string;
  name: string;
  lastName: string;
  address: string;
  complement: string;
  numero: string;
  postCode: string;
  district: string;
  tel: string;
  photo: string;
  description: string;
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  carName: string;
  carPlate: string;
  state: string;
  city: string;
  prefixo: string;
  tablePrice: any;
}

interface TablePrice {
  key: string;
  name: string;
  type: string;
}

@IonicPage()
@Component({
  selector: 'page-clients-add',
  templateUrl: 'clients-add.html',
})
export class ClientsAddPage implements OnInit {
  formGroup: FormGroup;
  base64Image: string = '';
  selectedPhoto: any;
  payload: Client;
  tablesPrices: Observable<any>;
  tableArray: TablePrice[] = [];
  photoChanged: boolean = false;
  state_: string = 'RJ';
  city_: string = 'Rio de Janeiro';
  citiesArray: any[] = [];
  uid_: string = '';
  private subscriptions: Subscription[] = [];
  private activeLoading: any = null;
  private secondaryAuth: firebase.auth.Auth;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public actionsheetCtrl: ActionSheetController,
    public uiUtils: UiUtilsProvider,
    public storage: StorageProvider,
    public camera: CameraProvider,
    public navParams: NavParams,
    public events: Events,
    public db: DatabaseProvider,
    private formBuilder: FormBuilder,
    public auth: AuthProvider,
    public httpd: HttpdProvider,
    public dataText: DataTextProvider,
    public dataInfo: DataInfoProvider
  ) {
    const secondaryApp = firebase.initializeApp(firebaseConfig, 'secondary');
    this.secondaryAuth = secondaryApp.auth();
  }

  ngOnInit(): void {
    this.initForm();
  }

  ionViewDidLoad(): void {
    if (this.dataInfo.isHome) {
      this.startInterface();
    } else {
      this.navCtrl.setRoot('LoginPage');
    }
  }

  ionViewDidLeave(): void {
    if (this.activeLoading) {
      this.activeLoading.dismiss();
      this.activeLoading = null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private initForm(): void {
    this.formGroup = this.formBuilder.group({
      razaoSocial: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cnpj: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      complement: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      postCode: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      numero: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      district: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      tel: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      tablePrice: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password1: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password') && control.get('password').value;
    const password1 = control.get('password1') && control.get('password1').value;
    return password === password1 ? null : { notMatching: true };
  }

  private startInterface(): void {
    this.clear();
    this.payload = this.navParams.get('payload');
    if (this.formGroup.get('state') && this.dataInfo.defaultState) {
      this.formGroup.get('state').setValue(this.dataInfo.defaultState);
      this.stateChanged(this.dataInfo.defaultState);
    }
    this.getServices();

    if (this.payload) {
      this.loadInfo();
    }
  }

  private clear(): void {
    this.formGroup.reset();
    if (this.formGroup.get('state') && this.formGroup.get('state').value !== 'RJ') {
      this.formGroup.get('state').setValue('RJ');
    }
    if (this.formGroup.get('city') && this.formGroup.get('city').value !== 'Rio de Janeiro') {
      this.formGroup.get('city').setValue('Rio de Janeiro');
    }
    this.base64Image = '';
    this.selectedPhoto = null;
    this.photoChanged = false;
    this.tableArray = [];
    this.uid_ = '';
  }

  private loadInfo(): void {
    // Adicionar log para depurar o valor de payload.state
    console.log('Valor de payload.state ao carregar:', this.payload.state);

    // Garantir que o valor seja uma string
    const stateValue = typeof this.payload.state === 'string' ? this.payload.state : 'RJ';
    const cityValue = typeof this.payload.city === 'string' ? this.payload.city : 'Rio de Janeiro';

    this.formGroup.patchValue({
      razaoSocial: this.payload.razaoSocial,
      cnpj: this.payload.cnpj,
      name: this.payload.name,
      lastName: this.payload.lastName,
      address: this.payload.address,
      state: stateValue,
      city: cityValue,
      cpf: this.payload.cpf,
      tel: this.payload.tel,
      district: this.payload.district,
      numero: this.payload.numero,
      postCode: this.payload.postCode,
      complement: this.payload.complement,
      tablePrice: this.payload.tablePrice || ''
    });

    this.base64Image = this.payload.photo || '';
    this.state_ = stateValue;
    this.city_ = cityValue;
    this.stateChanged(this.state_);
    this.uid_ = this.payload.uid || '';
  }

  private getServices(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    this.tablesPrices = this.db.getAllTablesPrice();
    const sub = this.tablesPrices.subscribe({
      next: (data) => {
        this.getServicesCallback(data);
      },
      error: (err) => {
        console.error('Erro ao carregar tabelas de preços:', err);
        this.uiUtils.showAlertError('Erro ao carregar tabelas de preços.');
      }
    });
    this.subscriptions.push(sub);
  }

  private getServicesCallback(data: any[]): void {
    this.tableArray = data
      .map(element => {
        const info: TablePrice = {
          key: element.payload.key,
          name: element.payload.val().name,
          type: element.payload.val().type
        };
        return info;
      })
      .filter(info => info.type && info.type === 'Cliente');

    setTimeout(() => {
      if (this.payload && this.payload.tablePrice) {
        this.formGroup.get('tablePrice') && this.formGroup.get('tablePrice').setValue(this.payload.tablePrice);
      }
    }, 3000);
  }

  focusNext(event: any, nextField: string): void {
    const input = event.target;
    const form = input.closest('form');
    const nextInput = form.querySelector(`[formControlName="${nextField}"]`);
    if (nextInput) {
      nextInput.focus();
    }
  }

  save(): void {
    if (this.formGroup.valid) {
      this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure).then(result => {
        if (result) {
          this.update();
        }
      });
    } else {
      this.checkErrorField();
    }
  }

  signUp(): void {
    if (this.formGroup.valid) {
      this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure).then(result => {
        if (result) {
          this.signupContinue();
        }
      });
    } else {
      this.checkErrorField();
    }
  }

  private signupContinue(): void {
    if (this.base64Image && this.photoChanged) {
      this.uploadWithPic();
    } else {
      this.uploadFinish(this.base64Image || '');
    }
  }

  private update(): void {
    if (this.base64Image && this.photoChanged) {
      this.uploadWithPic();
    } else {
      this.uploadFinish(this.base64Image || '');
    }
  }

  private uploadWithPic(): void {
    this.showLoading(this.dataInfo.titleUploading);
    this.storage.uploadPicture(this.base64Image).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        this.uploadFinish(url);
        this.dismissLoading();
      }).catch(err => {
        this.dismissLoading();
        this.uiUtils.showAlert(this.dataText.warning, err).present();
      });
    }).catch(error => {
      this.dismissLoading();
      this.uiUtils.showAlert(this.dataText.warning, error).present();
    });
  }

  private uploadFinish(url: string): void {
    this.showLoading(this.uid_ ? this.dataInfo.titleUploading : this.dataText.pleaseWait);
    if (this.uid_) {
      this.updateFinish(url);
    } else {
      this.addFinish(url);
    }
  }

  private addFinish(url: string): void {
    const email = this.formGroup.value.email;
    const password = this.formGroup.value.password;
    this.showLoading(this.dataText.pleaseWait);
    this.secondaryAuth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        this.dismissLoading();
        this.addCallback({ success: true, uid: userCredential.user.uid });
      })
      .catch(err => {
        this.dismissLoading();
        console.error('Erro ao criar usuário no Firebase Auth:', err);
        this.uiUtils.showAlertError(this.dataText.errorRegister + ': ' + err.message);
      });
  }

  private addCallback(data: any): void {
    if (data.success) {
      this.savedOk(data);
    } else {
      this.uiUtils.showAlertError(this.dataText.errorRegister);
    }
  }

  private savedOk(data: any): void {
    this.showLoading(this.dataText.pleaseWait);
    this.defaultValues();
    this.db.addUserStart(
      data.uid,
      this.formGroup.value.razaoSocial,
      this.formGroup.value.name,
      this.formGroup.value.lastName,
      this.formGroup.value.address,
      this.formGroup.value.complement,
      this.formGroup.value.numero,
      this.formGroup.value.postCode,
      this.formGroup.value.district,
      this.formGroup.value.tel,
      '',
      this.formGroup.value.email,
      1,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.formGroup.value.cpf,
      this.formGroup.value.cnpj,
      this.formGroup.value.state,
      this.formGroup.value.city,
      this.formGroup.value.tablePrice,      
    ).then(() => {
      return this.db.updateUserStatus(data.uid, 'Perfil não verificado');
    }).then(() => {
      return this.db.updateRankingUser(data.uid, 'Bronze');
    }).then(() => {
      this.dismissLoading();
      this.navCtrl.pop();
      this.uiUtils.showAlertSuccess(this.dataText.addedSuccess);
    }).catch(error => {
      this.dismissLoading();
      console.error('Erro ao salvar perfil do usuário:', error);
      this.uiUtils.showAlertError(this.dataText.errorRegister);
    });
  }

  private updateFinish(url: string): void {
    this.defaultValues();
    this.db.updateUser(
      this.uid_,
      this.formGroup.value.razaoSocial,
      this.formGroup.value.name,
      this.formGroup.value.lastName,
      this.formGroup.value.address,
      this.formGroup.value.complement,
      this.formGroup.value.numero,
      this.formGroup.value.postCode,
      this.formGroup.value.district,
      this.formGroup.value.tel,
      url,
      this.dataInfo.latitude,
      this.dataInfo.longitude,
      1,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.dataText.notInformade,
      this.formGroup.value.cpf,
      this.formGroup.value.cnpj,
      this.formGroup.value.state,
      this.formGroup.value.city,
      this.formGroup.value.tablePrice,      
    ).then(() => {
      this.dismissLoading();
      this.uiUtils.showAlertSuccess(this.dataText.savedSuccess);
      this.navCtrl.pop();
    }).catch(error => {
      this.dismissLoading();
      this.uiUtils.showAlertError(this.dataText.errorRegister9);
    });
  }

  private defaultValues(): void {
    const defaultText = this.dataText.notInformade;
    this.formGroup.patchValue({
      razaoSocial: this.formGroup.value.razaoSocial || defaultText,
      cnpj: this.formGroup.value.cnpj || defaultText,
      tablePrice: this.formGroup.value.tablePrice || ''
    });
  }

  selectPicture(): void {
    if (this.platform.is('cordova')) {
      this.openMenu();
    } else {
      this.uploadFromWeb();
    }
  }

  private openMenu(): void {
    const actionSheet = this.actionsheetCtrl.create({
      title: this.dataInfo.titleChangePic,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Camera',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'camera' : null,
          handler: () => this.grabPicture()
        },
        {
          text: 'Album',
          icon: !this.platform.is('ios') ? 'albums' : null,
          handler: () => this.accessGallery()
        },
        {
          text: this.dataText.cancel,
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        }
      ]
    });
    actionSheet.present();
  }

  private grabPicture(): void {
    this.showLoading(this.dataInfo.pleaseWait);
    this.camera.grabPicture().then(imageData => {
      this.selectedPhoto = this.dataInfo.dataURItoBlob('data:image/jpeg;base64,' + imageData);
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photoChanged = true;
      this.dismissLoading();
    }).catch(err => {
      this.dismissLoading();
      this.uiUtils.showAlert(this.dataText.warning, "Permitir camera").present();
    });
  }

  private accessGallery(): void {
    this.camera.getPicture().then(imageData => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photoChanged = true;
    }).catch(err => {
      console.error('Erro ao acessar a galeria:', err);
      this.uiUtils.showAlert(this.dataText.warning, "Permitir acesso camera").present();
    });
  }

  private uploadFromWeb(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.base64Image = e.target.result;
          this.photoChanged = true;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  delPicture(): void {
    this.base64Image = '';
    this.selectedPhoto = null;
    this.photoChanged = false;
  }

  tableChanged(event: any): void {
    this.formGroup.get('tablePrice') && this.formGroup.get('tablePrice').setValue(event.value);
  }

  stateChanged(event: any): void {
    // No Ionic 3, o valor do <ion-input> está em event.value
    const stateValue = event.value || (typeof event === 'string' ? event : 'RJ');
    this.formGroup.get('state') && this.formGroup.get('state').setValue(stateValue);
  }

  fillRandomValues(): void {
    const randomString = (length: number) => Math.random().toString(36).substring(2, 2 + length);
    const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomCPF = () => Array(11).fill(0).map(() => randomNumber(0, 9)).join('');
    const randomCNPJ = () => Array(14).fill(0).map(() => randomNumber(0, 9)).join('');
    const randomPhone = () => `119${randomNumber(10000000, 99999999)}`;
    const randomEmail = () => `test${randomString(5)}@example.com`;

    this.formGroup.patchValue({
      razaoSocial: 'Empresa ' + randomString(5),
      cnpj: randomCNPJ(),
      name: 'Cliente' + randomString(5),
      lastName: 'Sobrenome' + randomString(5),
      address: 'Rua Exemplo ' + randomNumber(100, 999),
      complement: 'Apto ' + randomNumber(1, 100),
      postCode: '12345678',
      numero: randomNumber(1, 9999).toString(),
      district: 'Bairro Teste',
      cpf: randomCPF(),
      state: 'RJ',
      city: 'Rio de Janeiro',
      tel: randomPhone(),
      tablePrice: this.tableArray[0] || '',
      email: randomEmail(),
      password: '123456',
      password1: '123456'
    });
  }

  private checkErrorField(): void {
    if (this.formGroup.get('razaoSocial') && this.formGroup.get('razaoSocial').invalid) {
      this.uiUtils.showAlertError('Favor informar a razão social');
    } else if (this.formGroup.get('cnpj') && this.formGroup.get('cnpj').invalid) {
      this.uiUtils.showAlertError('Favor informar o CNPJ');
    } else if (this.formGroup.get('name') && this.formGroup.get('name').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister10);
    } else if (this.formGroup.get('lastName') && this.formGroup.get('lastName').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister11);
    } else if (this.formGroup.get('address') && this.formGroup.get('address').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister12);
    } else if (this.formGroup.get('complement') && this.formGroup.get('complement').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister13);
    } else if (this.formGroup.get('numero') && this.formGroup.get('numero').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister14);
    } else if (this.formGroup.get('postCode') && this.formGroup.get('postCode').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister15);
    } else if (this.formGroup.get('district') && this.formGroup.get('district').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister16);
    } else if (this.formGroup.get('tel') && this.formGroup.get('tel').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister17);
    } else if (this.formGroup.get('state') && this.formGroup.get('state').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister18);
    } else if (this.formGroup.get('city') && this.formGroup.get('city').invalid) {
      this.uiUtils.showAlertError(this.dataText.errorRegister19);
    } else if (!this.uid_ && (
      (this.formGroup.get('email') && this.formGroup.get('email').invalid) ||
      (this.formGroup.get('password') && this.formGroup.get('password').invalid) ||
      (this.formGroup.get('password1') && this.formGroup.get('password1').invalid)
    )) {
      this.uiUtils.showAlertError(this.dataText.checkAllFields);
    } else {
      this.uiUtils.showAlertError(this.dataText.checkAllFields);
    }
  }

  private showLoading(message: string): void {
    if (this.activeLoading) {
      this.activeLoading.dismiss();
    }
    this.activeLoading = this.uiUtils.showLoading(message);
    this.activeLoading.present();
  }

  private dismissLoading(): void {
    if (this.activeLoading) {
      this.activeLoading.dismiss();
      this.activeLoading = null;
    }
  }
}