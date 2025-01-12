export function validateMongodbId(id: string): boolean {
  const regex = /^[a-f\d]{24}$/i;
  return regex.test(id);
}
