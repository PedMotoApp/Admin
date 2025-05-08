import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-tables-price',
  templateUrl: 'tables-price.html',
})
export class TablesPricePage {
  services: Observable<any>;
  tablesArray: any[] = [];

  constructor(
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,
    public navParams: NavParams
  ) {}

  ionViewDidLoad(): void {
    if (this.dataInfo.isHome) {
      this.startInterface();
    } else {
      this.navCtrl.setRoot('LoginPage');
    }
  }

  startInterface(): void {
    this.getServices();
  }

  add(): void {
    this.navCtrl.push('TablesPriceAddPage');
  }

  edit(service: any): void {
    this.navCtrl.push('TablesPriceAddPage', { payload: service });
  }

  getServices(): void {
    const loading = this.uiUtils.showLoading('Carregando...');
    loading.present();

    this.services = this.db.getAllTablesPrice();
    this.services.subscribe(data => {
      this.getServicesCallback(data);
      loading.dismiss();
    }, err => {
      console.error('Erro ao carregar tabelas de preços:', err);
      loading.dismiss();
      this.uiUtils.showAlertError('Erro ao carregar tabelas de preços.');
    });
  }

  getServicesCallback(data: any[]): void {
    this.tablesArray = [];
    data.forEach(element => {
      const info = element.payload.val();
      info.key = element.payload.key;
      this.tablesArray.push(info);
    });
  }

  remove(data: any): void {
    const alert = this.uiUtils.showConfirm('Atenção', 'Tem certeza que deseja remover esta tabela de preços?');
    alert.then((result) => {
      if (result) {
        if (!this.dataInfo.isTest) {
          this.removeContinue(data);
        } else {
          this.uiUtils.showAlertError('Acesso negado em modo de teste.');
        }
      }
    });
  }

  removeContinue(data: any): void {
    this.db.removeTablesPrice(data.key)
      .then(() => {
        this.uiUtils.showAlert('Sucesso', 'Tabela removida com sucesso!').present();
        this.getServices();
      })
      .catch(err => {
        console.error('Erro ao remover tabela:', err);
        this.uiUtils.showAlertError('Erro ao remover tabela.');
      });
  }
}