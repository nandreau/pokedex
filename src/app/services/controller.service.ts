import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class ControllerService {
  toasts:any;
  loaders:any;

  constructor(private toastController: ToastController,
    private loadingCtrl: LoadingController) { }

  async toast(value:string, color:string) {
    if (this.toasts) {
      this.toasts.dismiss();
    }
    this.toasts = await this.toastController.create({
      message: value,
      duration: 1500,
      color,
    });
    this.toasts.present();
  }

  async loader(value:string) {
    if (this.loaders) {
      this.loaders.dismiss();
    }
    this.loaders = await this.loadingCtrl.create({
      message: value
    });
    this.loaders.present();
  }

  updateString(name: string){
    if (this.loaders && this.loaders.message){
      this.loaders.message = name;
    }
  }

  dismissLoader(){
    this.loaders.dismiss();
  }
}