import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useNavigate } from 'react-router-dom';
import { theHost, port } from '../config';

const BASE_URL = `${theHost}:${port}/api/`;
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface TokenRefreshResponse {
  access: string;
  refresh: string;
}

export const useCustomNavigate = () => {
  const navigate = useNavigate();
  return (path: string) => {
    navigate(path);
  };
};

class CustomAxios {
  private instance: AxiosInstance;
  private refreshTokenRequest: Promise<TokenRefreshResponse> | null = null;
  private navigateToLogin: (() => void) | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  public setNavigateToLogin(navigateFunc: () => void) {
    this.navigateToLogin = navigateFunc;
    //console.log('Navigate to login function set');
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      async (config) => {
        //console.log('Request interceptor: Checking tokens');
        let accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');
        //console.log('Access token present:', !!accessToken);
        //console.log('Refresh token present:', !!refreshToken);
        
        if (!accessToken && refreshToken) {
          //console.log('No access token, but refresh token found. Forcing refresh.');
          try {
            const tokens = await this.refreshAccessToken();
            accessToken = tokens.access;
          } catch (error) {
            // console.error('Forced refresh failed:', error);
            this.redirectToLogin();
            return Promise.reject(error);
          }
        }
        
        if (accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          //console.log('Access token added to request headers');
        } else {
          //console.log('No access token available for request');
        }
        return config;
      },
      (error) => {
        // console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => {
        //console.log('Response received successfully');
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as CustomAxiosRequestConfig | undefined;
        //console.log('Response error status:', error.response?.status);
        
        if (error.response?.status === 401 && config && !config._retry) {
          //console.log('401 error detected, attempting to refresh token');
          config._retry = true;
          try {
            const tokens = await this.refreshAccessToken();
            if (tokens.access) {
              //console.log('Token refreshed successfully, retrying original request');
              config.headers['Authorization'] = `Bearer ${tokens.access}`;
              return this.instance(config);
            } else {
              throw new Error('Failed to refresh token');
            }
          } catch (refreshError) {
            // console.error('Token refresh failed:', refreshError);
            this.redirectToLogin();
            return Promise.reject(refreshError);
          }
        }
        // console.error('Unhandled error:', error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<TokenRefreshResponse> {
    //console.log('Attempting to refresh access token');
    if (!this.refreshTokenRequest) {
      this.refreshTokenRequest = new Promise<TokenRefreshResponse>((resolve, reject) => {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          // console.error('No refresh token available');
          reject('No refresh token available');
          return;
        }

        //console.log('Sending refresh token request');
        axios.post<TokenRefreshResponse>(`${BASE_URL}user/refresh_token/`, { refresh: refreshToken })
          .then((response) => {
            const newAccessToken = response.data.access;
            const newRefreshToken = response.data.refresh;
            //console.log('New access and refresh tokens received');
            localStorage.setItem('access', newAccessToken);
            localStorage.setItem('refresh', newRefreshToken);
            resolve(response.data);
          })
          .catch((error) => {
            // console.error('Refresh token request failed:', error.response?.data || error.message);
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            reject(error);
          })
          .finally(() => {
            this.refreshTokenRequest = null;
            //console.log('Refresh token request completed');
          });
      });
    } else {
      //console.log('Using existing refresh token request');
    }

    return this.refreshTokenRequest;
  }

  private redirectToLogin(): void {
    //console.log('Redirecting to login page');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    if (this.navigateToLogin) {
      //console.log('Using custom navigation function');
      this.navigateToLogin();
    } else {
      //console.log('Using default window.location.href navigation');
      window.location.href = '/login';
    }
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    //console.log(`GET request to ${url}`);
    return this.instance.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    //console.log(`POST request to ${url}`);
    return this.instance.post<T>(url, data, config);
  }

  // Add other methods (put, delete, etc.) as needed
}

export const axiosAuth = new CustomAxios();