import { Component, OnDestroy, OnInit } from '@angular/core';
import { Alert } from 'src/app/models/alert.model';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {

  constructor(private alertService: AlertService) { }

  alerts: Alert[] = [];
  subscription: any;

  ngOnInit(): void {
    this.subscription = this.alertService.alert$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
