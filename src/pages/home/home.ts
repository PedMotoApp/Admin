import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { Geolocation } from '@ionic-native/geolocation';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/switchMap';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('mapwatch') mapElement: ElementRef;

  runningCount: number = 0;
  dailyEarnings: number = 0;
  orderHistory: any[] = [];
  liveOrders: any[] = [];
  histSub: Subscription;
  liveSub: Subscription;
  locSub: Subscription;

  map: any;
  markers: any[] = [];
  bounds: any;
  searchTerm: string = '';
  icon: string;
  requestType: string = 'Serviço'; // Começa mostrando corridas em andamento
  allJobs: any[] = [];
  allOnline: any[] = [];
  allClientsOnline: any[] = [];
  totalOnline: number = 0;
  totalOnlineClients: number = 0;
  worksInterval: any;

  constructor(
    public navCtrl: NavController,
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,
    private geo: Geolocation,
    public events: Events,
    private _ngZone: NgZone
  ) {
    window['angularComponentRef'] = { component: this, zone: this._ngZone };
  }

  ionViewDidLoad(): void {
    if (!this.dataInfo.isHome) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
    this.loadLive();
    this.loadDailyEarnings();
    this.loadHistory();
    this.trackLocation();
    this.initializeMap();
    this.loadOnlines();
    this.startIntervalJobs();
  }

  ionViewWillUnload(): void {
    if (this.liveSub) this.liveSub.unsubscribe();
    if (this.histSub) this.histSub.unsubscribe();
    if (this.locSub) this.locSub.unsubscribe();
    if (this.worksInterval) clearInterval(this.worksInterval);
  }

  // Corridas Aceitas/Iniciadas
  loadLive(): void {
    this.liveSub = this.db.getWorksRequests(this.dataInfo.dateYear, this.dataInfo.dateMonth)
      .subscribe(list => {
        const orders = list.map(r => r.payload.val());
        this.liveOrders = orders.filter(o => o.status === 'Aceito' || o.status === 'Iniciado');
        this.runningCount = this.liveOrders.length;
        this.allJobs = this.liveOrders; // Para o mapa
        if (this.requestType === 'Serviço') {
          this.loadWorks();
        }
      }, err => {
        console.error('Erro ao carregar corridas ao vivo:', err);
      });
  }

  // Ganhos Hoje (soma totalPrice de corridas finalizadas hoje em orderHistory)
  loadDailyEarnings(): void {
    this.histSub = this.db.getAllWorksAcceptedsDate()
      .subscribe(list => {
        const today = moment();
        this.dailyEarnings = list
          .map(r => r.payload.val())
          .filter(o => moment(o.finalizedAt).isSame(today, 'day'))
          .reduce((sum: number, o: any) => {
            if (o.servicesPrices && o.servicesPrices.totalPrice) {
              return sum + parseFloat(o.servicesPrices.totalPrice);
            }
            return sum;
          }, 0);
      }, err => {
        console.error('Erro ao carregar ganhos diários:', err);
      });
  }

  // Últimas 5 Corridas Concluídas
  loadHistory(): void {
    this.histSub = this.db.getAllWorksAcceptedsDate()
      .subscribe(list => {
        this.orderHistory = list
          .map(r => r.payload.val())
          .filter(o => o.status === 'Finalizado')
          .slice(-5).reverse();
      }, err => {
        console.error('Erro ao carregar histórico de corridas:', err);
      });
  }

  // Atualiza localização a cada 30s
  trackLocation(): void {
    const opts = { timeout: 10000, enableHighAccuracy: true };
    this.locSub = Observable.interval(30000)
      .switchMap(() => Observable.fromPromise(this.geo.getCurrentPosition(opts)))
      .subscribe(pos => {
        const { latitude, longitude } = pos.coords;
        this.dataInfo.userInfo.latitude = latitude;
        this.dataInfo.userInfo.longitude = longitude;
        this.events.publish('save-lat-long');
      }, err => {
        console.error('Erro ao rastrear localização:', err);
      });
  }

  // Inicialização do Mapa
  initializeMap(): void {
    this.bounds = new google.maps.LatLngBounds();
    const startPosition = new google.maps.LatLng(
      this.dataInfo.userInfo.latitude || -15.826944,
      this.dataInfo.userInfo.longitude || -48.0313344
    );

    const mapOptions = {
      center: startPosition,
      zoom: 12
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.icon = this.dataInfo.iconLocationClient || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }

  centerMap(): void {
    const center = new google.maps.LatLng(
      this.dataInfo.userInfo.latitude || -15.826944,
      this.dataInfo.userInfo.longitude || -48.0313344
    );
    this.map.panTo(center);
  }

  fit(): void {
    this.map.fitBounds(this.bounds);
  }

  clearMarkers(map: any): void {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

  clearAll(): void {
    this.clearMarkers(null);
    this.markers = [];
  }

  setFilteredItems(): void {
    this.clearAll();
    if (this.requestType === 'Serviço') {
      this.allJobs.forEach(element => {
        this.searchAndAdd(element);
      });
    } else if (this.requestType === 'Todos') {
      this.allOnline.forEach(element => {
        this.searchAndAddOnline(element);
      });
    } else if (this.requestType === 'Cliente') {
      this.allClientsOnline.forEach(element => {
        this.searchAndAddOnline(element);
      });
    }
  }

  searchAndAdd(element: any): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    const matchesName = element.name && element.name.toLowerCase().includes(searchTermLower);
    const matchesWorker = element.workerInfo && element.workerInfo.name && element.workerInfo.name.toLowerCase().includes(searchTermLower);
    if (matchesName || matchesWorker) {
      this.loadUsersMarkers(element);
    }
  }

  searchAndAddOnline(element: any): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    if (element.name && element.name.toLowerCase().includes(searchTermLower)) {
      this.loadOnlineMarkers(element);
    }
  }

  loadOnlineMarkers(info: any): void {
    if (info.latitude && info.longitude) {
      const marker = new google.maps.Marker({
        label: {
          color: 'black',
          fontWeight: 'bold',
          text: info.name || 'Usuário'
        },
        icon: {
          labelOrigin: new google.maps.Point(11, 50),
          url: this.icon,
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(11, 40)
        },
        position: new google.maps.LatLng(info.latitude, info.longitude),
        map: this.map
      });

      this.bounds.extend(marker.position);
      this.markers.push(marker);
    }
  }

  loadUsersMarkers(info: any): void {
    const latitude = info.workerInfo && info.workerInfo.latitude;
    const longitude = info.workerInfo && info.workerInfo.longitude;

    if (latitude && longitude) {
      const marker = new google.maps.Marker({
        label: {
          color: 'black',
          fontWeight: 'bold',
          text: info.workerInfo.name || 'Profissional'
        },
        icon: {
          labelOrigin: new google.maps.Point(11, 50),
          url: this.icon,
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(11, 40)
        },
        position: new google.maps.LatLng(latitude, longitude),
        map: this.map
      });

      this.markers.push(marker);
      this.bounds.extend(marker.position);
    }
  }

  showProfessionalsOnline(): void {
    this.requestType = 'Todos';
    this.clearAll();
    this.allOnline.forEach(info => {
      this.loadOnlineMarkers(info);
    });
  }

  showClientsOnline(): void {
    this.requestType = 'Cliente';
    this.clearAll();
    this.allClientsOnline.forEach(info => {
      this.loadOnlineMarkers(info);
    });
  }

  loadWorks(): void {
    this.clearAll();
    if (this.allJobs.length > 0) {
      this.allJobs.forEach(element => {
        if (this.dataInfo.userInfo.isAdmin || element.uid === this.dataInfo.userInfo.uid) {
          this.loadUsersMarkers(element);
        }
      });
    }
  }

  loadOnlines(): void {
    this.getWorkers().then(() => {
      this.getClients();
      if (this.requestType === 'Todos') {
        this.showProfessionalsOnline();
      } else if (this.requestType === 'Cliente') {
        this.showClientsOnline();
      }
    });
  }

  getWorkers(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.db.getWorkers()
        .subscribe(data => {
          this.getWorkersCallback(data);
          resolve();
        }, err => {
          console.error('Erro ao carregar profissionais:', err);
          resolve();
        });
    });
  }

  getWorkersCallback(data: any[]): void {
    this.allOnline = [];
    this.totalOnline = 0;

    data.forEach(element => {
      const info = element.payload.val();
      info.key = element.payload.key;

      if (info.status !== 'Desativado' && info.status !== 'Removido') {
        if (info.lastDatetime && moment(info.lastDatetime).add(10, 'minutes').isAfter(moment())) {
          if (this.dataInfo.userInfo.isAdmin || info.region === this.dataInfo.userInfo.region) {
            this.totalOnline++;
            this.allOnline.push(info);
          }
        }

        this.allJobs.forEach(job => {
          if (job.workerInfo && job.workerInfo.uid === info.uid) {
            job.workerInfo.latitude = info.latitude;
            job.workerInfo.longitude = info.longitude;
          }
        });
      }
    });

    this.sortOnline();
  }

  sortOnline(): void {
    this.allOnline.sort((a, b) => {
      if (a.name && b.name) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      }
      return 0;
    });
  }

  getClients(): void {
    this.db.getClients()
      .subscribe(data => {
        this.getClientsCallback(data);
      }, err => {
        console.error('Erro ao carregar clientes:', err);
      });
  }

  getClientsCallback(data: any[]): void {
    this.totalOnlineClients = 0;
    this.allClientsOnline = [];

    data.forEach(element => {
      const info = element.payload.val();
      info.key = element.payload.key;

      if (info.status !== 'Desativado' && info.status !== 'Removido') {
        if (info.lastDatetime && moment(info.lastDatetime).isSame(moment(), 'day') && moment(info.lastDatetime).add(10, 'minutes').isAfter(moment())) {
          if (this.dataInfo.userInfo.isAdmin || (this.dataInfo.userInfo.managerRegion && info.region === this.dataInfo.userInfo.managerRegion)) {
            this.totalOnlineClients++;
            this.allClientsOnline.push(info);
          }
        }
      }
    });
  }

  startIntervalJobs(): void {
    this.worksInterval = setInterval(() => {
      this.loadLive();
      this.loadOnlines();
    }, 30000);
  }

  edit(work: any): void {
    this.navCtrl.push('SearchDeliveryPage', { payload: work });
  }

  finishWorkDelivery(work: any): void {
    this.db.changeStatus(work.key, 'Finalizado')
      .then(() => {
        this.loadLive();
      })
      .catch(err => {
        console.error('Erro ao finalizar corrida:', err);
      });
  }

  cancelWorkDelivery(work: any): void {
    const msg = `Cancelado pelo painel às ${moment().format('DD/MM/YYYY HH:mm:ss')}`;
    this.db.cancelWork(work.key, msg)
      .then(() => {
        this.loadLive();
      })
      .catch(err => {
        console.error('Erro ao cancelar corrida:', err);
      });
  }

  // Navegação
  showOnMap(order: any): void {
    this.navCtrl.push('WorkWatchPage', { order });
  }

  goPageDashboard(): void {
    this.navCtrl.setRoot('HomePage');
  }

  goPageClients(): void {
    this.navCtrl.push('ClientsPage');
  }

  goPagProfessionals(): void {
    this.navCtrl.push('ProfessionalsPage');
  }

  goPageWorks(): void {
    this.navCtrl.push('WorkPage');
  }

  goPageWorkWatch(): void {
    this.navCtrl.push('WorkWatchPage');
  }

  goPageHistory(): void {
    this.navCtrl.push('HistoryPage');
  }

  goPageSettings(): void {
    this.navCtrl.push('SettingsPage');
  }

  suporte(): void {
    const url = this.dataInfo.appConfig.appHelp;
    window.open(url, '_blank');
  }


  goPageTablePrice(): void {
    this.navCtrl.push('TablesPricePage');
  }

  logout(): void {
    this.events.publish('logout');
  }
}