import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-shipping-policy',
  imports: [RouterModule,Header],
  templateUrl: './shipping-policy.html',
  styleUrl: './shipping-policy.css',
})
export class ShippingPolicy {

}
