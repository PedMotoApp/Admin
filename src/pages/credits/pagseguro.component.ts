import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PagSeguroService } from './pagseguro.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { IMyDpOptions } from 'mydatepicker';
import { Platform, Events } from 'ionic-angular';
import { IMyDate } from 'mydatepicker';
import { DataInfoProvider } from '../../providers/data-info/data-info'

declare var PagSeguroDirectPayment: any;

@Component({
  selector: 'pagseguro-component',
  templateUrl: 'pagseguro.component.html'
})
export class PagSeguroComponent implements OnInit {

  @Output() checkout: EventEmitter<string> = new EventEmitter();

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

  constructor(
    private pagSeguroService: PagSeguroService,
    private formBuilder: FormBuilder,    
    public dataInfo: DataInfoProvider,      
    public events: Events,
    public platform: Platform) {      

    this.dateMin = moment().format(this.DATE_FORMAT);
    this.dateMax = moment().add(30, 'years').format(this.DATE_FORMAT);

    this.myDatePickerOptions = {
      editableDateField: false,
      showTodayBtn: false,
      openSelectorOnInputClick: true,
      showClearDateBtn: false,
    }

  }

  ngOnInit() {
    this.iniciaPagSeguro()    
  }

  ngOnDestroy() {
    if (this.amountSubscription) {
      this.amountSubscription.unsubscribe();
    }
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
        this.msgInit = "Sessão carregada com sucesso..." + this.sessionId

        PagSeguroDirectPayment.setSessionId(this.sessionId);
        
        this.msgInit = "Carregando {{dataText.options}} de pagamento..."

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

  initFormDinheiro() {
    this.paymentForm = this.formBuilder.group({
      paymentMethod: ['local'],
      troco: [''],
      metodoLocal: [''],
      cpf: ['0000000000']
    }); 
    
    this.paymentForm.controls.metodoLocal.setValue('Dinheiro')
  }  

  paymentOptionChanged() {
    if (this.paymentForm.value.paymentMethod === 'boleto') {
      this.initFormBoleto();
    }
    else if (this.paymentForm.value.paymentMethod === 'local') {      
      this.initFormDinheiro()
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
      this.checkout.emit('checkout');
      this.processing = false;
    }
  }

  fetchZip(zip) {
    // this.pagSeguroService.fetchZip(zip, true);
  }

  metodoLocalChanged(){
    this.events.publish('checkTaxes', this.paymentForm.value.metodoLocal);     
  }

}
