import { Injectable } from '@angular/core';
import * as firebaseApp from 'firebase/app';
import { DataInfoProvider } from '../../providers/data-info/data-info';

@Injectable()
export class AuthProvider {

  constructor(public config: DataInfoProvider, public dataInfo: DataInfoProvider) {
      
     
  }  

  getUserInfo(){
    return firebaseApp.auth().currentUser
  }

  loginUser(email: string, password: string): Promise<any> {
    return firebaseApp.auth().signInWithEmailAndPassword(email, password);
  }

  loginAnon(): Promise<any> {
    return firebaseApp.auth().signInAnonymously();
  }
  

  signupUser(email: string, password: string, step: number, tel: string): Promise<any> {
    
    return new Promise((resolve, reject) =>{
      firebaseApp

      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then( newUser => {
        firebaseApp
        .database()
        .ref("/userProfile/" + this.dataInfo.defaultState)
        .child(newUser.user.uid)
        .set({ email: email, userType: step, uid:  newUser.user.uid, tel: tel})
        
          .then(() => {
            resolve(newUser.user.uid)
          });          
    })
    .catch((error) => {

      
      reject(error)
    });
  });
  }
  
  resetPassword(email: string): Promise<void> {
    return firebaseApp.auth().sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return firebaseApp.auth().signOut();
  }

  currentUser():  any {

    let user = firebaseApp.auth().currentUser;

    if (user != null) 
      return user
  }

  currentUserUid():  any {
    let user = firebaseApp.auth().currentUser;
    
    if (user != null) 
      return user.uid
  }

  currentUserEmail():  string {
    let user = this.currentUser();
    
    if (user != null) 
      return user.email    
  }

  currentUserPhoto():  string {
    let user = this.currentUser();

    if (user != null) 
      return user.photoURL    
  }

  currentUserDisplayName():  string {
    let user = this.currentUser();

    if (user != null) 
      return user.displayName    
  }
  


}