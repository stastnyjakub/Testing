export type InvoiceData = {
  /**
   * Jednoznačné označení dokladu.
   * Povinný: ANO
   * Délka: Max. 40 znaků
   * Formát: Všechny znaky z povolené množiny mimo ‘*’
   * @example "ID:ABCD123456789EF*"
   */
  ID: string;

  /**
   * Datum vystavení dokladu.
   * Povinný: ANO
   * Délka: Právě 8 znaků
   * Formát: ISO 8601, tj. datum ve formátu YYYYMMDD. Pouze numerické znaky
   * @example "DD:20160615*"
   */
  DD: string;

  /**
   * Výše celkové částky k úhradě v měně specifikované klíčem CC.
   * Povinný: ANO
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "AM:123456789.45*"
   */
  AM: number;

  /**
   * Identifikace typu daňového plnění.
   * Povinný: NE
   * Délka: Právě 1 znak
   * Formát: Číslice
   * @example "TP:0*"
   */
  TP?: number;

  /**
   * Identifikace typu dokladu.
   * Povinný: NE
   * Délka: Právě 1 znak
   * Formát: Číslice
   * @example "TD:9*"
   */
  TD?: number;

  /**
   * Příznak, který rozlišuje, zda faktura obsahuje zúčtování záloh.
   * Povinný: NE
   * Délka: Právě 1 znak
   * Formát: Číslice
   * @example "SA:1*"
   */
  SA?: number;

  /**
   * Textový popis předmětu fakturace.
   * Povinný: NE
   * Délka: Max. 40 znaků
   * Formát: Všechny znaky z povolené množiny mimo ‘*’
   * @example "MSG:KONZULTACE KVETEN 2016*"
   */
  MSG?: string;

  /**
   * Číslo (označení) objednávky, k níž se vztahuje tento účetní doklad.
   * Povinný: NE
   * Délka: Max. 20 znaků
   * Formát: Všechny znaky z povolené množiny mimo ‘*’
   * @example "ON:OBJ20160614TK*"
   */
  ON?: string;

  /**
   * Variabilní symbol.
   * Povinný: NE
   * Délka: Max. 10 znaků
   * Formát: Celé číslo
   * @example "VS:1234567890*"
   */
  'X-VS'?: number;

  /**
   * DIČ výstavce.
   * Povinný: NE
   * Délka: Max. 14 znaků
   * Formát: Alfanumerický řetězec
   * @example "VII:CZ12345678*"
   */
  VII?: string;

  /**
   * IČO výstavce.
   * Povinný: NE
   * Délka: Max. 8 znaků
   * Formát: Celé číslo
   * @example "INI:12345678*"
   */
  INI?: number;

  /**
   * DIČ příjemce.
   * Povinný: NE
   * Délka: Max. 14 znaků
   * Formát: Alfanumerický řetězec
   * @example "VIR:CZ09876543*"
   */
  VIR?: string;

  /**
   * IČO příjemce.
   * Povinný: NE
   * Délka: Max. 8 znaků
   * Formát: Celé číslo
   * @example "INR:98765432*"
   */
  INR?: number;

  /**
   * Datum uskutečnění zdanitelného plnění.
   * Povinný: NE
   * Délka: Právě 8 znaků
   * Formát: ISO 8601, tj. datum ve formátu YYYYMMDD. Pouze numerické znaky
   * @example "DUZP:20160413*"
   */
  DUZP?: string;

  /**
   * Datum povinnosti přiznat daň.
   * Povinný: NE
   * Délka: Právě 8 znaků
   * Formát: ISO 8601, tj. datum ve formátu YYYYMMDD. Pouze numerické znaky
   * @example "DPPD:20161201*"
   */
  DPPD?: string;

  /**
   * Datum splatnosti celkové částky.
   * Povinný: NE
   * Délka: Právě 8 znaků
   * Formát: ISO 8601, tj. datum ve formátu YYYYMMDD. Pouze numerické znaky
   * @example "DT:20160908*"
   */
  DT?: string;

  /**
   * Částka základu daně v základní daňové sazbě v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "TB0:3000*"
   */
  TB0?: number;

  /**
   * Částka daně v základní daňové sazbě v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "T0:630*"
   */
  T0?: number;

  /**
   * Částka základu daně v první snížené daňové sazbě v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "TB1:2000*"
   */
  TB1?: string;

  /**
   * Částka daně v první snížené daňové sazbě v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "T1:300*"
   */
  T1?: string;

  /**
   * Částka základu daně ve druhé snížené daňové sazbě v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "TB2:1000*"
   */
  TB2?: string;

  /**
   * Částka daně ve druhé snížené daňové sazbě v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "T2:100*"
   */
  T2?: string;

  /**
   * Částka osvobozených plnění, plnění mimo předmět DPH, plnění neplátců DPH v CZK včetně haléřového vyrovnání.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 2 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "NTB:500*"
   */
  NTB?: number;

  /**
   * Měna celkové částky. Není-li klíč v řetězci přítomen = měna je CZK.
   * Povinný: NE
   * Délka: Právě 3 znaky
   * Formát: ISO 4217 – délka 3 znaky, velká písmena
   * @example "CC:CZK*"
   */
  CC?: string;

  /**
   * Směnný kurz mezi CZK a měnou celkové částky.
   * Povinný: NE
   * Délka: Max. 18 znaků
   * Formát: Desetinné číslo. Max. 3 desetinné cifry. Tečka jako oddělovač desetinných míst
   * @example "FX:123456.789*"
   */
  FX?: number;

  /**
   * Počet jednotek cizí měny pro přepočet pomocí klíče FX. Není-li v řetězci klíč přítomen = 1.
   * Povinný: NE
   * Délka: Max. 5 znaků
   * Formát: Celé číslo
   * @example "FXA:100*"
   */
  FXA?: number;

  /**
   * Identifikace čísla účtu výstavce faktury, která je složena ze dvou komponent oddělených znaménkem +.
   * Povinný: NE
   * Délka: Max. 46 znaků (IBAN+BIC)
   * Formát: IBAN, BIC
   * @example "ACC:CZ5855000000001265098001+RZBCCZPP*"
   */
  ACC?: string;

  /**
   * Kontrolní součet. Hodnota vznikne výpočtem CRC32 celého řetězce (bez klíče CRC32) a převedením této číselné hodnoty do hexadecimálního zápisu.
   * Povinný: NE
   * Délka: Právě 8 znaků
   * Formát: Znaky z množiny [A-F0-9]
   * @example "CRC32:1234ABCD*"
   */
  CRC32?: string;

  /**
   * Příznak, zda je faktura placena QR platbou.
   * Povinný: NE
   * Délka: Právě 1 znak
   * Formát: Číslice
   * @example "QRPLATBA:1*"
   */
  qrplatba?: 0 | 1;
};
