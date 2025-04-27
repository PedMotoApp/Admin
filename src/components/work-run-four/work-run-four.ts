import { Component, Input } from '@angular/core';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';

@Component({
  selector: 'work-run-four',
  templateUrl: 'work-run-four.html'
})
export class WorkRunFourComponent {

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
  
  @Input() textStartButton: string = ""
  @Input() messageTip: string = "Partir para coleta"
  @Input() alreadyRated: Boolean = false

  contactWhatsappActive: Boolean = false

  constructor(
    public dataInfo: DataInfoProvider,
    public events:Events) {      
  }

  setViewType(vt) {
    this.viewType = vt;
  }
  
  navigate(){
    this.events.publish('navigate')
  }

  start(){
    this.events.publish('start-run-delivery')
  }

  next(){
    this.events.publish('next-run-delivery')
  }

  finish(){
    this.events.publish('finish-run-delivery')
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

    if(! this.contactWhatsappActive){
      this.contactWhatsappActive = true

      setTimeout(() => {
        
        this.contactWhatsappActive = false  
        this.events.publish('contacts-client')

      }, 1000);
    }
  }

  contactsProfessional(){
    if(! this.contactWhatsappActive){
      this.contactWhatsappActive = true

      setTimeout(() => {
        
        this.contactWhatsappActive = false  
        this.events.publish('contacts-professional')

      }, 1000);
    }
    
  }

  history(){
    this.events.publish('show-history-run')
  }

}
