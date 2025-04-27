import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import * as moment from 'moment-timezone';

@Injectable()
export class DataInfoProvider {  

  
  // CONFIGURAÇÕES DO APP  
  isDev: Boolean = false
  appName: string = "Pedmoto Painel"
  primeiroUso: Boolean = false
  appVersion: string = ""   
  appIsActive: Boolean = true
  appConfig: any 
  appIsSMSEnabled: Boolean = false
  appIsCreditsEnabled: Boolean = true
  appCreditWorkValue: number = 1  
  
  userTotalCreditsRun: number = 0
  
  defaultState: string = 'DF' 

  defaultCity: string = '' 
  appCreditUseTotalValue:Boolean = true
  urlFirebase: string = ""

  defaultCarPic: string = '../assets/imgs/100x100.png'  
  imgDefaultClient: string = '../assets/imgs/100x100.png'
  isWeb: Boolean = false
  isHome: Boolean = false
  userInfo: any;       
  
  isTest: Boolean = false    
  tablePrice: any
  services: any = []
  worksRequests: any = []
  worksAccepteds: any = []
  latitude: number = 0
  longitude: number = 0
  userType: number = 2  
  isWorkAcceptCounter: number = 0
  iconLocationClient: string = 'https://firebasestorage.googleapis.com/v0/b/zappex-40e26.appspot.com/o/imagens%2Fgooglemapbluedot.png?alt=media&token=73c88358-7290-4637-a6f1-95966438d00b'  
  
  iconLocationWorker: string = 'https://firebasestorage.googleapis.com/v0/b/zappex-40e26.appspot.com/o/imagens%2Fgooglemapbluedot.png?alt=media&token=73c88358-7290-4637-a6f1-95966438d00b'
  banks: any = [ 'Banco do Brasil', 'Bradesco', 'Caixa Econômica', 'Itaú', 'Nubank',];
  workStatus: any = [ 'Todos', 'Criado', 'Aceito', 'Iniciado', 'Cancelado', 'Finalizado', 'Vencida']; 
  workStatusIfood: any = ['Todos', 'AGUARDANDO CONFIRMAÇÃO', 'PEDIDO CANCELADO', 'PEDIDO NÃO CANCELADO', 'PEDIDO CONFIRMADO', 'PEDIDO DESPACHADO', 'PEDIDO FINALIZADO']
  onPedidoStatus: any = ['Todos', 'Pedido não recebido', 'Pedido recebido', 'Pedido confirmado', 'Pedido despachado', 'Pedido cancelado']
  ifoodPaymentsMethod: any = ["Todos"]
  token: string = 'DemoApp'      
  isAdmin: Boolean = false;
  addressServer: string = "localhost" 
  eventFcmToken: string = 'fcm:netToken'
  eventFcmStart: string = 'fcm:start'
  eventFcmNew: string = 'fcm:newMsg'
  isFcmStarted: Boolean = false
  
  titleAreYouSure: string = "Tem certeza?"    
  titleChangePic: string = "Modificar foto"
  titleCompleteDescription: string = "Digite sua descrição aqui para ganhar pontos"
  titleUploading: string = "Enviando..."
  
  titleUsernameMinLenght: string = "Verificar usuário"
  titlePasswordMinLenght: string = "Verificar senha"
  pleaseWait: string = "Favor aguarde"
  titleAuthError: string = "Erro de autenticação"
  titleCheckMailbox: string = "Verifique seu e-mail"
  titleAuthRecoveryError: string = "Erro ao recuperar senha"
  titleStatusVerified: string = "Perfil verificado"
  titleStatusNotVerified: string = "Perfil não verificado"
  titleCreatingProfile: string = "Criando seu perfil"
  titleRankingGold: string = 'Ouro'  
  titleRankingSilver: string = 'Prata'  
  titleRankingBronze: string = 'Bronze'  
  titleRankingStar: string = 'Estrela'  
  titleProfileVerified: string = "Perfil verificado"  
  titleSettings: string = "Configurações"
  titlePayment: string = "Pagamentos"
  titlePaymentWaiting: string = "Aguardando pagamento"  
  titlePaymentOk: string = "Pagamento aceito"
  titlePaymentCancel: string = "Pagamento cancelado"

  titleClients: string = "Clientes"
  titleProfessionals: string = "Profissionais"
  titleAgenda: string = "Agenda"
  titleCancel: string = "Cancelar"
  titleConfirm: string = "Confirmar essa semana"
  titleConfirmAll: string = "Confirmar 1 mês"
  titleLoadingInformations: string = "Carregando informações"

  titleVerifyProfile: string = "Para verificar o perfil do profissional e permitir o mesmo receber propostas, clique no botão Verificar. Caso contrário, clique em Não verificar."
  

  constructor(public platform: Platform) {    

   if(this.platform.is('core') || this.platform.is('mobileweb')) {
      this.isWeb = true;
    } else {
      this.isWeb = false;
    }

    moment.locale('pt-br');    
  }
  
  getToken(){
    return this.token
  }
  
  dataURItoBlob(dataURI) {    
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  };

  getTotalRegisterCompleted(target_){

    let totalRegisterCompleted = 0;

    if(target_.name)
      totalRegisterCompleted++

    if(target_.lastName)
      totalRegisterCompleted ++

    if(target_.address)
      totalRegisterCompleted++

    if(target_.photo)
      totalRegisterCompleted++

    if(target_.tel)
      totalRegisterCompleted++       
    
    let total = totalRegisterCompleted * 20

    return total
  }




  getTotalRegisterCompletedStr(target_){

    let total = this.getTotalRegisterCompleted(target_)
    let totalRegisterStatusStr = "Incompleto";

    if(total == 100)
      totalRegisterStatusStr = "Completo"
      
    return totalRegisterStatusStr
  }

  getData(){    
    return moment().tz('America/Sao_Paulo').format('LLLL');     
  }

  getDataStr(date){
    return moment(date).tz('America/Sao_Paulo').format()
  }

  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };

  setToken(tokenTmp) {    
    this.token = tokenTmp
  }  

  changeBanksBr(){

    this.banks = [
      'Banco do Brasil',
      'Bradesco',
      'Caixa Econômica',
      'Itaú',
      'Sicred',
      'Banrisul',
      'Santander'
    ]; 

 }

 changeBanksScotland(){

    this.banks = [
      'HSBC',
      'LLOYDS BANK ',
      'ROYAL BANK OF SCOTLAND ',
      'BARCLAYS',
      'SANTANDER',
      'NATIONWIDE',
      'MONZO',
      'MONESE',
      'CITIBANK'
    ]; 
 }


  
}
