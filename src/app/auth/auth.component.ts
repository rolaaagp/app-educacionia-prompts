import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MainService } from '../../services/main.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../context/user.context';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private mainService: MainService,
    private userContext: UserContextService
  ) { }

  async login() {
    this.errorMessage = '';
    try {
      this.mainService.auth({
        email: this.username,
        pwd: this.password
      }).subscribe({
        next: (res) => {
          if (res.data) {
            this.userContext.currentUser = { user: res.data }
            if (typeof window !== 'undefined') sessionStorage.setItem("user_email", res.data.user_email);
            console.log(res.data)
            this.loginRedirect();
          } else {
            this.errorMessage = 'Usuario o contraseña ';
          }
        }
      });
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Error al conectar con el servidor';
    }
  }

  loginRedirect(): void {
    this.router.navigate(['/']);
  }


}

