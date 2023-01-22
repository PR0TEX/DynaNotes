/**
 * Reducer z Reactowego Hooka useReduce. Wywoływany poprzez funkcję dispatch.
 * W zależności co dostanie w action zmienia globalną zmienną initialNotesState na podstawie prevState
 * @param prevState - wartość initialNotesState
 * @param action - wartość w zależności od której wybieramy co zrboić
 * @returns nowa wartość initialNotesState
 */
export const notesReducer = (prevState: any, action: any) => {};

/**
 * Funkcja dodająca nową karteczkę, wysyła żądanie dispatch która dodaje do globalnej zmiennej initialNotesState nową karteczkę.
 * @param event 
 */
export const addNote = (event: { preventDefault: () => void; }) => {};

/**
 * Funkcja pozwalająca na przeciąganie elementów nad główną tablicą
 * @param event - wydarzenie (przeciągnięcie)
 */
export const dragOver = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {};

/**
 * Funkcja która jest wykonywana gdy użytkownik skończy przesuwanie (upuści karteczkę).
 * Ustawia nową pozycję karteczki poprzez wykonanie funkcji dispatch.
 * @param event - wydarzenie (upuszczenie)
 * @param note - notatka którą upuszczamy
 */
export const dropNote = (event: any, note: any) => {};

/**
 * Funkcja zmieniająca zawartość notatki poprzez wykonanie funkcji dispatch.
 * @param event - wydarzenie (edytowanie)
 * @param note - notatka którą edytujemy
 */
export const editNote = (event: any, note: any) => {};

/**
 * 
 */
export function displayColors(event: any, note: any) {};

/**
 * 
 */
export function toggleTheme() {};




/**
 * 
 */
export const Note = {
    id: 0,
    contents: "text",
    position: [300 + Math.random() * 150, 175 + Math.random() * 150],
    color: "yellow"
}

/**
 * 
 */
export const initialNotesState = {
    totalNotes: 0,
    notes: Array<typeof Note>,
};