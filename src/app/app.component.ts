import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { GoogleApiService, GoogleUserInfo } from './google-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  userInfo?: GoogleUserInfo;
  idToken = '';
  accessToken = '';

  constructor(
    private readonly googleApi: GoogleApiService,
    private readonly oAuthService: OAuthService,
  ) {
    googleApi.userProfileSubject.subscribe(info => {
      this.userInfo = info;
      this.idToken = oAuthService.getIdToken();
      this.accessToken = oAuthService.getAccessToken();
    });
    if (window.location.hash) {
      googleApi.signIn();
    }
  }

  login() {
    this.googleApi.signIn();
  }

  logout() {
    this.googleApi.signOut();
  }

  isLoggedIn(): boolean {
    return this.googleApi.isLoggedIn();
  }
}
