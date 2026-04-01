import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-returns-refunds',
  imports: [RouterModule,Header],
  templateUrl: './returns-refunds.html',
  styleUrl: './returns-refunds.css',
})
export class ReturnsRefunds {

}
