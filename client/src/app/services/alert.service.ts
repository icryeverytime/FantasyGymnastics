import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alertStore = new BehaviorSubject<Alert[]>([]);
  alert$ = this.alertStore.asObservable();

  constructor() { }

  pushAlert(alert: Alert) {
    this.alertStore.next([...this.alertStore.getValue(), alert]);
  }
}
