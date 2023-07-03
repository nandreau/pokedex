import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, doc, runTransaction, DocumentReference } from '@angular/fire/firestore';
import { setDoc  } from '@firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { Pokemon, PokemonType } from '../pokemons-type';
import { ControllerService } from './controller.service';

@Injectable({
  providedIn: 'root'
})
export class PokemonsService {
  constructor(private http: HttpClient,
    private ctrl: ControllerService,
    private firestore: Firestore) {}

  async downloadImage(imageUrl: string, imageName: string) {
    const response = await this.http.get(imageUrl, { responseType: 'blob' }).toPromise();
    
    if (!response) {
      console.log(`Erreur lors du téléchargement de l'image ${imageName}.png`);
      return;
    }
    const blob = new Blob([response], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${imageName}.png`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  async downloadTypes() {
    try {
      const result: PokemonType[] = await firstValueFrom(this.http.get<PokemonType[]>(`https://pokebuildapi.fr/api/v1/types`));
      console.log(result);
      this.ctrl.loader(`0/${result.length} types téléchargés...`);
      for (let count = 0; count < result.length; count++) {
        const { image, englishName } = result[count];
        const imageName = englishName.toLowerCase();
        await this.downloadImage(image, imageName);
        this.ctrl.updateString(`${count+1}/${result.length} types téléchargés...`);
      }
      this.ctrl.dismissLoader();
    } catch (error) {
      console.log('Erreur lors du téléchargement');
      this.ctrl.toast('Erreur lors du téléchargement','warning');
      this.ctrl.dismissLoader();
    }
  }

  async initPokemons(startId: number, endId: number) {
    this.ctrl.loader(`0/${endId-startId+1} pokemons réccupérés...`);
    const updates: { ref: DocumentReference, data: Pokemon }[] = [];
  
    for (let id = startId; id <= endId; id++) {
      try {
        const result: Pokemon = await firstValueFrom(this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`));
        this.ctrl.updateString(`${id-startId+1}/${endId-startId+1} pokemons réccupérés...`);
        const ref = doc(this.firestore, 'pokemons/' + id);
        updates.push({ ref, data: result });
      } catch (error) {
        console.log(`Erreur lors de la récupération de Pokemon avec l'id : ${id}`);
        this.ctrl.toast(`Erreur lors de la récupération de Pokemon avec l'id : ${id}`, 'warning');
        break;
      }
    }
  
    await this.updateDocumentsSimultaneously(updates);
    this.ctrl.dismissLoader();
  }

  async updateDocumentsSimultaneously(updates: { ref: DocumentReference, data: Pokemon }[]) {
    const promises = updates.map(({ ref, data }) => {
      return runTransaction(this.firestore, async (transaction) => {
        const snapshot = await transaction.get(ref);
  
        if (snapshot.exists()) {
          const newDocData = { ...data, population: snapshot.data()['population'] + 1 };
          transaction.update(ref, newDocData);
        } else {
          transaction.set(ref, data);
        }
      });
    });
  
    const totalCount = promises.length;
    let successCount = 0;
  
    try {
      await Promise.all(
        promises.map(async (promise, index) => {
          try {
            await promise;
            successCount++;
          } catch (error) {
            console.log('Erreur lors de la mise à jour/création du document : ', error);
          } finally {
            this.ctrl.updateString(`${successCount}/${totalCount} pokemons mis à jour...`);
          }
        })
      );
    
      this.ctrl.toast('La base de données a été mise à jour !', 'success');
    } catch (error) {
      console.log('Erreur lors de la mise à jour/création du document : ', error);
      this.ctrl.toast('Erreur lors de la mise à jour/création du document', 'error');
    }
  }
}