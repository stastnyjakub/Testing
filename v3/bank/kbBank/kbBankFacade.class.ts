import * as Sentry from '@sentry/node';
import axios, { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';

import prisma from '@/db/client';
import env from '@/env';

import { decryptKbRefreshToken, encryptKbRefreshToken, formatDateForKbApi } from './kbBank.utils';
import {
  TCreateRefreshTokenResponseBody,
  TFetchAccountTransactionsArgs,
  TGetAccessTokenArgs,
  TGetAccountsArgs,
  TGetAccountsResponseBody,
  TGetAccountTransactionsArgs,
  TGetAccountTransactionsResponseBody,
  TKbBankTransaction,
  TRefreshAccessTokenResponseBody,
} from './types';

export class KbBankFacadeSingleton {
  private static instance: KbBankFacadeSingleton;

  // API secrets
  private readonly ACCOUNT_ID = env().KB_BANK_ACCOUNT_ID;
  private readonly ADAA_API_KEY = env().KB_BANK_ADAA_API_KEY;
  private readonly OAUTH2_API_KEY = env().KB_BANK_OAUTH2_API_KEY;
  private readonly CLIENT_ID = env().KB_BANK_CLIENT_ID;
  private readonly CLIENT_SECRET = env().KB_BANK_CLIENT_SECRET;

  // API URLs
  private readonly REFRESH_TOKEN_API_URL = env().KB_BANK_REFRESH_TOKEN_API_URL;
  private readonly ADAA_ACCOUNTS_API_URL = env().KB_BANK_ADAA_ACCOUNTS_API_URL;
  private readonly ADAA_ACCOUNT_TRANSACTIONS_API_URL = env().KB_BANK_ADAA_ACCOUNT_TRANSACTIONS_API_URL;

  // Auth variables
  private REFRESH_TOKEN: string | null = null;
  private ACCESS_TOKEN: string | null = null;
  private ACCESS_TOKEN_TYPE: string | null = null;

  // Magic numbers
  private readonly FETCH_ACCOUNT_TRANSACTIONS_PAGE_SIZE = 2;
  private readonly FETCH_ACCOUNT_TRANSACTIONS_MAX_RETRIES = 1;

  public static getInstance() {
    if (!KbBankFacadeSingleton.instance) {
      KbBankFacadeSingleton.instance = new KbBankFacadeSingleton();
    }
    return KbBankFacadeSingleton.instance;
  }

  public async getAccountTransactions({ dateFrom, dateTo }: TGetAccountTransactionsArgs) {
    if (dateTo.isBefore(dateFrom)) {
      throw new Error('dateTo must be greater than dateFrom');
    }
    return await this.fetchAllAccountTransactions({
      dateFrom,
      dateTo,
    });
  }
  private async fetchAllAccountTransactions({
    dateFrom,
    dateTo,
    page = 0,
    size = this.FETCH_ACCOUNT_TRANSACTIONS_PAGE_SIZE,
    retryCount = 0,
    enforceAccessTokenRefresh = false,
  }: TFetchAccountTransactionsArgs): Promise<TKbBankTransaction[]> {
    try {
      // Fetch first page of transactions
      const response = await axios.request<any, AxiosResponse<TGetAccountTransactionsResponseBody>>({
        method: 'GET',
        url: this.ADAA_ACCOUNT_TRANSACTIONS_API_URL.replace('{accountId}', this.ACCOUNT_ID),
        params: {
          fromDate: formatDateForKbApi(dateFrom),
          toDate: formatDateForKbApi(dateTo),
          size: size,
          page: page,
        },
        headers: {
          Authorization: await this.getAccessToken({ enforceTokenRefresh: enforceAccessTokenRefresh }),
          apiKey: this.ADAA_API_KEY,
        },
      });

      retryCount = 0;

      const currentPageTransactions = response.data.content;
      const isLastPage = response.data.last;

      // Base case: return transactions from the last page
      if (isLastPage) {
        return currentPageTransactions;
      }

      // Recursive case: fetch the next page and combine results
      const nextPageTransactions = await this.fetchAllAccountTransactions({
        dateFrom,
        dateTo,
        page: page + 1,
        size,
      });

      return [...currentPageTransactions, ...nextPageTransactions];
    } catch (error) {
      // If token is expired and retry count is less than max retries, refresh token and try again
      if (
        error instanceof AxiosError &&
        error?.response?.status === 401 &&
        retryCount < this.FETCH_ACCOUNT_TRANSACTIONS_MAX_RETRIES
      ) {
        return this.fetchAllAccountTransactions({
          dateFrom,
          dateTo,
          page,
          size,
          retryCount: retryCount + 1,
          enforceAccessTokenRefresh: true,
        });
      }
      Sentry.captureException(error);
      throw error;
    }
  }

  public async getAccounts({
    enforceTokenRefresh,
    retryCount = 0,
  }: TGetAccountsArgs = {}): Promise<TGetAccountsResponseBody> {
    try {
      const response = await axios.request<any, AxiosResponse<TGetAccountsResponseBody>>({
        method: 'GET',
        url: this.ADAA_ACCOUNTS_API_URL,
        headers: {
          Authorization: await this.getAccessToken({ enforceTokenRefresh }),
          apiKey: this.ADAA_API_KEY,
        },
      });

      retryCount = 0;

      const accounts = response.data;
      return accounts;
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.status === 401 && retryCount < 1) {
        return this.getAccounts({ enforceTokenRefresh: true, retryCount: retryCount + 1 });
      }
      Sentry.captureException(error);
      throw error;
    }
  }

  // Get access token for api services in full format - 'Bearer <access_token>'
  private async getAccessToken({ enforceTokenRefresh = false }: TGetAccessTokenArgs = {}) {
    if (this.ACCESS_TOKEN === null || enforceTokenRefresh) {
      const { accessToken, tokenType } = await this.refreshAccessToken();
      this.ACCESS_TOKEN = accessToken;
      this.ACCESS_TOKEN_TYPE = tokenType;
    }
    return `${this.ACCESS_TOKEN_TYPE} ${this.ACCESS_TOKEN}`;
  }
  private async refreshAccessToken() {
    const data = new URLSearchParams();
    // Redirect URI must be the same as in the authorization request performed on OAuth2 API
    // Will always direct to production environment
    data.append('redirect_uri', 'https://api.qapline.com/api/v3/public/kb/oauth2/authorization/callback');
    data.append('client_id', this.CLIENT_ID);
    data.append('client_secret', this.CLIENT_SECRET);
    data.append('refresh_token', await this.getRefreshToken());
    // Grant type must be 'refresh_token' for refreshing access token
    data.append('grant_type', 'refresh_token');

    try {
      const response = await axios.request<any, AxiosResponse<TRefreshAccessTokenResponseBody>>({
        method: 'POST',
        url: this.REFRESH_TOKEN_API_URL,
        data: data,
        headers: {
          apiKey: this.OAUTH2_API_KEY,
        },
      });
      return {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type,
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  // Authorization code flow
  public async processAuthorizationCode(code: string) {
    if (!code) {
      throw new Error('code is required to process authorization code');
    }
    // Get refresh token from authorization code through OAuth2 API
    const refreshToken = await this.fetchRefreshToken(code);

    // Save refresh token to database so it can be used for fetching access token
    await this.saveRefreshToken(refreshToken);
  }
  private async fetchRefreshToken(code: string) {
    const data = new URLSearchParams();
    // Redirect URI must be the same as in the authorization request performed on OAuth2 API
    // Will always direct to production environment
    data.append('redirect_uri', 'https://api.qapline.com/api/v3/public/kb/oauth2/authorization/callback');
    data.append('client_id', this.CLIENT_ID);
    data.append('client_secret', this.CLIENT_SECRET);
    data.append('code', code);
    // Grant type must be 'authorization_code' for processing authorization code
    data.append('grant_type', 'authorization_code');

    try {
      const response = await axios.request<any, AxiosResponse<TCreateRefreshTokenResponseBody>>({
        method: 'POST',
        url: this.REFRESH_TOKEN_API_URL,
        data: data,
        headers: {
          apiKey: this.OAUTH2_API_KEY,
        },
      });
      return response.data.refresh_token;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
  private async saveRefreshToken(refreshToken: string) {
    // Encrypt refresh token before saving to database, it adds an extra layer of security
    const refreshTokenCipher = encryptKbRefreshToken(refreshToken);
    await prisma.kbRefreshToken.create({
      data: {
        tokenCipher: refreshTokenCipher,
        tsAdded: moment().unix(),
      },
    });
  }

  // Get refresh token from database
  private async getRefreshToken() {
    if (this.REFRESH_TOKEN) {
      return this.REFRESH_TOKEN;
    }

    const kbRefreshToken = await prisma.kbRefreshToken.findFirst({
      orderBy: {
        tsAdded: 'desc',
      },
    });
    if (!kbRefreshToken) {
      throw new Error('No refresh token found');
    }

    // Refresh token is encrypted in database, decrypt it before returning
    const refreshToken = decryptKbRefreshToken(kbRefreshToken.tokenCipher);
    this.REFRESH_TOKEN = refreshToken;

    return refreshToken;
  }
}

export const KbBankFacade = KbBankFacadeSingleton.getInstance();
