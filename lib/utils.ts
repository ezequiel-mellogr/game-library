/**
 * Formatea una fecha de forma consistente en servidor y cliente
 * para evitar errores de hidratación (el navegador y el servidor
 * deben mostrar exactamente lo mismo).
 */
export function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getUTCDate().toString().padStart(2, '0');
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}
