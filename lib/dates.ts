export function todayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export function isPastDate(dateStr: string): boolean {
  return dateStr < todayDateStr();
}

/**
 * Berechnet, an welchem Tag ein Geburtstag (YYYY-MM-DD, Jahr irrelevant) in
 * einem bestimmten Kalendermonat/-jahr fällt. Gibt null zurück, wenn der
 * Geburtsmonat nicht mit dem angefragten Monat übereinstimmt. Der 29.
 * Februar wird in Nicht-Schaltjahren auf den 28. Februar gelegt.
 */
export function birthdayOccurrenceInMonth(
  birthDateStr: string,
  year: number,
  month: number
): string | null {
  const [, birthMonthStr, birthDayStr] = birthDateStr.split("-");
  const birthMonth = Number(birthMonthStr);
  if (birthMonth !== month) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  const birthDay = Math.min(Number(birthDayStr), daysInMonth);

  return `${year}-${String(month).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
}
