import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Subject } from 'rxjs';

const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'https://accounts.google.com',

  // strict discovery document disallows urls which not start with issuers url
  strictDiscoveryDocumentValidation: false,

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.href,

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: '15443613184-iekd01gaun74fu93stqoj9rjt1av6mem.apps.googleusercontent.com', // STC

  // set the scope for the permissions the client should request
  scope: 'openid profile',

  showDebugInformation: false,

};

export interface GoogleUserInfo {
  info: {
    sub: string;
    email: string,
    name: string,
    picture: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  userProfileSubject = new Subject<GoogleUserInfo>();

  constructor(private readonly oAuthService: OAuthService) { }

  signIn(afterLogin?: boolean) {
    if (afterLogin) {
      this.oAuthService.loadUserProfile().then((userProfile) => {
        this.userProfileSubject.next(userProfile as GoogleUserInfo);
      });
    }
    // confiure oauth2 service
    this.oAuthService.configure(authCodeFlowConfig);
    // manually configure a logout url, because googles discovery document does not provide it
    //this.oAuthService.logoutUrl = "https://www.google.com/accounts/Logout";

    // loading the discovery document from google, which contains all relevant URL for
    // the OAuth flow, e.g. login url
    this.oAuthService.loadDiscoveryDocument().then(() => {
      // This method just tries to parse the token(s) within the url when
      // the auth-server redirects the user back to the web-app
      // It doesn't send the user the the login page
      // this.oAuthService.tryLoginCodeFlow().then(() => {
      this.oAuthService.tryLoginImplicitFlow().then(() => {
        if (!this.oAuthService.hasValidAccessToken()) {
          this.oAuthService.initLoginFlow();
        } else {
          this.oAuthService.loadUserProfile().then((userProfile) => {
            this.userProfileSubject.next(userProfile as GoogleUserInfo);
          });
        }
      });
    });
  }

  isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }

  signOut() {
    this.oAuthService.logOut();
  }
}
