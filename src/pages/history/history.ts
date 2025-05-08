import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DataTextProvider } from '../../providers/data-text/data-text';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

interface Work {
  key: string;
  createdAt: string;
  datetime: string;
  finalizedAt: string;
  cancellationReason?: string;
  cancelledAt?: string;
  status: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    photo: string;
    uid: string;
  };
  driver: {
    email: string;
    firstName: string;
    lastName: string;
    uid: string;
  };
  servicesPrices: {
    driverEarnings: number;
    totalDistance: number;
    totalPrice: string;
    totalTime: number;
  };
  dropPoints: {
    description: string;
    arrivedAt?: string;
    completedAt?: string;
    distanceFromPrevious?: number;
    timeFromPrevious?: number;
    distanceToNext?: string;
    timeToNext?: string;
    startPoint?: boolean;
    status: string;
  }[];
  expand: boolean;
}

interface Report {
  key: string;
  data: string;
  dataEnd: string;
  datetimeStart: string;
  datetimeEnd: string;
  totalJobs: number;
  totalComission: string;
  totalPrePaid: string;
  totalCard: string;
  totalMoney: string;
  totalFinal: string;
  url: string;
  directLink: string;
}

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage implements OnInit {
  private worksSubscription: Subscription;
  formGroup: FormGroup;
  works: Observable<any>;
  worksArray: Work[] = [];
  reportsArray: Report[] = [];
  usersWorkersArray: any[] = [];
  clientsWorkersArray: any[] = [];
  totalJobs: number = 0;
  totalDistance: number = 0;
  totalTime: number = 0;
  totalPrice: number = 0;
  isReportOpen: boolean = false;
  textHeader: string = 'Relatórios';
  private subscriptions: Subscription[] = [];
  private activeLoading: any = null;

  constructor(
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,
    public platform: Platform,
    private iab: InAppBrowser,
    public dataText: DataTextProvider,
    public navParams: NavParams,
    private formBuilder: FormBuilder
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
    if (this.activeLoading && this.activeLoading.dismiss) {
      this.activeLoading.dismiss();
      this.activeLoading = null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.worksSubscription && this.worksSubscription.unsubscribe) {
      this.worksSubscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.formGroup = this.formBuilder.group({
      status: ['Todos', Validators.required],
      client: [''],
      worker: [''],
      selectedDate: [moment().startOf('month').format('YYYY-MM-DD'), Validators.required],
      selectedDateEnd: [moment().format('YYYY-MM-DD'), Validators.required]
    });
  }

  private startInterface(): void {
    this.isReportOpen = false;
    const statustmp = this.navParams.get('status');
    if (statustmp && this.formGroup.get('status')) {
      this.formGroup.get('status').setValue(statustmp);
    }

    this.usersWorkersArray = [];
    this.clientsWorkersArray = [];
    this.getWorkers();
    this.getClients();
    this.getHistory();
  }

  private getClients(): void {
    this.showLoading(this.dataText.loading);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    const sub = this.db.getClients().subscribe({
      next: (data) => {
        this.clientsWorkersArray = data.map(element => {
          const info = element.payload.val();
          info.key = element.payload.key;
          return info;
        });
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

  private getWorkers(): void {
    this.showLoading(this.dataText.loading);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    const sub = this.db.getWorkers().subscribe({
      next: (data) => {
        this.usersWorkersArray = data.map(element => {
          const info = element.payload.val();
          info.key = element.payload.key;
          return info;
        });
        this.dismissLoading();
      },
      error: (err) => {
        console.error('Erro ao carregar profissionais:', err);
        this.uiUtils.showAlertError('Erro ao carregar dados dos profissionais.');
        this.dismissLoading();
      }
    });
    this.subscriptions.push(sub);
  }

  updateFilters(): void {
    if (this.isReportOpen) {
      this.showReports();
    } else {
      this.getHistory();
    }
  }

  clear(): void {
    this.formGroup.reset({
      status: 'Todos',
      client: '',
      worker: '',
      selectedDate: moment().startOf('month').format('YYYY-MM-DD'),
      selectedDateEnd: moment().format('YYYY-MM-DD')
    });
    this.worksArray = [];
    this.reportsArray = [];
    this.clearTotals();
  }

  clearTotals(): void {
    this.totalJobs = 0;
    this.totalDistance = 0;
    this.totalTime = 0;
    this.totalPrice = 0;
  }

  showReport(): void {
    this.isReportOpen = true;
    this.textHeader = 'Relatórios';
    this.showReports();
  }

  showHistory(): void {
    const startDate = moment(this.formGroup.value.selectedDate, 'YYYY-MM-DD', true);
    const endDate = moment(this.formGroup.value.selectedDateEnd, 'YYYY-MM-DD', true);

    if (!startDate.isValid() || !endDate.isValid()) {
      this.uiUtils.showAlertError('Datas inválidas. Por favor, verifique os valores inseridos.');
      return;
    }

    const diffDays = endDate.diff(startDate, 'days');

    if (startDate.isAfter(endDate)) {
      this.uiUtils.showAlertError('Data final não pode ser anterior à data inicial');
    } else if (diffDays > 30) {
      this.uiUtils.showAlertError('Limite de 30 dias excedido!');
    } else {
      this.getHistory();
    }
  }

  backHistory(): void {
    this.isReportOpen = false;
    this.textHeader = 'Histórico';
    this.getHistory();
  }

  getHistory(): void {
    this.showLoading(this.dataText.loading);
    this.clearTotals();
    this.worksArray = [];
    this.reportsArray = [];

    if (this.worksSubscription && this.worksSubscription.unsubscribe) {
      this.worksSubscription.unsubscribe();
    }

    this.works = this.db.getAllWorksAcceptedsDate();
    this.worksSubscription = this.works.subscribe({
      next: (data) => {
        this.processWorks(data);
        this.dismissLoading();
      },
      error: (err) => {
        console.error('Erro ao carregar trabalhos:', err);
        this.uiUtils.showAlertError('Erro ao carregar dados dos trabalhos.');
        this.dismissLoading();
      }
    });
  }

  processWorks(data: any[]): void {
    const startDate = moment(this.formGroup.value.selectedDate, 'YYYY-MM-DD', true);
    const endDate = moment(this.formGroup.value.selectedDateEnd, 'YYYY-MM-DD', true);
    const statusFilter = this.formGroup.value.status;
    const clientFilter = this.formGroup.value.client && this.formGroup.value.client.uid ? this.formGroup.value.client.uid : '';
    const workerFilter = this.formGroup.value.worker && this.formGroup.value.worker.uid ? this.formGroup.value.worker.uid : '';
  
    console.log('Filtros aplicados:', {
      startDate: startDate.format('DD/MM/YYYY'),
      endDate: endDate.format('DD/MM/YYYY'),
      statusFilter,
      clientFilter,
      workerFilter
    });
  
    this.worksArray = data.map(element => {
      const info: Work = element.payload.val();
      info.key = element.payload.key;
      info.expand = false;
  
      // Usar cancelledAt como fallback para datetime
      const dateToUse = info.datetime || info.cancelledAt;
      if (dateToUse && moment(dateToUse, ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'DD/MM/YYYY HH:mm:ss']).isValid()) {
        info.datetime = moment(dateToUse, ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'DD/MM/YYYY HH:mm:ss']).format('DD/MM/YYYY HH:mm:ss');
      }
  
      if (info.createdAt && moment(info.createdAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').isValid()) {
        info.createdAt = moment(info.createdAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD/MM/YYYY HH:mm:ss');
      }
      if (info.finalizedAt && moment(info.finalizedAt, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ']).isValid()) {
        info.finalizedAt = moment(info.finalizedAt, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ']).format('DD/MM/YYYY HH:mm:ss');
      }
      if (info.dropPoints && Array.isArray(info.dropPoints)) {
        info.dropPoints.forEach(point => {
          if (point.arrivedAt && moment(point.arrivedAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').isValid()) {
            point.arrivedAt = moment(point.arrivedAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD/MM/YYYY HH:mm:ss');
          }
          if (point.completedAt && moment(point.completedAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').isValid()) {
            point.completedAt = moment(point.completedAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD/MM/YYYY HH:mm:ss');
          }
        });
      } else {
        // Garantir que dropPoints seja um array vazio se não existir ou não for um array
        info.dropPoints = [];
      }
      return info;
    }).filter(info => {
      const workDate = moment(info.datetime, 'DD/MM/YYYY HH:mm:ss', true);
      if (!workDate.isValid()) {
        console.log('Data inválida para o serviço:', info);
        return false;
      }
  
      const matchesDate = workDate.isSameOrAfter(startDate) && workDate.isSameOrBefore(endDate);
      const matchesStatus = statusFilter === 'Todos' || info.status === statusFilter;
      const matchesClient = !clientFilter || (info.user && info.user.uid && info.user.uid === clientFilter);
      const matchesWorker = !workerFilter || (info.driver && info.driver.uid && info.driver.uid === workerFilter);
  
      if (!matchesDate) {
        console.log(`Serviço fora do intervalo de datas: ${info.datetime}`);
      }
      if (!matchesStatus) {
        console.log(`Serviço não corresponde ao status: ${info.status}`);
      }
      if (!matchesClient) {
        console.log(`Serviço não corresponde ao cliente: ${info.user && info.user.uid}`);
      }
      if (!matchesWorker) {
        console.log(`Serviço não corresponde ao profissional: ${info.driver && info.driver.uid}`);
      }
  
      return matchesDate && matchesStatus && matchesClient && matchesWorker;
    });
  
    this.calculateTotals();
    this.organizaFila();
  }

  calculateTotals(): void {
    this.totalJobs = this.worksArray.length;
    this.totalDistance = this.worksArray.reduce((sum, work) => {
      return sum + (work.servicesPrices && work.servicesPrices.totalDistance ? work.servicesPrices.totalDistance : 0);
    }, 0);
    this.totalTime = this.worksArray.reduce((sum, work) => {
      return sum + (work.servicesPrices && work.servicesPrices.totalTime ? work.servicesPrices.totalTime : 0);
    }, 0);
    this.totalPrice = this.worksArray.reduce((sum, work) => {
      return sum + (work.servicesPrices && work.servicesPrices.totalPrice ? parseFloat(work.servicesPrices.totalPrice) : 0);
    }, 0);
  }

  organizaFila(): void {
    this.worksArray.sort((a: Work, b: Work) => {
      const date1 = moment(a.datetime, 'DD/MM/YYYY HH:mm:ss', true);
      const date2 = moment(b.datetime, 'DD/MM/YYYY HH:mm:ss', true);
      if (!date1.isValid() || !date2.isValid()) return 0;
      return date1.isBefore(date2) ? 1 : -1;
    });
  }

  organizaFilaRelatorios(): void {
    this.reportsArray.sort((a: Report, b: Report) => {
      const date1 = moment(a.datetimeStart, 'DD/MM/YYYY', true);
      const date2 = moment(b.datetimeStart, 'DD/MM/YYYY', true);
      if (!date1.isValid() || !date2.isValid()) return 0;
      return date1.isBefore(date2) ? 1 : -1;
    });
  }

  downloadExcel(): void {
    this.uiUtils.showConfirm(this.dataText.warning, 'Deseja realizar o download via excel?').then((result) => {
      if (result) {
        this.downloadExcelContinue();
      }
    });
  }

  downloadExcelContinue(): void {
    this.showLoading(this.dataText.loading);
    this.db.addReport(
      this.formGroup.value.selectedDate,
      this.formGroup.value.selectedDateEnd,
      this.totalJobs,
      '0.00', // totalComissionStr
      '0.00', // totalPrePaidStr
      '0.00', // totalCardStr
      '0.00', // totalMoneyStr
      this.totalPrice.toFixed(2), // totalFinalStr
      this.formGroup.value.client,
      this.formGroup.value.worker
    ).then(() => {
      this.dismissLoading();
      this.uiUtils.showAlertSuccess('Favor aguarde. Estamos processando seu relatório');
      this.showReports();
    }).catch(err => {
      console.error('Erro ao adicionar relatório:', err);
      this.dismissLoading();
      this.uiUtils.showAlertError('Erro ao processar o relatório.');
    });
  }

  showReports(): void {
    this.showLoading(this.dataText.loading);
    const sub = this.db.getReports().subscribe({
      next: (data) => {
        this.showReportsContinue(data);
        this.dismissLoading();
      },
      error: (err) => {
        console.error('Erro ao carregar relatórios:', err);
        this.uiUtils.showAlertError('Erro ao carregar relatórios.');
        this.dismissLoading();
      }
    });
    this.subscriptions.push(sub);
  }

  showReportsContinue(data: any[]): void {
    this.reportsArray = [];
    this.worksArray = [];

    this.reportsArray = data.map(element => {
      const info: Report = element.payload.val();
      info.key = element.payload.key;
      info.data = info.data && moment(info.data).isValid() ? moment(info.data).format('MM/YYYY') : '';
      info.dataEnd = info.dataEnd && moment(info.dataEnd, 'YYYY-MM-DD').isValid() ? moment(info.dataEnd, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
      info.datetimeStart = info.datetimeStart && moment(info.datetimeStart, 'YYYY-MM-DD').isValid() ? moment(info.datetimeStart, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
      info.datetimeEnd = info.datetimeEnd && moment(info.datetimeEnd, 'YYYY-MM-DD').isValid() ? moment(info.datetimeEnd, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
      return info;
    });

    this.organizaFilaRelatorios();
  }

  expand(work: Work): void {
    work.expand = !work.expand;
  }

  open(data: Report): void {
    this.iab.create(data.url);
  }

  removeReport(report: Report): void {
    this.uiUtils.showConfirm(this.dataText.warning, this.dataInfo.titleAreYouSure).then((result) => {
      if (result) {
        this.db.removeReports(report.key).then(() => {
          this.uiUtils.showAlertSuccess('Relatório removido com sucesso');
          this.showReports();
        }).catch(err => {
          console.error('Erro ao remover relatório:', err);
          this.uiUtils.showAlertError('Erro ao remover relatório.');
        });
      }
    });
  }

  openDirect(data: Report): void {
    const options = 'location=no';
    if (data.directLink) {
      if (this.dataInfo.isWeb) {
        this.iab.create(data.directLink, '_blank', options);
      } else {
        this.iab.create(encodeURI(data.directLink), '_system', options);
      }
    }
  }

  removeWork(work: Work): void {
    this.uiUtils.showConfirm(this.dataText.warning, 'Deseja realmente remover?').then((result) => {
      if (result) {
        this.removeWorkContinue(work);
      }
    });
  }

  removeWorkContinue(work: Work): void {
    this.db.removeWorkRequest(work.key).then(() => {
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.removeSuccess);
      this.getHistory();
    }).catch(err => {
      console.error('Erro ao remover trabalho:', err);
      this.uiUtils.showAlertError('Erro ao remover o trabalho.');
    });
  }

  cancelWork(work: Work): void {
    this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantCancel).then((result) => {
      if (result) {
        this.cancelWorkContinue(work);
      }
    });
  }

  cancelWorkContinue(work: Work): void {
    const msg = 'Cancelado pelo painel às ' + moment().format('DD/MM/YYYY HH:mm:ss');
    this.db.cancelWork(work.key, msg).then(() => {
      this.uiUtils.showAlert(this.dataText.warning, 'Cancelado com sucesso!');
      this.getHistory();
    }).catch(err => {
      console.error('Erro ao cancelar trabalho:', err);
      this.uiUtils.showAlertError('Erro ao cancelar o trabalho.');
    });
  }

  finishWorkDelivery(work: Work): void {
    this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantFinish).then((result) => {
      if (result) {
        this.finishDeliveryContinue(work);
      }
    });
  }

  finishDeliveryContinue(work: Work): void {
    this.db.changeStatus(work.key, 'Finalizado').then(() => {
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.finishedSuccess);
      this.getHistory();
    }).catch(err => {
      console.error('Erro ao finalizar trabalho:', err);
      this.uiUtils.showAlertError('Erro ao finalizar o trabalho.');
    });
  }

  restartWork(work: Work): void {
    this.uiUtils.showConfirm(this.dataText.warning, this.dataText.doYouWantRestart).then((result) => {
      if (result) {
        this.restartWorkContinue(work);
      }
    });
  }

  restartWorkContinue(work: Work): void {
    this.db.restartWork(work).then(() => {
      this.uiUtils.showAlert(this.dataText.warning, this.dataText.restartOk);
      this.getHistory();
    }).catch(err => {
      console.error('Erro ao reiniciar trabalho:', err);
      this.uiUtils.showAlertError('Erro ao reiniciar o trabalho.');
    });
  }

  edit(work: Work): void {
    this.navCtrl.push('SearchDeliveryPage', { payload: work });
  }

  recovery(work: Work): void {
    const clientSub = this.db.getUserUid(work.user.uid).subscribe({
      next: (data) => {
        this.recoveryClientContinue(data, work);
        clientSub.unsubscribe();
      },
      error: (err) => {
        console.error('Erro ao recuperar cliente:', err);
        this.uiUtils.showAlertError('Erro ao recuperar informações do cliente.');
      }
    });
    this.subscriptions.push(clientSub);

    if (work.driver && work.driver.uid) {
      const workerSub = this.db.getUserUid(work.driver.uid).subscribe({
        next: (data) => {
          this.recoveryWorkerContinue(data, work);
          workerSub.unsubscribe();
        },
        error: (err) => {
          console.error('Erro ao recuperar profissional:', err);
          this.uiUtils.showAlertError('Erro ao recuperar informações do profissional.');
        }
      });
      this.subscriptions.push(workerSub);
    }
  }

  recoveryClientContinue(data: any[], work: Work): void {
    data.forEach(element => {
      const info = element.payload.val();
      if (work.user) {
        work.user.email = info.email && info.email.length > 0 ? info.email : this.dataText.notInformade;
      }
    });
  }

  recoveryWorkerContinue(data: any[], work: Work): void {
    data.forEach(element => {
      const info = element.payload.val();
      if (work.driver) {
        work.driver.email = info.email && info.email.length > 0 ? info.email : this.dataText.notInformade;
      }
    });
  }

  private showLoading(message: string): void {
    if (this.activeLoading && this.activeLoading.dismiss) {
      this.activeLoading.dismiss();
    }
    this.activeLoading = this.uiUtils.showLoading(message);
    this.activeLoading.present();
  }

  private dismissLoading(): void {
    if (this.activeLoading && this.activeLoading.dismiss) {
      this.activeLoading.dismiss();
      this.activeLoading = null;
    }
  }
}