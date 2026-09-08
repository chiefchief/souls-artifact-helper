export function petImageUrl(petId: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}pets/${petId}/image.png`;
}
