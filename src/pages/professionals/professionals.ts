import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Platform, Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataTextProvider } from '../../providers/data-text/data-text';
import { DocumentationPage } from '../../pages/documentation/documentation';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment';

// Interface para tipagem dos dados dos trabalhadores
interface Worker {
  key: string;
  name: string;
  email: string;
  status: string;
  ranking: string;
  photo?: string;
  tablePrice?: { name: string };
  datetime?: string;
  lastDatetime?: string;
  lastDatetimeStr?: string;
  address?: string;
  tel?: string;
  pix?: string;
  token?: string;
  totalWorks?: number;
  denuncia?: number;
  region?: string;
  userType?: number;
  uid?: string;
  showDetails?: boolean; // Adicionado para controlar a expansão dos detalhes
}

@IonicPage()
@Component({
  selector: 'page-professionals',
  templateUrl: 'professionals.html',
})
export class ProfessionalsPage {
  usersWorkers: Observable<any>;
  usersWorkersArray: Worker[] = [];
  workInfo: any;
  worker: Worker | null = null;
  searchTerm: string = '';
  searching: boolean = false;
  select: boolean = false;
  orderType: string = '1';

  private subscriptions: Subscription[] = [];
  private activeLoading: any = null;

  constructor(
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,
    public dataInfo: DataInfoProvider,
    public platform: Platform,
    public db: DatabaseProvider,
    public events: Events,
    public httpd: HttpdProvider,
    public actionsheetCtrl: ActionSheetController,
    public dataText: DataTextProvider,
    public navParams: NavParams
  ) {}

  ionViewDidLoad(): void {
    if (this.dataInfo.isHome) {
      this.startInterface();
    } else {
      this.navCtrl.setRoot('LoginPage');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.events.unsubscribe('update');
    this.events.unsubscribe('reload-professionals');
    if (this.activeLoading) {
      this.activeLoading.dismiss();
      this.activeLoading = null;
    }
  }

  private startInterface(): void {
    this.events.subscribe('reload-professionals', () => this.reload());
    this.events.subscribe('update', (payload: { userType: number }) => {
      if (payload.userType === 2) {
        this.reload();
      }
    });

    this.select = this.navParams.get('select') || false;
    this.workInfo = this.navParams.get('workInfo');

    this.getDenuncias();
    this.reload();
  }

  private reload(): void {
    if (this.activeLoading) {
      this.activeLoading.dismiss();
    }

    const loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations);
    loading.present();
    this.activeLoading = loading;

    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    this.usersWorkers = this.db.getWorkers();
    const sub = this.usersWorkers.subscribe({
      next: (data) => {
        this.reloadCallback(data);
        if (this.select) {
          this.uiUtils.showToast(this.dataText.selectProfessional);
        }
        if (this.activeLoading) {
          this.activeLoading.dismiss();
          this.activeLoading = null;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar trabalhadores:', err);
        this.uiUtils.showAlertError('Erro ao carregar dados dos profissionais.');
        if (this.activeLoading) {
          this.activeLoading.dismiss();
          this.activeLoading = null;
        }
      }
    });
    this.subscriptions.push(sub);
  }

  private reloadCallback(data: any[]): void {
    this.usersWorkersArray = [];

    data.forEach(element => {
      const payloadVal = element.payload.val();
      const info: Worker = {
        key: element.payload.key,
        name: payloadVal.name,
        email: payloadVal.email,
        status: payloadVal.status,
        ranking: payloadVal.ranking,
        photo: payloadVal.photo,
        tablePrice: payloadVal.tablePrice,
        datetime: payloadVal.datetime,
        lastDatetime: payloadVal.lastDatetime,
        lastDatetimeStr: payloadVal.lastDatetime
          ? moment(payloadVal.lastDatetime).format('DD/MM/YYYY hh:mm:ss')
          : undefined,
        address: payloadVal.address,
        tel: payloadVal.tel,
        pix: payloadVal.pix,
        token: payloadVal.token,
        totalWorks: payloadVal.totalWorks,
        denuncia: payloadVal.denuncia,
        region: payloadVal.region,
        userType: payloadVal.userType,
        uid: payloadVal.uid,
        showDetails: false // Inicialmente, os detalhes estão ocultos
      };

      if (!info.name) {
        info.name = info.email;
      }

      if (info.userType === 2 && info.status !== 'Desativado' && info.status !== 'Removido') {
        this.addArray(info);
      }
    });

    this.checkOrder();
  }

  private addArray(element: Worker): void {
    if (element.datetime) {
      element.datetime = moment(element.datetime).format('DD/MM/YYYY hh:mm:ss');
    }
    if (element.lastDatetime) {
      element.lastDatetime = moment(element.lastDatetime).format('DD/MM/YYYY hh:mm:ss');
    }

    if (this.worker && this.worker.name === element.name) {
      this.checkRegion(element);
    } else {
      this.checkRegion(element);
    }
  }

  private checkRegion(info: Worker): void {
    if (this.dataInfo.userInfo.isAdmin) {
      this.usersWorkersArray.push(info);
    } else if (this.dataInfo.userInfo.managerRegion && info.region === this.dataInfo.userInfo.managerRegion) {
      this.usersWorkersArray.push(info);
    }
  }

  private checkOrder(): void {
    switch (this.orderType) {
      case '1':
        this.orderAlpha();
        break;
      case '2':
        this.orderAlphaDesc();
        break;
      case '3':
        this.orderDatetime();
        break;
      case '4':
        this.orderAccess();
        break;
      default:
        this.uiUtils.showToast(this.dataText.errorFilter);
    }
  }

  private orderAlpha(): void {
    this.usersWorkersArray.sort((a, b) => a.name.localeCompare(b.name));
  }

  private orderAlphaDesc(): void {
    this.usersWorkersArray.sort((a, b) => b.name.localeCompare(a.name));
  }

  private orderDatetime(): void {
    this.usersWorkersArray.sort((a, b) => {
      if (!a.datetime || !b.datetime) return 0;
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });
  }

  private orderAccess(): void {
    this.usersWorkersArray.sort((a, b) => {
      if (!a.lastDatetime || !b.lastDatetime) return 0;
      return new Date(b.lastDatetime).getTime() - new Date(a.lastDatetime).getTime();
    });
  }

  toggleDetails(worker: Worker): void {
    worker.showDetails = !worker.showDetails;
  }

  startJob(worker: Worker): void {
    // Implementar lógica para iniciar um trabalho, se necessário
    this.navCtrl.pop();
    this.events.publish('worker-selected', worker);
  }

  private updateRanking(user: string, ranking: string): void {
    this.db.updateRankingUser(user, ranking)
      .then(() => {
        this.uiUtils.showAlert(this.dataText.success, this.dataText.savedSuccess).present();
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao atualizar ranking:', err);
        this.uiUtils.showAlertError('Erro ao atualizar o ranking do profissional.');
      });
  }

  changeRanking(key: string): void {
    const actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectRank,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Ouro',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'medal' : null,
          handler: () => this.updateRanking(key, this.dataInfo.titleRankingGold)
        },
        {
          text: 'Prata',
          icon: !this.platform.is('ios') ? 'medal' : null,
          handler: () => this.updateRanking(key, this.dataInfo.titleRankingSilver)
        },
        {
          text: 'Bronze',
          icon: !this.platform.is('ios') ? 'medal' : null,
          handler: () => this.updateRanking(key, this.dataInfo.titleRankingBronze)
        },
        {
          text: 'Top',
          icon: !this.platform.is('ios') ? 'md-trophy' : null,
          handler: () => this.updateRanking(key, this.dataInfo.titleRankingStar)
        },
        {
          text: this.dataText.cancel,
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'star' : null,
          handler: () => console.log('Cancel clicked')
        }
      ]
    });
    actionSheet.present();
  }

  changeProfileStatus(key: string): void {
    const actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectRank,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: this.dataText.verifiedProfile,
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'checkmark-circle' : null,
          handler: () => this.updateProfileStatus(key, this.dataInfo.titleProfileVerified)
        },
        {
          text: this.dataText.notVerifiedProfile,
          icon: !this.platform.is('ios') ? 'remove-circle' : null,
          handler: () => this.updateProfileStatus(key, this.dataInfo.titleStatusNotVerified)
        },
        {
          text: this.dataText.cancel,
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => console.log('Cancel clicked')
        }
      ]
    });
    actionSheet.present();
  }

  documentations(worker: Worker): void {
    this.navCtrl.push(DocumentationPage, { info: worker });
  }

  options(payload: Worker): void {
    const actionSheet = this.actionsheetCtrl.create({
      title: this.dataText.selectOption,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: this.dataText.edit,
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'checkmark-circle' : null,
          handler: () => this.edit(payload)
        },
        {
          text: this.dataText.disableUser,
          icon: !this.platform.is('ios') ? 'md-close-circle' : null,
          handler: () => this.disableUser(payload)
        },
        {
          text: this.dataText.remove,
          icon: !this.platform.is('ios') ? 'md-trash' : null,
          handler: () => this.removeUser(payload)
        },
        {
          text: this.dataText.credits,
          role: 'destructive',
          icon: 'cash',
          handler: () => this.credit(payload)
        },
        {
          text: this.dataText.documents,
          role: 'destructive',
          icon: 'clipboard',
          handler: () => this.documentations(payload)
        },
        {
          text: this.dataText.cancel,
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => console.log('Cancel clicked')
        }
      ]
    });
    actionSheet.present();
  }

  edit(payload: Worker): void {
    this.navCtrl.push('ProfessionalsAddPage', { payload });
  }

  removeUser(payload: Worker): void {
    this.uiUtils.showConfirm(this.dataText.warning, this.dataText.areYouVerySure)
      .then((result) => {
        if (result) {
          if (!this.dataInfo.isTest) {
            this.removeUserContinue(payload);
          } else {
            this.uiUtils.showAlertError(this.dataText.accessDenied);
          }
        }
      })
      .catch(err => {
        console.error('Erro ao confirmar remoção:', err);
        this.uiUtils.showAlertError('Erro ao processar a confirmação de remoção.');
      });
  }

  private removeUserContinue(payload: Worker): void {
    const loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations);
    loading.present();

    const uid = payload.uid || payload.key;
    this.httpd.apiRemoveUser({ uid })
      .subscribe({
        next: (result) => {
          console.log('Resultado da API de remoção:', result);
          this.uiUtils.showAlertSuccess(this.dataText.removeSuccess);
          this.db.removeUser(uid)
            .then(() => {
              this.reload();
            })
            .catch(err => {
              console.error('Erro ao remover usuário do banco:', err);
              this.uiUtils.showAlertError('Erro ao remover o usuário do banco de dados.');
            })
            .finally(() => {
              loading.dismiss();
            });
        },
        error: (err) => {
          console.error('Erro na API de remoção:', err);
          this.uiUtils.showAlertError('Erro ao remover o usuário via API.');
          loading.dismiss();
        }
      });
  }

  addProfessional(): void {
    this.navCtrl.push('ProfessionalsAddPage');
  }

  credit(payload: Worker): void {
    this.navCtrl.push('CreditsManualPage', { payload });
  }

  disableUser(payload: Worker): void {
    this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantDisableUser)
      .then((result) => {
        if (result) {
          if (!this.dataInfo.isTest) {
            this.inativate(payload);
          } else {
            this.uiUtils.showAlertError(this.dataText.accessDenied);
          }
        }
      })
      .catch(err => {
        console.error('Erro ao confirmar desativação:', err);
        this.uiUtils.showAlertError('Erro ao processar a confirmação de desativação.');
      });
  }

  private inativate(payload: Worker): void {
    const uid = payload.uid || payload.key;
    this.db.updateUserStatus(uid, 'Desativado')
      .then(() => {
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao desativar usuário:', err);
        this.uiUtils.showAlertError('Erro ao desativar o usuário.');
      });
  }

  workerChanged(event: any): void {
    console.log('Worker changed:', event);
    this.reload();
  }

  private getDenuncias(): void {
    const sub = this.db.getAcquaintances().subscribe({
      next: (data) => this.getDenunciasCallback(data),
      error: (err) => {
        console.error('Erro ao carregar denúncias:', err);
        this.uiUtils.showAlertError('Erro ao carregar denúncias.');
      }
    });
    this.subscriptions.push(sub);
  }

  private getDenunciasCallback(data: any[]): void {
    data.forEach(element => {
      const payloadVal = element.payload.val();
      const info = {
        key: element.payload.key,
        uid: payloadVal.uid
      };
      console.log('Denúncia info:', info);
      this.checkDenuncia(info);
    });
  }

  private checkDenuncia(info: { uid: string }): void {
    this.usersWorkersArray.forEach((element: Worker) => {
      if (info.uid === element.key) {
        element.denuncia = (element.denuncia || 0) + 1;
      }
    });
  }

  private updateProfileStatus(key: string, status: string): void {
    this.db.updateProfileStatusUser(key, status)
      .then(() => {
        this.uiUtils.showAlert(this.dataText.success, this.dataText.savedSuccess).present();
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao atualizar status do perfil:', err);
        this.uiUtils.showAlertError('Erro ao atualizar o status do profissional.');
      });
  }

  logout(): void {
    this.navCtrl.setRoot('LoginPage');
  }
}