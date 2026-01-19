interface CustomBigInt extends BigInt {
  toJSON(): string;
}
//transforms all bigInts to string
(BigInt.prototype as CustomBigInt).toJSON = function (): string {
  return this.toString();
};
