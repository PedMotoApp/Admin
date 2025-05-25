import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, Events, AlertController } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DatabaseProvider } from '../../providers/database/database';
import { Geolocation } from '@ionic-native/geolocation';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/switchMap';
import * as moment from 'moment';

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
  icon: string ='https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  requestType: string = 'Serviço';
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
    private _ngZone: NgZone,
    public alertCtrl: AlertController
  ) {
    window['angularComponentRef'] = { component: this, zone: this._ngZone };
    moment.locale('pt-br');
  }

  ionViewDidLoad() {
    try {
      if (!this.dataInfo.isHome) {
        console.log('Redirecting to LoginPage: isHome is false');
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
    } catch (err) {
      console.error('Error in ionViewDidLoad:', err);
    }
  }

  ionViewWillUnload() {
    try {
      if (this.liveSub) this.liveSub.unsubscribe();
      if (this.histSub) this.histSub.unsubscribe();
      if (this.locSub) this.locSub.unsubscribe();
      if (this.worksInterval) clearInterval(this.worksInterval);
      console.log('Unsubscribed from all subscriptions and cleared interval');
    } catch (err) {
      console.error('Error in ionViewWillUnload:', err);
    }
  }

  loadLive() {
    try {
      this.liveSub = this.db.getWorksRequests(this.dataInfo.dateYear, this.dataInfo.dateMonth)
        .subscribe(function(list) {
          this.liveOrders = list
            .map(function(r) { return { key: r.payload.key, payload: r.payload.val() }; })
            .filter(function(o) { return o.payload.status === 'Aceito' || o.payload.status === 'Iniciado'; })
            .map(function(o) {
              return {
                key: o.key,
                user: o.payload.user || {},
                driver: o.payload.driver || {},
                status: o.payload.status,
                dropPoints: o.payload.dropPoints,
                servicesPrices: o.payload.servicesPrices,
                createdAt: o.payload.createdAt
              };
            }.bind(this));
          this.runningCount = this.liveOrders.length;
          this.allJobs = this.liveOrders;
          console.log('Loaded live orders:', this.liveOrders.length);
          if (this.requestType === 'Serviço') {
            this.loadWorks();
          }
        }.bind(this), function(err) {
          console.error('Error loading live orders:', err);
        });
    } catch (err) {
      console.error('Error in loadLive:', err);
    }
  }

  loadDailyEarnings() {
    try {
      this.histSub = this.db.getAllWorksAcceptedsDate()
        .subscribe(function(list) {
          var today = moment();
          this.dailyEarnings = list
            .map(function(r) { return r.payload.val(); })
            .filter(function(o) { return moment(o.finalizedAt).isSame(today, 'day'); })
            .reduce(function(sum, o) {
              if (o.servicesPrices && o.servicesPrices.totalPrice) {
                return sum + parseFloat(o.servicesPrices.totalPrice);
              }
              return sum;
            }, 0);
          console.log('Daily earnings:', this.dailyEarnings);
        }.bind(this), function(err) {
          console.error('Error loading daily earnings:', err);
        });
    } catch (err) {
      console.error('Error in loadDailyEarnings:', err);
    }
  }

  loadHistory() {
    try {
      this.histSub = this.db.getAllWorksAcceptedsDate()
        .subscribe(function(list) {
          this.orderHistory = list
            .map(function(r) { return { key: r.payload.key, payload: r.payload.val() }; })
            .filter(function(o) { return o.payload.status === 'Finalizado'; })
            .slice(-5)
            .reverse()
            .map(function(o) {
              return {
                key: o.key,
                driver: o.payload.driver || {},
                user: o.payload.user || {},
                dropPoints: o.payload.dropPoints,
                finalizedAt: o.payload.finalizedAt,
                servicesPrices: o.payload.servicesPrices,
                createdAt: o.payload.createdAt
              };
            });
          console.log('Loaded order history:', this.orderHistory.length);
        }.bind(this), function(err) {
          console.error('Error loading order history:', err);
        });
    } catch (err) {
      console.error('Error in loadHistory:', err);
    }
  }

  trackLocation() {
    try {
      var opts = { timeout: 10000, enableHighAccuracy: true };
      this.locSub = Observable.interval(30000)
        .switchMap(function() {
          return Observable.fromPromise(this.geo.getCurrentPosition(opts));
        }.bind(this))
        .subscribe(function(pos) {
          var latitude = pos.latitude || 0;
          var longitude = pos.longitude || 0;
          this.dataInfo.userInfo.latitude = latitude;
          this.dataInfo.userInfo.longitude = longitude;
          this.events.publish('save-lat-long');
          console.log('Updated location:', latitude, longitude);
        }.bind(this), function(err) {
          console.error('Error tracking location:', err);
        });
    } catch (err) {
      console.error('Error in trackLocation:', err);
    }
  }

  initializeMap() {
    try {
      this.bounds = new google.maps.LatLngBounds();
      var startPosition = new google.maps.LatLng(
        this.dataInfo.userInfo.latitude || -15.826944,
        this.dataInfo.userInfo.longitude || -48.0313344
      );

      var mapOptions = {
        center: startPosition,
        zoom: 12
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.icon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      console.log('Map initialized at:', startPosition);
    } catch (err) {
      console.error('Error in initializeMap:', err);
    }
  }

  centerMap() {
    try {
      var center = new google.maps.LatLng(
        this.dataInfo.userInfo.latitude || -15.826944,
        this.dataInfo.userInfo.longitude || -48.0313344
      );
      this.map.panTo(center);
      console.log('Map centered at:', center);
    } catch (err) {
      console.error('Error in centerMap:', err);
    }
  }

  fit() {
    try {
      this.map.fitBounds(this.bounds);
      console.log('Map bounds fitted');
    } catch (err) {
      console.error('Error in fit:', err);
    }
  }

  clearMarkers(map) {
    try {
      for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(map);
      }
      console.log('Cleared markers');
    } catch (err) {
      console.error('Error in clearMarkers:', err);
    }
  }

  clearAll() {
    try {
      this.clearMarkers(null);
      this.markers = [];
      console.log('Cleared all markers');
    } catch (err) {
      console.error('Error in clearAll:', err);
    }
  }

  setFilteredItems() {
    try {
      this.clearAll();
      if (this.requestType === 'Serviço') {
        this.allJobs.forEach(function(element) {
          this.searchAndAdd(element);
        }.bind(this));
      } else if (this.requestType === 'Todos') {
        this.allOnline.forEach(function(element) {
          this.searchAndAddOnline(element);
        }.bind(this));
      } else if (this.requestType === 'Cliente') {
        this.allClientsOnline.forEach(function(element) {
          this.searchAndAddOnline(element);
        }.bind(this));
      }
      console.log('Filtered items set for requestType:', this.requestType);
    } catch (err) {
      console.error('Error in setFilteredItems:', err);
    }
  }

  searchAndAdd(element) {
    try {
      var searchTermLower = this.searchTerm.toLowerCase();
      var matchesName = element.user && element.user.firstName && element.user.firstName.toLowerCase().indexOf(searchTermLower) !== -1;
      var matchesWorker = element.driver && element.driver.firstName && element.driver.firstName.toLowerCase().indexOf(searchTermLower) !== -1;
      if (matchesName || matchesWorker) {
        this.loadUsersMarkers(element);
      }
    } catch (err) {
      console.error('Error in searchAndAdd:', err);
    }
  }

  searchAndAddOnline(element) {
    try {
      var searchTermLower = this.searchTerm.toLowerCase();
      if (element.name && element.name.toLowerCase().indexOf(searchTermLower) !== -1) {
        this.loadOnlineMarkers(element);
      }
    } catch (err) {
      console.error('Error in searchAndAddOnline:', err);
    }
  }

  loadOnlineMarkers(info) {
    try {
      if (info.latitude && info.longitude) {
        var marker = new google.maps.Marker({
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
        console.log('Added online marker for:', info.name);
      }
    } catch (err) {
      console.error('Error in loadOnlineMarkers:', err);
    }
  }

  loadUsersMarkers(info) {
    try {
      var latitude = info.driver && info.driver.latitude;
      var longitude = info.driver && info.driver.longitude;
      var driverName = info.driver && info.driver.firstName ? info.driver.firstName + ' ' + (info.driver.lastName || '') : 'Profissional';

      if (latitude && longitude) {
        var marker = new google.maps.Marker({
          label: {
            color: 'black',
            fontWeight: 'bold',
            text: driverName
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
        console.log('Added driver marker for:', driverName);
      }
    } catch (err) {
      console.error('Error in loadUsersMarkers:', err);
    }
  }

  showProfessionalsOnline() {
    try {
      this.requestType = 'Todos';
      this.clearAll();
      this.allOnline.forEach(function(info) {
        this.loadOnlineMarkers(info);
      }.bind(this));
      console.log('Showing professionals online');
    } catch (err) {
      console.error('Error in showProfessionalsOnline:', err);
    }
  }

  showClientsOnline() {
    try {
      this.requestType = 'Cliente';
      this.clearAll();
      this.allClientsOnline.forEach(function(info) {
        this.loadOnlineMarkers(info);
      }.bind(this));
      console.log('Showing clients online');
    } catch (err) {
      console.error('Error in showClientsOnline:', err);
    }
  }

  loadWorks() {
    try {
      this.clearAll();
      if (this.allJobs.length > 0) {
        this.allJobs.forEach(function(element) {
          if (this.dataInfo.userInfo.isAdmin || element.uid === this.dataInfo.userInfo.uid) {
            this.loadUsersMarkers(element);
          }
        }.bind(this));
      }
      console.log('Loaded works:', this.allJobs.length);
    } catch (err) {
      console.error('Error in loadWorks:', err);
    }
  }

  loadOnlines() {
    try {
      this.getWorkers().then(function() {
        this.getClients();
        if (this.requestType === 'Todos') {
          this.showProfessionalsOnline();
        } else if (this.requestType === 'Cliente') {
          this.showClientsOnline();
        }
      }.bind(this));
    } catch (err) {
      console.error('Error in loadOnlines:', err);
    }
  }

  getWorkers() {
    var self = this;
    return new Promise<void>(function(resolve) {
      try {
        self.db.getWorkers()
          .subscribe(function(data) {
            self.getWorkersCallback(data);
            resolve();
          }, function(err) {
            console.error('Error loading workers:', err);
            resolve();
          });
      } catch (err) {
        console.error('Error in getWorkers:', err);
        resolve();
      }
    });
  }

  getWorkersCallback(data) {
    try {
      this.allOnline = [];
      this.totalOnline = 0;

      data.forEach(function(element) {
        var info = element.payload.val();
        info.key = element.payload.key;

        if (info.status !== 'Desativado' && info.status !== 'Removido') {
          if (info.lastDatetime && moment(info.lastDatetime).add(10, 'minutes').isAfter(moment())) {
            if (this.dataInfo.userInfo.isAdmin || info.region === this.dataInfo.userInfo.region) {
              this.totalOnline++;
              this.allOnline.push(info);
            }
          }

          this.allJobs.forEach(function(job) {
            if (job.driver && job.driver.uid === info.uid) {
              job.driver.latitude = info.latitude;
              job.driver.longitude = info.longitude;
            }
          });
        }
      }.bind(this));

      this.sortOnline();
      console.log('Processed workers:', this.totalOnline);
    } catch (err) {
      console.error('Error in getWorkersCallback:', err);
    }
  }

  sortOnline() {
    try {
      this.allOnline.sort(function(a, b) {
        if (a.name && b.name) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        }
        return 0;
      });
      console.log('Sorted online users');
    } catch (err) {
      console.error('Error in sortOnline:', err);
    }
  }

  getClients() {
    try {
      this.db.getClients()
        .subscribe(function(data) {
          this.getClientsCallback(data);
        }.bind(this), function(err) {
          console.error('Error loading clients:', err);
        });
    } catch (err) {
      console.error('Error in getClients:', err);
    }
  }

  getClientsCallback(data) {
    try {
      this.totalOnlineClients = 0;
      this.allClientsOnline = [];

      data.forEach(function(element) {
        var info = element.payload.val();
        info.key = element.payload.key;

        if (info.status !== 'Desativado' && info.status !== 'Removido') {
          if (info.lastDatetime && moment(info.lastDatetime).isSame(moment(), 'day') && moment(info.lastDatetime).add(10, 'minutes').isAfter(moment())) {
            if (this.dataInfo.userInfo.isAdmin || (this.dataInfo.userInfo.managerRegion && info.region === this.dataInfo.userInfo.managerRegion)) {
              this.totalOnlineClients++;
              this.allClientsOnline.push(info);
            }
          }
        }
      }.bind(this));
      console.log('Processed clients:', this.totalOnlineClients);
    } catch (err) {
      console.error('Error in getClientsCallback:', err);
    }
  }

  startIntervalJobs() {
    try {
      if (this.worksInterval) clearInterval(this.worksInterval);
      this.worksInterval = setInterval(function() {
        if (!this.liveSub || this.liveSub.closed) {
          this.loadLive();
        }
        this.loadOnlines();
      }.bind(this), 30000);
      console.log('Started interval jobs');
    } catch (err) {
      console.error('Error in startIntervalJobs:', err);
    }
  }

  edit(work) {
    try {
      this.navCtrl.push('SearchDeliveryPage', { payload: work });
      console.log('Navigating to SearchDeliveryPage for work:', work.key);
    } catch (err) {
      console.error('Error in edit:', err);
    }
  }

  confirmFinish(work) {
    try {
      var clientName = work.user && work.user.firstName ? work.user.firstName : 'Cliente';
      var alert = this.alertCtrl.create({
        title: 'Confirmar Finalização',
        message: 'Deseja finalizar a corrida de ' + clientName + '?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Finalizar',
            handler: function() {
              this.finishWorkDelivery(work);
            }.bind(this)
          }
        ]
      });
      alert.present();
      console.log('Showing finish confirmation for:', clientName);
    } catch (err) {
      console.error('Error in confirmFinish:', err);
    }
  }

  confirmCancel(work) {
    try {
      var clientName = work.user && work.user.firstName ? work.user.firstName : 'Cliente';
      var alert = this.alertCtrl.create({
        title: 'Confirmar Cancelamento',
        message: 'Deseja cancelar a corrida de ' + clientName + '?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: function() {
              this.cancelWorkDelivery(work);
            }.bind(this)
          }
        ]
      });
      alert.present();
      console.log('Showing cancel confirmation for:', clientName);
    } catch (err) {
      console.error('Error in confirmCancel:', err);
    }
  }

  finishWorkDelivery(work) {
    try {
      var self = this;
      var key = work.key;
      var finalizedAt = moment().format('YYYY-MM-DD HH:mm:ss');
      var historyData = {
        user: work.user || {},
        driver: work.driver || {},
        dropPoints: work.dropPoints || [],
        servicesPrices: work.servicesPrices || {},
        createdAt: work.createdAt || '',
        userId: work.userId || '',
        driverId: work.driver && work.driver.uid ? work.driver.uid : '',
        status: 'Finalizado',
        finalizedAt: finalizedAt
      };

      // Update order status to Finalizado
      self.db.changeStatus(key, 'Finalizado')
        .then(function() {
          console.log('Updated order status to Finalizado:', key);
          // Save to orderHistory
          return self.db.addToOrderHistory(historyData);
        })
        .then(function() {
          console.log('Saved order to history:', key);
          // Remove from orders
          return self.db.removeWorkRequest(key);
        })
        .then(function() {
          console.log('Removed order from orders:', key);
          // Reload live orders
          self.loadLive();
          // Show success message
          var alert = self.alertCtrl.create({
            title: 'Sucesso',
            message: 'Corrida finalizada e movida para o histórico.',
            buttons: [{ text: 'OK' }]
          });
          alert.present();
        })
        .catch(function(err) {
          console.error('Error finishing work:', err);
          var alert = self.alertCtrl.create({
            title: 'Erro',
            message: 'Falha ao finalizar a corrida. Tente novamente.',
            buttons: [{ text: 'OK' }]
          });
          alert.present();
        });
    } catch (err) {
      console.error('Error in finishWorkDelivery:', err);
    }
  }

  cancelWorkDelivery(work) {
    try {
      var msg = 'Cancelado pelo painel às ' + moment().format('DD/MM/YYYY HH:mm');
      this.db.cancelWork(work.key, msg)
        .then(function() {
          this.loadLive();
          console.log('Cancelled work:', work.key);
        }.bind(this))
        .catch(function(err) {
          console.error('Error cancelling work:', err);
        });
    } catch (err) {
      console.error('Error in cancelWorkDelivery:', err);
    }
  }

  showOnMap(order) {
    try {
      this.navCtrl.push('WorkWatchPage', { order: order });
      console.log('Navigating to WorkWatchPage for order:', order.key);
    } catch (err) {
      console.error('Error in showOnMap:', err);
    }
  }

  goPageDashboard() {
    try {
      this.navCtrl.setRoot('HomePage');
      console.log('Navigating to HomePage');
    } catch (err) {
      console.error('Error in goPageDashboard:', err);
    }
  }

  goPageClients() {
    try {
      this.navCtrl.push('ClientsPage');
      console.log('Navigating to ClientsPage');
    } catch (err) {
      console.error('Error in goPageClients:', err);
    }
  }

  goPagProfessionals() {
    try {
      this.navCtrl.push('ProfessionalsPage');
      console.log('Navigating to ProfessionalsPage');
    } catch (err) {
      console.error('Error in goPagProfessionals:', err);
    }
  }

  goPageWorks() {
    try {
      this.navCtrl.push('WorkPage');
      console.log('Navigating to WorkPage');
    } catch (err) {
      console.error('Error in goPageWorks:', err);
    }
  }

  goPageWorkWatch() {
    try {
      this.navCtrl.push('WorkWatchPage');
      console.log('Navigating to WorkWatchPage');
    } catch (err) {
      console.error('Error in goPageWorkWatch:', err);
    }
  }

  goPageHistory() {
    try {
      this.navCtrl.push('HistoryPage');
      console.log('Navigating to HistoryPage');
    } catch (err) {
      console.error('Error in goPageHistory:', err);
    }
  }

  goPageSettings() {
    try {
      this.navCtrl.push('SettingsPage');
      console.log('Navigating to SettingsPage');
    } catch (err) {
      console.error('Error in goPageSettings:', err);
    }
  }

  suporte() {
    try {
      var url = this.dataInfo.appConfig.appHelp;
      window.open(url, '_blank');
      console.log('Opening support URL:', url);
    } catch (err) {
      console.error('Error in suporte:', err);
    }
  }

  goPageTablePrice() {
    try {
      this.navCtrl.push('TablesPricePage');
      console.log('Navigating to TablesPricePage');
    } catch (err) {
      console.error('Error in goPageTablePrice:', err);
    }
  }

  logout() {
    try {
      this.events.publish('logout');
      console.log('Triggered logout event');
    } catch (err) {
      console.error('Error in logout:', err);
    }
  }
}