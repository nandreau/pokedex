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
import { Pokemon } from 'src/app/models/pokemons-type';
import { KnownMoveKeys, Move } from 'src/app/models/moves-type';
import { Specie } from 'src/app/models/species-types';
import { Chain, Evolution } from 'src/app/models/evolutions-types';

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
  range:Id={idStart:1,idEnd:150};
  pokemonData:Pokemon | null = null;
  specieData:Specie | null = null;
  evolutionArray: CardPokemon[] | [] = [];
  moveData:Move | null = null;
  pokemonId:number=1;
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
    const range = await this.authService.getIdStartAndEnd();
    if (range){
      this.initPokedex(this.range.idStart);
    }
  }

  async initPokedex(id: number) {
    this.pokemonId = id;
    const pokemonDataPromise = this.pokemon.getData(id, 'pokemons');
    const specieDataPromise = this.pokemon.getData(id, 'species');
  
    this.pokemonData = await pokemonDataPromise;
    this.specieData = await specieDataPromise;
  
    if (this.specieData && this.specieData.evolution_chain) {
      const evolutionData: Evolution = await this.pokemon.getData(this.getIndex(this.specieData.evolution_chain.url), 'evolutions');
      this.evolutionArray = this.getEvolutionNames(evolutionData);
    }
    this.getMove();
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
      const url:string = this.pokemonData.moves[this.moveId].move.url;
      this.moveData = await this.pokemon.getData(Number(this.getIndex(url)), 'moves');
    }
  }

  getIndex(url: string): number {
    const regex = /\/(\d+)\//;
    const match = url.match(regex);
  
    if (match && match[1]) {
      const index = Number(match[1]);
      return index;
    }
  
    console.log('Index not found in the URL.');
    return 0;
  }

  async changeId(range:string){
    this.range = JSON.parse(range)
    if (this.range.idStart && this.range.idEnd){
      await this.authService.updateId(this.range.idStart,this.range.idEnd)
      if (this.range.idStart > this.pokemonId){
        this.pokemonData = await this.pokemon.getData(this.range.idStart, 'pokemons');
        this.pokemonId = this.range.idStart;
      }else if (this.range.idEnd < this.pokemonId){
        this.pokemonData = await this.pokemon.getData(this.range.idEnd, 'pokemons');
        this.pokemonId =  this.range.idEnd;
      }
    }
  }

  getEvolutionNames(evolutionData: Evolution): CardPokemon[] {
    if (evolutionData) {
      const evolutionNames: CardPokemon[] = [];

      const processEvolutionChain = (chain: Chain) => {
        if (chain && chain.species && chain.species.name && chain.species.url) {
          const cardPokemon: CardPokemon = {
            name: chain.species.name,
            urlImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+this.getIndex(chain.species.url)+'.png'
          };
          evolutionNames.push(cardPokemon);
        }
        
        if (chain && chain.evolves_to && chain.evolves_to.length > 0) {
          for (const evolution of chain.evolves_to) {
            processEvolutionChain(evolution);
          }
        }
      };
      processEvolutionChain(evolutionData.chain);
      return evolutionNames;
    }  
    return [];
  }

  selectMove(increment: number){
    if (this.pokemonData){
      if ((this.moveId <= 0 && increment === -1) ||
        (this.moveId >= (this.pokemonData.moves.length - 1) && increment === 1)) {
          this.makeSound('problem');
      }else {
        this.makeSound('click');
        this.moveId += increment;
        this.getMove();
      }
    }
  }

  selectPokemon(increment: number) {
    if (this.pokemonData) {
      if ((this.pokemonId <= this.range.idStart && increment === -1) ||
        (this.pokemonId >= this.range.idEnd && increment === 1)) {
        this.makeSound('problem');
        return;
      }
      this.makeSound('pch');
      this.pokemonId += increment;
      this.initPokedex(this.pokemonId);
    }
  }

  makeSound(name: string){
    this.sounds[name].load();
    this.sounds[name].play();
  }

  getArrayLeft(){
    const array: string[] = [];
    for (let i=this.evolutionArray.length;i<3;i++){
      array.push(this.getromanNumerals(i));
    }
    return array;
  }

  getromanNumerals(iteration: number):string {
    return 'I'.repeat(iteration);
  }
}

interface Id {
  idEnd:number;
  idStart:number;
}

interface CardPokemon {
  name:string;
  urlImage:string;
}
