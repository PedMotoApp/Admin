import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Injectable } from '@angular/core';

declare var google;

@Injectable()
export class GoogleApiProvider {

  geocoder: any = new google.maps.Geocoder;      
  serviceDistance : any = new google.maps.DistanceMatrixService();
  directionsService = new google.maps.DirectionsService();
  directionsWayPoints: any = []

  constructor(public dataInfo: DataInfoProvider) {
    console.log('Hello GoogleApiProvider Provider');    
  }

  calculateRoute(from_: string, to_: string) {    

    let self = this

    return new Promise(function(resolve, reject){

      const request = {
        origin: from_,
        destination: to_,
        waypoints: self.directionsWayPoints,
        travelMode: 'DRIVING'
      };  
  
      self.directionsService.route(request, function (result, status) {          
  
        if (status == 'OK') {        
          resolve(result)
        }
        else {
          reject(result)
        }

      })

    });      

  }
  
  distanceMatrix(from_: string, to_: string){

    let self = this
    
    return new Promise(function(resolve, reject){

      self.serviceDistance.getDistanceMatrix(
        {
          origins: [from_],
          destinations: [to_],
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
  
        }, (response, status) => {               
          resolve(response)
          
        })
    })    
  }
  
  geocodeLatLng(lat, long){

    let self = this
        
    return new Promise(function(resolve, reject){

      var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};            

      self.geocoder.geocode({'location': latlng}, function(results, status) {          
        let data = {result: results[0], status: status}
        resolve(data)
      })

    })
  }

  geocodeAddress(address){

    let self = this
      
    return new Promise(function(resolve, reject){      
    
      self.geocoder.geocode({'address': address}, function(results, status) {    
        
      if (status === 'OK') {
        if (results[0]) {
          resolve(results)
        }
        else 
          reject("Falha ao localizar endereço")
      }

      else 
        reject("Falha ao localizar endereço")

      });
    })        
  }
           

}
