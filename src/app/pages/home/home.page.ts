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

  constructor(
    private authService: AuthService,
    private router: Router,
    private pokemon: PokemonsService,
    private ctrl: ControllerService
  ) {
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
      this.pokemonId = this.idStart;
    }else {
      this.pokemonData = await this.pokemon.getPokemonData(1);
    }
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

  getPokemonSprite() {
    if (!this.reverted && !this.shiny && !this.female) {
      return this.pokemonData?.sprites.front_default;
    } else if (!this.reverted && !this.shiny && this.female) {
      return this.pokemonData?.sprites.front_female || this.pokemonData?.sprites.front_default;
    } else if (!this.reverted && this.shiny && !this.female) {
      return this.pokemonData?.sprites.front_shiny;
    } else if (!this.reverted && this.shiny && this.female) {
      return this.pokemonData?.sprites.front_shiny_female || this.pokemonData?.sprites.front_shiny;
    } else if (this.reverted && !this.shiny && !this.female) {
      return this.pokemonData?.sprites.back_default;
    } else if (this.reverted && !this.shiny && this.female) {
      return this.pokemonData?.sprites.back_female || this.pokemonData?.sprites.back_default;
    } else if (this.reverted && this.shiny && !this.female) {
      return this.pokemonData?.sprites.back_shiny;
    } else if (this.reverted && this.shiny && this.female) {
      return this.pokemonData?.sprites.back_shiny_female || this.pokemonData?.sprites.back_shiny;
    }else{
      return this.pokemonData?.sprites.front_default;
    }
  }

  async changeId(range:string){
    console.log(range)
    const result:id = JSON.parse(range)
    if (result.startId && result.endId){
      await this.authService.updateId(result.startId,result.endId)
      this.idStart = result.startId;
      this.idEnd = result.endId;
      if (result.startId > this.pokemonId){
        this.pokemonData = await this.pokemon.getPokemonData(result.startId);
        this.pokemonId = result.startId;
      }else if (result.endId < this.pokemonId){
        this.pokemonData = await this.pokemon.getPokemonData(result.endId);
        this.pokemonId =  result.endId;
      }
    }
  }

  setOpen(isOpen: boolean) {

  }
}

interface id {
  endId:number;
  startId:number;
}
