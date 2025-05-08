import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-tables-price-add',
  templateUrl: 'tables-price-add.html'
})
export class TablesPriceAddPage {
  services: Observable<any>;

  payload: any;
  key: string = '';
  name: string = '';
  description: string = '';
  valueStart: number = 0;
  valuePerKm: number = 0;
  valueReturn: number = 0;

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
    this.clear();
    this.loadValues();
  }

  loadValues(): void {
    this.payload = this.navParams.get('payload');
    if (this.payload) {
      this.key = this.payload.key;
      this.name = this.payload.name;
      this.description = this.payload.description;
      this.valueStart = this.payload.valueStart;
      this.valuePerKm = this.payload.valuePerKm;
      this.valueReturn = this.payload.valueReturn || 0;
    }
  }

  clear(): void {
    this.key = '';
    this.name = '';
    this.description = '';
    this.valueStart = 0;
    this.valuePerKm = 0;
    this.valueReturn = 0;
  }

  checkValues(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.name) {
        reject('Favor preencher o nome');
      } else if (!this.description) {
        reject('Favor preencher a descrição');
      } else if (!this.valueStart && !this.valuePerKm) {
        reject('Favor preencher o preço base ou o valor por km');
      } else {
        this.valueReturn = this.valueReturn || 0;
        resolve();
      }
    });
  }

  add(): void {
    const loading = this.uiUtils.showLoading('Salvando...');
    loading.present();

    this.checkValues()
      .then(() => {
        this.db.addTablesPrice(
          this.name,
          this.description,
          this.valueStart,
          this.valuePerKm,
          this.valueReturn,
          "" // String vazia para compatibilidade com o banco de dados
        )
        .then(() => {
          loading.dismiss();
          this.uiUtils.showAlert('Sucesso', 'Tabela adicionada com sucesso!').present();
          this.navCtrl.pop();
        })
        .catch(err => {
          loading.dismiss();
          console.error('Erro ao adicionar tabela:', err);
          this.uiUtils.showAlertError('Erro ao adicionar tabela.');
        });
      })
      .catch(error => {
        loading.dismiss();
        this.uiUtils.showAlertError(error);
      });
  }

  save(): void {
    const loading = this.uiUtils.showLoading('Salvando...');
    loading.present();

    this.checkValues()
      .then(() => {
        this.db.updateTablesPrice(
          this.key,
          this.name,
          this.description,
          this.valueStart,
          this.valuePerKm,
          this.valueReturn,
          "" // String vazia para compatibilidade com o banco de dados
        )
        .then(() => {
          loading.dismiss();
          this.uiUtils.showAlert('Sucesso', 'Tabela salva com sucesso!').present();
          this.navCtrl.pop();
        })
        .catch(err => {
          loading.dismiss();
          console.error('Erro ao salvar tabela:', err);
          this.uiUtils.showAlertError('Erro ao salvar tabela.');
        });
      })
      .catch(error => {
        loading.dismiss();
        this.uiUtils.showAlertError(error);
      });
  }
}