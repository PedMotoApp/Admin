import { Component, NgZone, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, ActionSheetController, Platform, NavParams, Events, IonicPage } from 'ionic-angular';
import { CameraProvider } from '../../providers/camera/camera';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { AuthProvider } from '../../providers/auth/auth';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text';

interface Professional {
  uid: string;
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
  cnpj: string;
  carName: string;
  carPlate: string;
  state: string;
  city: string;
  prefixo: string;
  tablePrice: any;
  pix: string;
}

interface TablePrice {
  key: string;
  name: string;
  type: string;
}

@IonicPage()
@Component({
  selector: 'page-professionals-add',
  templateUrl: 'professionals-add.html',
})
export class ProfessionalsAddPage implements OnInit {
  // Propriedades do formulário
  formGroup: FormGroup;
  base64Image: string = '';
  selectedPhoto: any;
  payload: Professional;
  tablesPrices: Observable<any>;
  tableArray: TablePrice[] = [];
  photoChanged: boolean = false;
  uid_: string;
  private activeLoading: any = null;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public authProvider: AuthProvider,
    public actionsheetCtrl: ActionSheetController,
    public uiUtils: UiUtilsProvider,
    public storage: StorageProvider,
    public camera: CameraProvider,
    public navParams: NavParams,
    public zone: NgZone,
    public events: Events,
    public db: DatabaseProvider,
    public auth: AuthProvider,
    public dataText: DataTextProvider,
    private formBuilder: FormBuilder,
    public httpd: HttpdProvider,
    public dataInfo: DataInfoProvider
  ) {}

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

  // Inicializa o formulário com validações
  private initForm(): void {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      complement: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      postCode: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      numero: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(4)]],
      district: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
      tel: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      cnpj: ['', [Validators.minLength(14), Validators.maxLength(14)]],
      selectedService: [''],
      prefixo: [''],
      plate: [''],
      selectedBank: [''],
      agency: [''],
      account: [''],
      pix: [''],
      description: [''],
      tablePrice: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password1: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // Validador personalizado para verificar se as senhas coincidem
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password') && control.get('password').value;
    const password1 = control.get('password1') && control.get('password1').value;
    return password === password1 ? null : { notMatching: true };
  }

  // Inicializa a interface
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

  // Limpa os campos do formulário
  private clear(): void {
    this.formGroup.reset();
    if (this.formGroup.get('state') && this.formGroup.get('state').value !== 'DF') {
      this.formGroup.get('state').setValue('DF');
    }
    this.base64Image = '';
    this.selectedPhoto = null;
    this.photoChanged = false;
    this.tableArray = [];
  }

  // Carrega as informações do profissional para edição
  private loadInfo(): void {
    if (!this.payload) return;

    this.formGroup.patchValue({
      name: this.payload.name,
      lastName: this.payload.lastName,
      state: this.payload.state,
      city: this.payload.city,
      address: this.payload.address,
      cpf: this.payload.cpf,
      tel: this.payload.tel,
      district: this.payload.district,
      numero: this.payload.numero,
      postCode: this.payload.postCode,
      complement: this.payload.complement,
      cnpj: this.payload.cnpj || '',
      selectedService: this.payload.carName || '',
      prefixo: this.payload.prefixo || '',
      plate: this.payload.carPlate || '',
      selectedBank: this.payload.bank || '',
      agency: this.payload.agency || '',
      account: this.payload.account || '',
      pix: this.payload.pix || '',
      description: this.payload.description || '',
      tablePrice: this.payload.tablePrice || ''
    });

    this.uid_ = this.payload.uid;
    this.base64Image = this.payload.photo || '';
    this.stateChanged(this.payload.state || 'DF');
    setTimeout(() => {
      if (this.formGroup.get('city') && this.payload && this.payload.city) {
        this.formGroup.get('city').setValue(this.payload.city);
      }
    }, 1000);
  }

  // Carrega as tabelas de preços disponíveis
  private getServices(): void {
    this.tablesPrices = this.db.getAllTablesPrice();
    this.tablesPrices.subscribe(data => this.getServicesCallback(data));
  }

  private getServicesCallback(data: any[]): void {
    this.tableArray = data
      .map(element => {
        const info = element.payload.val();
        info.key = element.payload.key;
        return info;
      })
      .filter(info => info.type && info.type === 'Profissional');

    setTimeout(() => {
      if (this.payload && this.payload.tablePrice) {
        this.formGroup.get('tablePrice') && this.formGroup.get('tablePrice').setValue(this.payload.tablePrice);
      }
    }, 3000);
  }

  // Foca no próximo campo ao pressionar "Enter"
  focusNext(event: any, nextField: string): void {
    const input = event.target;
    const form = input.closest('form');
    const nextInput = form.querySelector(`[formControlName="${nextField}"]`);
    if (nextInput) {
      nextInput.focus();
    }
  }

  // Salva ou atualiza o profissional
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

  // Realiza o cadastro de um novo profissional
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
    const data = {
      email: this.formGroup.value.email,
      password: this.formGroup.value.password,
      name: this.formGroup.value.name
    };
    this.httpd.apiAddUser(data).subscribe({
      next: (callback) => {
        this.dismissLoading();
        this.addCallback(callback);
      },
      error: (err) => {
        this.dismissLoading();
        this.uiUtils.showAlertError(this.dataText.errorRegister);
      }
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
      this.formGroup.value.password,
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
      2,
      this.formGroup.value.description,
      this.formGroup.value.selectedBank,
      this.formGroup.value.agency,
      this.formGroup.value.account,
      this.formGroup.value.cpf,
      this.formGroup.value.cnpj,
      this.formGroup.value.selectedService,
      this.formGroup.value.plate,
      this.formGroup.value.state,
      this.formGroup.value.city,
      this.formGroup.value.prefixo,
      this.formGroup.value.tablePrice,
      '',
      ''
    ).then(() => {
      this.dismissLoading();
      this.navCtrl.pop();
      this.uiUtils.showAlertSuccess(this.dataText.addedSuccess);
    }).catch(error => {
      this.dismissLoading();
      this.uiUtils.showAlertError(this.dataText.errorRegister);
    });
  }

  private updateFinish(url: string): void {
    this.defaultValues();
    this.db.updateUser(
      this.uid_,
      '',
      this.formGroup.value.name,
      this.formGroup.value.lastName,
      this.formGroup.value.address,
      this.formGroup.value.complement,
      this.formGroup.value.numero,
      this.formGroup.value.postCode,
      this.formGroup.value.district,
      this.formGroup.value.tel,
      url,
      'this.dataInfo.longitude',
      'this.dataInfo.longitude',
      2,
      this.formGroup.value.description,
      this.formGroup.value.selectedBank,
      this.formGroup.value.agency,
      this.formGroup.value.account,
      this.formGroup.value.cpf,
      this.formGroup.value.cnpj,
      this.formGroup.value.selectedService,
      this.formGroup.value.plate,
      this.formGroup.value.state,
      this.formGroup.value.city,
      this.formGroup.value.prefixo,
      this.formGroup.value.tablePrice,
      '',
      '',
      this.formGroup.value.pix
    ).then(() => {
      this.dismissLoading();
      this.uiUtils.showAlertSuccess(this.dataText.savedSuccess);
      this.events.publish('reload-professionals');
      this.navCtrl.pop();
    }).catch(() => {
      this.dismissLoading();
      this.uiUtils.showAlertError(this.dataText.errorRegister9);
    });
  }

  // Define valores padrão para campos opcionais
  private defaultValues(): void {
    const defaultText = this.dataText.notInformade;
    this.formGroup.patchValue({
      description: this.formGroup.value.description || this.dataInfo.titleCompleteDescription,
      selectedService: this.formGroup.value.selectedService && this.formGroup.value.selectedService.length > 0 ? this.formGroup.value.selectedService : defaultText,
      plate: this.formGroup.value.plate && this.formGroup.value.plate.length > 0 ? this.formGroup.value.plate : defaultText,
      cnpj: this.formGroup.value.cnpj && this.formGroup.value.cnpj.length > 0 ? this.formGroup.value.cnpj : defaultText,
      selectedBank: this.formGroup.value.selectedBank && this.formGroup.value.selectedBank.length > 0 ? this.formGroup.value.selectedBank : defaultText,
      agency: this.formGroup.value.agency && this.formGroup.value.agency.length > 0 ? this.formGroup.value.agency : defaultText,
      account: this.formGroup.value.account && this.formGroup.value.account.length > 0 ? this.formGroup.value.account : defaultText,
      prefixo: this.formGroup.value.prefixo && this.formGroup.value.prefixo.length > 0 ? this.formGroup.value.prefixo : defaultText,
      tablePrice: this.formGroup.value.tablePrice || ''
    });
  }

  // Manipulação de imagens
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

  // Manipulação de eventos do formulário
  tableChanged(event: any): void {
    this.formGroup.get('tablePrice') && this.formGroup.get('tablePrice').setValue(event.value);
  }

  stateChanged(state: string): void {
    this.formGroup.get('state') && this.formGroup.get('state').setValue(state);
    // Aqui você pode adicionar lógica para carregar cidades com base no estado, se necessário
  }

  // Validação e mensagens de erro
  private checkErrorField(): void {
    if (this.formGroup.get('name') && this.formGroup.get('name').invalid) {
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

  // Gerenciamento de loading
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