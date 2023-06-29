import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import {
  CheckboxCustomEvent,
  IonModal,
  IonRouterOutlet,
  LoadingController,
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  presentingElement: HTMLIonRouterOutletElement;

  private sounds: { [key: string]: HTMLAudioElement } = {
    click: new Audio(),
    pch: new Audio(),
    problem: new Audio(),
  };
  shiny:boolean=false;
  female:boolean=false;
  reverted:boolean=false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private routerOutlet: IonRouterOutlet
  ) {
    this.presentingElement = routerOutlet.nativeEl;
    this.sounds['click'].src = '../../assets/sounds/sons_bip.mp3';
    this.sounds['pch'].src = '../../assets/sounds/sons_pch.mp3';
    this.sounds['problem'].src = '../../assets/sounds/problem.mp3';
  }

  async logout() {
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  changeImage(type: string) {
    this.sounds['click'].load();
    this.sounds['click'].play();

    switch (type) {
      case 'shiny':
        this.shiny=!this.shiny;
        break;
      case 'gender':
        this.female=!this.female;
        break;
      case 'rotate':
        this.reverted=!this.reverted;
        break;
    }
    
  }
}
