import { Component, OnInit  } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { PagSeguroService } from './pagseguro.service';
import { PagSeguroData } from './pagseguro.data';
import { DatabaseProvider } from '../../providers/database/database';
import * as moment from 'moment';
import { AuthProvider } from '../../providers/auth/auth';
import { Subscription } from 'rxjs/Subscription'
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IMyDpOptions } from 'mydatepicker';
import { IMyDate } from 'mydatepicker';
import { DataTextProvider } from '../../providers/data-text/data-text'

declare var PagSeguroDirectPayment: any;

@IonicPage()
@Component({
  selector: 'page-credits',
  templateUrl: 'credits.html',
})
export class CreditsPage {

  DATE_FORMAT = 'YYYY-MM-DD';
  paymentMethods;
  private sessionId: number;
  public cardBrand: any;
  public paymentForm: FormGroup;
  public processing = false;
  installments: any;
  private amountSubscription: Subscription;
  private amount: number;  

  private errorSession: Boolean = false
  private msgInit: string
  public isLoaded: Boolean = false

  dateMax: string;
  dateMin: string;
  expirationMonths: string[] = [];
  expirationYears: string[] = [];

  public myDatePickerOptions: IMyDpOptions;

  paymentMethod: any = "boleto"
  itemsData: PagSeguroData;  
  dateYear: string = ""
  dateMonth: string = ""
  dateToday: string = ""
  finalValue: number = 0  
  paymentsObserve: Observable<any>;  
  addValue: number = 10

  pagSeguroToken: string = "61b18c22-8faa-487c-8f0e-81c254783f96237fb0b941478b7b4ce02deb0c7c9a35e3b1-0f35-44b9-823a-9026be05f7bf"
  pagSeguroEmail: string = "admin@dbltecnologia.com.br"

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,   
    public authProvider: AuthProvider,  
    public uiUtils: UiUtilsProvider,
    private pagSeguroService: PagSeguroService,
    private formBuilder: FormBuilder,    
    public events: Events,
    public platform: Platform,
    public db: DatabaseProvider,
    public dataText: DataTextProvider,
    public dataInfo: DataInfoProvider) {

      this.dateMin = moment().format(this.DATE_FORMAT);
      this.dateMax = moment().add(30, 'years').format(this.DATE_FORMAT);

      this.myDatePickerOptions = {
        editableDateField: false,
        showTodayBtn: false,
        openSelectorOnInputClick: true,
        showClearDateBtn: false,
      }      
  }

  ngOnInit(){        
    this.subscribeStuff()
    this.startPagSeguro()
    this.iniciaPagSeguro()    
    
    if(! this.dataInfo.userInfo.credits)
      this.dataInfo.userInfo.credits = "0.00"

    this.addValue = 5.01
  }
  
  sandBox(){
      this.paymentForm.patchValue({
        card: {
          name: this.dataInfo.userInfo.name + ' Desenvolvimento',
          cardNumber: '4111111111111111',
          month: 12,
          year: 2030,
          cvv: 123,
          cpf: '58980908008'
        },
        address: {
          postalCode: '70660081',
          street: 'Endereço do profissional',
          number: 100
        },
        phone: '61983013768',

     })
  }

  iniciaPagSeguro(){

    this.isLoaded = false
    this.msgInit = "Iniciando checkout transparente..."    
    this.errorSession = false
    this.initFormCard();
    this.initExpirationDates();
    this.pagSeguroService.setForm(this.paymentForm);
    this.pagSeguroService.restoreCheckoutData();

    this.amountSubscription = this.pagSeguroService.amount$.subscribe(amount => {
      this.amount = amount;
      this.fetchInstallments();
    });

    this.msgInit = "Iniciando Sessão Segura com PagSeguro..."        

    this.pagSeguroService.loadScript().then(_ => {      
      
      this.pagSeguroService.startSession().then(response => {
        let result = response;        
        this.sessionId = result.session.id;
        this.msgInit = "Sessão carregada com sucesso..."

        PagSeguroDirectPayment.setSessionId(this.sessionId);                

        this.pagSeguroService.getPaymentMethods(this.amount || 100)
        .then(responsePayment => {

          this.msgInit = "Checkout iniciado com sucesso!"
          this.paymentMethods = responsePayment.paymentMethods;

          this.verificaTipoPagamento()

        }).catch(error => {

          this.errorSession = true
          this.msgInit = "Erro ao recuperar metodos de pagamento"    
        });

      }).catch(error => {

        this.errorSession = true
        this.msgInit = "Erro ao recuperar metodos de pagamento"    
      });
    })
    
    .catch(error => {
      this.errorSession = true
    });
  }

  verificaTipoPagamento(){    
    this.isLoaded = true    
    this.paymentForm.value.paymentMethod == 'creditCard'
    this.paymentOptionChanged()    
  }  

  initExpirationDates() {
    for (let month = 1; month <= 12; month++) {
      this.expirationMonths.push(this.pad(month));
    }
    for (let year = 0; year <= 30; year++) {
      this.expirationYears.push(moment().add(year, 'years').format('YYYY'));
    }
  }

  public pad(d: number) {
    return (d < 10) ? '0' + d.toString() : d.toString();
  }

  initFormCard() {
    this.paymentForm = this.formBuilder.group({
      paymentMethod: ['creditCard'],
      card: this.formBuilder.group({
        cardNumber: ['', [Validators.required, Validators.maxLength(16)]],
        name: ['', [Validators.required, Validators.minLength(10)]],
        month: ['', [Validators.required]],
        year: ['', [Validators.required]],
        installments: [''],
        cvv: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required]]
      }),
      address: this.formBuilder.group({
        state: [''],
        country: [''],
        postalCode: [Validators.required],
        number: [Validators.required],
        city: [''],
        street: [Validators.required],
        district: ['']
      }),
      phone: [''],
      ionBirthDate: [moment().subtract(18, 'years').month(0).date(1).format(this.DATE_FORMAT)],
      mydpBirthdate: [{ date: this.convertToDatePicker(moment().subtract(18, 'years').month(0).date(1)) }]
    });
  }

  public convertToDatePicker(date: moment.Moment): IMyDate {
    return { year: date.year(), month: date.month() + 1, day: date.date() };
  }


  initFormBoleto() {
    this.paymentForm = this.formBuilder.group({
      paymentMethod: ['boleto'],
      cpf: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(11)]]
    });
  }
 
  paymentOptionChanged() {
    if (this.paymentForm.value.paymentMethod === 'boleto') {
      this.initFormBoleto();
    }
    else {
      this.initFormCard();
    }

    this.pagSeguroService.setForm(this.paymentForm);
    this.pagSeguroService.restoreCheckoutData();
    this.events.publish('payment-method', this.paymentForm.value.paymentMethod)
    
  }

  initializeComponent() {
    this.pagSeguroService.loadScript();
  }
 
  getBrand() {
    if (this.paymentForm.value.card.cardNumber.length >= 6) {
      if (!this.cardBrand) {
        this.pagSeguroService.getCardBrand(this.paymentForm.value.card.cardNumber).then(result => {
          this.cardBrand = result.brand;
          this.fetchInstallments();
        }).catch(error => {
          this.paymentForm.controls['card'].setErrors({ 'cardNumber': true });
        });
      }
    } else {
      this.cardBrand = null;
    }
  }

  fetchInstallments() {
    this.installments = 0;
    this.paymentForm.patchValue({card: {installments: ''}});
    if (this.cardBrand) {
      this.pagSeguroService.getInstallments(this.amount, this.cardBrand.name, 6).then(result => {
        this.installments = result.installments[this.cardBrand.name];
        this.paymentForm.patchValue({
          card: {
            installments: this.installments[0].quantity
          }
        });
      }).catch(error => {
        console.error('error getting installments', error);
        this.paymentForm.controls['card'].setErrors({ 'installments': true });
      });
    }

  }

  getCardImage() {
    if (this.paymentMethods && this.cardBrand) {
      return this.pagSeguroService.getOptions().filesURL + this.paymentMethods.CREDIT_CARD.options[this.cardBrand.name.toUpperCase()]
      .images.SMALL.path;
    } else {
      return '';
    }
  }

  getCardDisplayName() {
    if (this.paymentMethods && this.cardBrand) {
      return this.paymentMethods.CREDIT_CARD.options[this.cardBrand.name.toUpperCase()].displayName;
    } else {
      return '';
    }
  }

  public doCheckout() {
    this.processing = true;
    if (this.checkout) {
      
      
      this.setCheckoutItems()      
      this.processing = false;
    }
  }

  fetchZip(zip) {
    // this.pagSeguroService.fetchZip(zip, true);
  }

  metodoLocalChanged(){
    this.events.publish('checkTaxes', this.paymentForm.value.metodoLocal);     
  }


  startPagSeguro(){
    
    this.pagSeguroService.setEmail(this.pagSeguroEmail)				
    this.pagSeguroService.setToken(this.pagSeguroToken)  

		this.pagSeguroService.setOptions({

			scriptURL: 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js',
			remoteApi: {
				sessionURL: 'https://us-central1-motok-a98db.cloudfunctions.net/startSession',
				checkoutURL: 'https://us-central1-motok-a98db.cloudfunctions.net/startCheckout '
			} 
		});		
  }
  
  startPagSeguroSandbox(){
    this.pagSeguroService.setEmail(this.pagSeguroEmail)				
    this.pagSeguroService.setToken(this.pagSeguroToken)         

		this.pagSeguroService.setOptions({

			scriptURL: 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js',
			remoteApi: {
				sessionURL: 'https://us-central1-motok-a98db.cloudfunctions.net/startSessionSandbox',
				checkoutURL: ' https://us-central1-motok-a98db.cloudfunctions.net/startCheckoutSandbox'
			} 
		});		
	}
 
  ionViewDidLoad() {    

      if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')  
  
  }

  startInterface(){    
    this.dateToday = moment().format()  
    this.dateYear = moment().format('YYYY')  
    this.dateMonth = moment().format('MM')  
    this.dateToday = moment().format('DD/MM/YYYY HH:mm:ss')          
  }

  subscribeStuff(){
    this.events.subscribe('payment-method', (data => {
      this.paymentMethod = data
    }))    

  }

 
  public setCheckoutItems() {

    this.uiUtils.showToast("Iniciando checkout transparente")
   		
    let areaCode = ''
    let telnumber = ''
    let cpf = ''

    if(this.dataInfo.userInfo.tel){
      areaCode = this.dataInfo.userInfo.tel.substring(0, 2)
      telnumber = this.dataInfo.userInfo.tel.substring(2)
    }          
    
    if(this.dataInfo.userInfo.cpf){
      cpf = this.dataInfo.userInfo.cpf
    }

    let finalValue = this.addValue
    let nameCompleted = this.dataInfo.userInfo.name + " " + this.dataInfo.userInfo.lastName    
    let email = 	this.authProvider.currentUserEmail()
    //let email = 	"c68970429097759974161@sandbox.pagseguro.com.br"    

    this.itemsData = {
      token: this.pagSeguroToken,
      pagSeguroEmail: this.pagSeguroEmail,

      method: this.paymentMethod,
      items: [{
        item: {
          id: '1',
          description: 'Recarga de créditos. Profissional: ' + nameCompleted + '. Horário: ' + moment().format("DD/MM/YYYY hh:mm:ss"),
          amount: finalValue,
          quantity: 1,
        }        
      }],   
      
      sender: {        
        email: email,        
        name: nameCompleted.toUpperCase(),
        phone: {
          areaCode: areaCode,
          number: telnumber
        },
        documents: {
          document: {
            type: 'CPF',
            value: cpf
          }
        }
      },

      creditCard: {

        billingAddress: {
            state: this.dataInfo.userInfo.state,
            country: 'Brasil',
            postalCode: this.dataInfo.userInfo.postCode,
            number: this.dataInfo.userInfo.number,
            city: this.dataInfo.userInfo.city,
            street: this.dataInfo.userInfo.address,
            district: this.dataInfo.userInfo.state,                        
        },

        installment: {
          quantity: 1,
          noInterestInstallmentQuantity: 0,
          
          value: finalValue
        },

      },                     
    }
    
    this.pagSeguroService.addCheckoutData(this.itemsData)
    this.checkout()   
  }


 checkout(){

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)    
    loading.present()

    console.log(this.itemsData)

    this.pagSeguroService.checkout()
    .then( () => {

      if(loading)
        loading.dismiss()

      this.checkoutFinish()      
    })
    .catch((error) => {
      console.log('Erro ao realizar pagamento', error)      

      if(loading)
        loading.dismiss()

      this.uiUtils.showAlertError('Erro ao realizar pagamento. Favor verifique todos os campos e tente novamente.')
    })
  }

  checkoutFinish(){    

    console.log(this.itemsData)

    let fvalue = Number(this.dataInfo.userInfo.credits)
    fvalue += this.addValue

    let msg = "Seus créditos foram adicionados com sucesso. Valor final: R$ " + fvalue        
    let self = this

    this.addValue = 0

    this.db.addPaymentCredits(this.itemsData)
    .then(() => {
      self.dataInfo.userInfo.credits = fvalue
      self.db.updateUserCredits(fvalue)
      self.uiUtils.showAlertSuccess(msg)
    })
  }

 

}
