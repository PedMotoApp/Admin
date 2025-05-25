import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataTextProvider } from '../../providers/data-text/data-text';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment';

// Interface para tipagem dos dados dos clientes
interface Client {
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
  totalWorks?: number;
  region?: string;
  userType?: number;
  uid?: string;
  prePaid?: boolean;
  isPremium?: boolean;
  showDetails?: boolean;
}

@IonicPage()
@Component({
  selector: 'page-clients',
  templateUrl: 'clients.html',
})
export class ClientsPage {
  usersWorkers: Observable<any>;
  usersArray: Client[] = [];
  client: Client | null = null;
  searchTerm: string = '';
  searching: boolean = false;
  orderType: string = '1';

  private subscriptions: Subscription[] = [];
  private activeLoading: any = null;

  constructor(
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,
    public platform: Platform,
    public auth: AuthProvider,
    public httpd: HttpdProvider,
    public actionsheetCtrl: ActionSheetController,
    public dataText: DataTextProvider,
    public navParams: NavParams
  ) {}

  ionViewDidLoad(): void {
    this.orderType = '1';
    if (this.dataInfo.isHome) {
      this.reload();
    } else {
      this.navCtrl.setRoot('LoginPage');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    if (this.activeLoading) {
      this.activeLoading.dismiss();
      this.activeLoading = null;
    }
  }

  private reload(): void {
    const loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations);
    loading.present();
    this.activeLoading = loading;

    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    this.usersWorkers = this.db.getClients();
    const sub = this.usersWorkers.subscribe({
      next: (data) => {
        this.reloadCallback(data);
        this.dismissLoading();
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.uiUtils.showAlertError('Erro ao carregar dados dos clientes.');
        this.dismissLoading();
      }
    });
    this.subscriptions.push(sub);
  }

  private reloadCallback(data: any[]): void {
    this.usersArray = [];

    data.forEach(element => {
      const payloadVal = element.payload.val();
      const info: Client = {
        key: element.payload.key,
        name: payloadVal.name,
        email: payloadVal.email,
        status: payloadVal.status || 'Perfil não verificado',
        ranking: payloadVal.ranking || 'Bronze',
        photo: payloadVal.photo,
        tablePrice: payloadVal.tablePrice,
        datetime: payloadVal.datetime,
        lastDatetime: payloadVal.lastDatetime,
        lastDatetimeStr: payloadVal.lastDatetime
          ? moment(payloadVal.lastDatetime).format('DD/MM/YYYY hh:mm:ss')
          : undefined,
        address: payloadVal.address,
        tel: payloadVal.tel,
        totalWorks: payloadVal.totalWorks,
        region: payloadVal.region,
        userType: payloadVal.userType,
        uid: payloadVal.uid,
        prePaid: payloadVal.prePaid,
        isPremium: payloadVal.isPremium,
        showDetails: false
      };

      if (!info.name) {
        info.name = info.email;
      }

      if (info.userType === 1 && info.status !== 'Desativado' && info.status !== 'Removido') {
        this.addArray(info);
      }
    });

    this.checkOrder();
  }

  private addArray(info: Client): void {
    if (this.client && this.client.name === info.name) {
      this.checkRegion(info);
    } else {
      this.checkRegion(info);
    }
  }

  private checkRegion(info: Client): void {
    if (this.dataInfo.userInfo.isAdmin) {
      this.usersArray.push(info);
    } else if (this.dataInfo.userInfo.managerRegion && info.region === this.dataInfo.userInfo.managerRegion) {
      this.usersArray.push(info);
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
    this.usersArray.sort((a, b) => a.name.localeCompare(b.name));
  }

  private orderAlphaDesc(): void {
    this.usersArray.sort((a, b) => b.name.localeCompare(a.name));
  }

  private orderDatetime(): void {
    this.usersArray.sort((a, b) => {
      if (!a.datetime || !b.datetime) return 0;
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    });
  }

  private orderAccess(): void {
    this.usersArray.sort((a, b) => {
      if (!a.lastDatetime || !b.lastDatetime) return 0;
      return new Date(b.lastDatetime).getTime() - new Date(a.lastDatetime).getTime();
    });
  }

  toggleDetails(worker: Client): void {
    worker.showDetails = !worker.showDetails;
  }

  private updateRanking(user: string, ranking: string): void {
    this.db.updateRankingUser(user, ranking)
      .then(() => {
        this.uiUtils.showAlert(this.dataText.success, this.dataText.savedSuccess).present();
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao atualizar ranking:', err);
        this.uiUtils.showAlertError('Erro ao atualizar o ranking do cliente.');
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

  addClient(): void {
    this.navCtrl.push('ClientsAddPage', {
      defaultSettings: {
        ranking: 'Bronze',
        status: 'Perfil não verificado'
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
        this.uiUtils.showAlertError('Erro ao atualizar o status do cliente.');
      });
  }

  options(payload: Client): void {
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
          text: 'Resetar senha',
          icon: !this.platform.is('ios') ? 'refresh' : null,
          handler: () => this.updateProfilePassword(payload)
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
        /*{
          text: this.dataText.credits,
          role: 'destructive',
          icon: 'cash',
          handler: () => this.credit(payload)
        },
        {
          text: this.dataText.billed,
          icon: !this.platform.is('ios') ? 'md-cash' : null,
          handler: () => this.prePaidUser(payload)
        },
        {
          text: this.dataText.premiumUser,
          icon: !this.platform.is('ios') ? 'md-medal' : null,
          handler: () => this.changePremium(payload)
        },*/
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

  credit(payload: Client): void {
    this.navCtrl.push('CreditsManualPage', { payload });
  }

  edit(payload: Client): void {
    this.navCtrl.push('ClientsAddPage', { payload });
  }

  updateProfilePassword(payload: Client): void {
    this.auth.resetPassword(payload.email)
      .then(() => {
        this.uiUtils.showAlertSuccess(this.dataText.weSentYouALink);
      })
      .catch(() => {
        this.uiUtils.showAlertSuccess(this.dataText.errorResetPassword);
      });
  }

  removeUser(payload: Client): void {
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

  private removeUserContinue(payload: Client): void {
    const loading = this.uiUtils.showLoading(this.dataInfo.titleLoadingInformations);
    loading.present();

    const uid = payload.uid || payload.key;

    // Delete user data from Realtime Database only
    this.db.removeUser(uid)
      .then(() => {
        loading.dismiss();
        this.uiUtils.showAlertSuccess(this.dataText.removeSuccess);
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao remover usuário do banco:', err);
        loading.dismiss();
        this.uiUtils.showAlertError('Erro ao remover o usuário do banco de dados: ' + (err.message || 'Erro desconhecido'));
      });
  }

  disableUser(payload: Client): void {
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

  private inativate(payload: Client): void {
    const uid = payload.uid || payload.key;
    this.db.updateUserStatus(uid, 'Desativado')
      .then(() => {
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao desativar cliente:', err);
        this.uiUtils.showAlertError('Erro ao desativar o cliente.');
      });
  }

  prePaidUser(payload: Client): void {
    const msg = payload.prePaid ? this.dataText.billedOff : this.dataText.billedOn;
    this.uiUtils.showConfirm(this.dataText.warning, msg)
      .then((result) => {
        if (result) {
          this.prePaidUserContinue(payload);
        }
      })
      .catch(err => {
        console.error('Erro ao confirmar alteração de pré-pago:', err);
        this.uiUtils.showAlertError('Erro ao processar a confirmação de pré-pago.');
      });
  }

  private prePaidUserContinue(payload: Client): void {
    payload.prePaid = !payload.prePaid;
    this.db.updatePrePaid(payload.key, payload.prePaid)
      .then(() => {
        this.uiUtils.showAlertSuccess(this.dataText.savedSuccess);
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao atualizar status de pré-pago:', err);
        this.uiUtils.showAlertError('Erro ao atualizar o status de pré-pago do cliente.');
      });
  }

  changePremium(payload: Client): void {
    const msg = payload.isPremium ? this.dataText.premiumOff : this.dataText.premiumOn;
    this.uiUtils.showConfirm(this.dataText.warning, msg)
      .then((result) => {
        if (result) {
          this.changeValuesContinue(payload);
        }
      })
      .catch(err => {
        console.error('Erro ao confirmar alteração de premium:', err);
        this.uiUtils.showAlertError('Erro ao processar a confirmação de premium.');
      });
  }

  private changeValuesContinue(payload: Client): void {
    payload.isPremium = !payload.isPremium;
    this.db.updateCanChangeFinalValue(payload.key, payload.isPremium)
      .then(() => {
        this.uiUtils.showAlertSuccess(this.dataText.savedSuccess);
        this.reload();
      })
      .catch(err => {
        console.error('Erro ao atualizar status de premium:', err);
        this.uiUtils.showAlertError('Erro ao atualizar o status de premium do cliente.');
      });
  }

  clientChanged(event: any): void {
    this.reload();
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