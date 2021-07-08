import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // Observable array of Alerts
  alertStore = new BehaviorSubject<Alert[]>([]);
  alert$ = this.alertStore.asObservable();

  constructor() { }

  /**
   * Push a new alert to the store
   */
  pushAlert(alert: Alert) {
    this.alertStore.next([...this.alertStore.getValue(), alert]);
  }
}
