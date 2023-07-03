import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import {
  CheckboxCustomEvent,
  IonModal,
  IonRouterOutlet,
  LoadingController,
} from '@ionic/angular';
import { PokemonsService } from 'src/app/services/pokemons.service';
import { ControllerService } from 'src/app/services/controller.service';
import { Pokemon } from 'src/app/pokemons-type';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  presentingElement: HTMLIonRouterOutletElement;

  private sounds: { [key: string]: HTMLAudioElement } = {
    click: new Audio(),
    pch: new Audio(),
    problem: new Audio(),
  };
  shiny:boolean=false;
  female:boolean=false;
  reverted:boolean=false;
  idStart:number=1;
  idEnd:number=150;
  pokemonData:Pokemon | null = null;
  pokemonId=1;
  alert:string="";
  public alertInputsPokemons = [
    {
      name: 'startId',
      type: 'number',
      placeholder: 'Id de début',
      min: 1,
    },
    {
      name: 'endId',
      type: 'number',
      placeholder: 'Id de fin',
      min: 1,
    },
  ];
  public alertButtons = [
    {
      text: 'Annuler',
      role: 'cancel',
    },
    {
      text: 'Valider',
      role: 'confirm',
      handler: (value: id) => {
        switch (this.alert) {
          case "types":
            this.pokemon.downloadTypes();
            break;
          case "pokemons":
            const startId: number = parseInt(value.startId, 10);
            const endId: number = parseInt(value.endId, 10);
            if (startId > 0 && endId > 0 && startId <= endId){
              this.pokemon.initPokemons(startId,endId);
            } else {
              this.ctrl.toast("Attention la tranche d'id des pokémons n'est pas correctement définit","warning");
            }
            break;
        }
      },
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private pokemon: PokemonsService,
    private ctrl: ControllerService
  ) {
    this.presentingElement = routerOutlet.nativeEl;
    this.sounds['click'].src = '../../assets/sounds/sons_bip.mp3';
    this.sounds['pch'].src = '../../assets/sounds/sons_pch.mp3';
    this.sounds['problem'].src = '../../assets/sounds/sons_problem.mp3';
  }

  async ngOnInit(){
    const result = await this.authService.getIdStartAndEnd();
    if (result && result.idStart && result.idEnd){
      this.idStart = result.idStart;
      this.idEnd = result.idEnd
      this.pokemonData = await this.pokemon.getPokemonData(this.idStart);
    }else {
      this.pokemonData = await this.pokemon.getPokemonData(1);
    }
    console.log(this.pokemonData)
  }

  async logout() {
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  changeAlert(name: string){
    this.alert = name;
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

  changeId(){
    this.authService.updateId(this.idStart,this.idEnd)
  }
}

interface id {
  endId:string;
  startId:string;
}