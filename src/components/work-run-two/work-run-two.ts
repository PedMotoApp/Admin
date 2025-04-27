import { Component, Input } from '@angular/core';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';

@Component({
  selector: 'work-run-two',
  templateUrl: 'work-run-two.html'
})
export class WorkRunTwoComponent {

  @Input() workKey: string
  @Input() workStatus: string = "Aceito"  
  @Input() viewType: string;

  @Input() driverUid: string = ""
  @Input() driverName: string = ""
  @Input() driverPhoto: string = ""
  @Input() driverPhone: string = ""
  @Input() driverLatitude: string = ""
  @Input() driverLongitude: string = ""
  
  @Input() carName: string = ''
  @Input() carPlate: string = ''
  @Input() arriveTime: string = ''
  
  @Input() fromAddress: string = ''
  @Input() toAddress: string = ''
  @Input() toReference: string = ''
  @Input() startPosition: any;
	@Input() originPosition: string = "";
  @Input() destinationPosition: string = "";	

  @Input() totalDistance: string = ''
  @Input() totalTravelingTime: string = ''
  @Input() estimateArrival: string = ''
  @Input() totalValue: string = ''
  
  @Input() clientName: string = ""
  @Input() clientPhoto: string = ""
  @Input() clientPhone: string = ""  	  
  
  @Input() paymentKey: string = ""
  @Input() paymentPath: string = ""

  @Input() alreadyRated: Boolean = false

  constructor(
    public dataInfo: DataInfoProvider,
    public events:Events) {

      setTimeout(() => {       
        this.fromAddress = this.fromAddress.substring(0, 40)
  
      })
      
  }

  navigate(){
    this.events.publish('navigate')
  }
  
  start(){
    this.events.publish('start-run')
  }

  finish(){
    this.events.publish('finish-run')
  }

  cancel(){
    this.events.publish('cancel-run')
  }

  canceled(){
    this.events.publish('canceled-run')
  }

  tripFinished(){
    this.events.publish('finished-run')
  }

  contactsClient(){
    this.events.publish('contacts-client')
  }

  contactsProfessional(){
    this.events.publish('contacts-professional')
  }

}
