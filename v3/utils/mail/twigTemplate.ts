import fs from 'fs';
import {
  createEnvironment,
  createFilesystemLoader,
  createFilter,
  TwingEnvironment,
  TwingFilesystemLoader,
  TwingFilter,
  TwingTemplate,
} from 'twing';

import { t } from '@/middleware/i18n';
import { Lang } from '@/types';

import { timestamp } from '../timestamp';

export class TwigTemplate<TemplateData extends object> {
  private loader: TwingFilesystemLoader;
  private environment: TwingEnvironment;
  private template: TwingTemplate | null = null;
  public language: Lang;

  constructor(language: Lang) {
    this.loader = createFilesystemLoader(fs);
    this.loader.addPath('@templates/', 'templates');

    this.environment = createEnvironment(this.loader);
    this.language = language;

    this.loadDefaultFilters();
  }

  public async setTemplate(templatePath: string) {
    this.template = await this.environment.loadTemplate(templatePath);
  }

  public async render(data: TemplateData) {
    if (!this.template) {
      throw new Error('Template is not set. Please call setTemplate() before rendering.');
    }
    const rendered = await this.template.render(data);
    return rendered;
  }

  public addCustomFilter(filter: TwingFilter) {
    if (!filter) return;
    this.environment.addFilter(filter);
  }

  private loadDefaultFilters() {
    this.environment.addFilter(this.getTransFilter(this.language));
    this.environment.addFilter(this.getFormatDateFilter());
    this.environment.addFilter(this.getFormatNumberFilter());
  }

  private getTransFilter(lang: string) {
    const filter = createFilter(
      'trans',
      (_executionContext, value, arg) => {
        return Promise.resolve(t(value, lang, arg ? Object.fromEntries(arg.entries()) : undefined));
      },
      [{ name: 'value', defaultValue: null }],
    );
    return filter;
  }
  private getFormatDateFilter() {
    const filter = createFilter(
      'format_date',
      (_executionContext, value, arg) => {
        return Promise.resolve(timestamp(value)?.tz('Europe/Prague').format(arg));
      },
      [{ name: 'format', defaultValue: 'DD.MM.YYYY' }],
    );
    return filter;
  }
  private getFormatNumberFilter() {
    const filter = createFilter(
      'format_number',
      (_executionContext, value) => {
        return Promise.resolve(
          Intl.NumberFormat('cs-CZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value),
        );
      },
      [],
    );
    return filter;
  }
}
