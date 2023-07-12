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
import { KnownMoveKeys, Move } from 'src/app/moves-type';

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
  pokemonId:number=1;
  moveData:Move | null = null;
  moveId:number=0;
  statsMove: KnownMoveKeys[] = ['accuracy', 'power', 'pp'];

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
      this.pokemonData = await this.pokemon.getData(this.idStart, 'pokemons');
      this.pokemonId = this.idStart;
      this.getMove();
    }
  }

  async logout() {
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  changeImage(type: string) {
    this.makeSound('click');
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

  async getMove(){
    if (this.pokemonData && this.pokemonData.types.length > 0){
      const arrayUrl = this.pokemonData.moves[this.moveId].move.url.split('/');
      this.moveData = await this.pokemon.getData(Number(arrayUrl[arrayUrl.length-2]), 'moves');
    }
  }

  async changeId(range:string){
    const result:id = JSON.parse(range)
    if (result.startId && result.endId){
      await this.authService.updateId(result.startId,result.endId)
      this.idStart = result.startId;
      this.idEnd = result.endId;
      if (result.startId > this.pokemonId){
        this.pokemonData = await this.pokemon.getData(result.startId, 'pokemons');
        this.pokemonId = result.startId;
      }else if (result.endId < this.pokemonId){
        this.pokemonData = await this.pokemon.getData(result.endId, 'pokemons');
        this.pokemonId =  result.endId;
      }
    }
  }

  selectMove(increment: number){
    if (this.pokemonData){
      if ((this.moveId <= 0 && increment === -1) ||
        (this.moveId >= (this.pokemonData.moves.length - 1) && increment === 1)) {
          this.makeSound('problem');
      }else {
        this.makeSound('click');
        this.moveId = this.moveId + increment;
        this.getMove();
      }
    }
  }

  makeSound(name: string){
    this.sounds[name].load();
    this.sounds[name].play();
  }
}

interface id {
  endId:number;
  startId:number;
}
