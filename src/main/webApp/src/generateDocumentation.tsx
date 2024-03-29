
class Note{
    id!: string;
    contents!: string;
    position!: number[];
    color!: string;
}

class Event{

}

/**
 * Reducer z Reactowego Hooka useReduce. Wywoływany poprzez funkcję dispatch.
 * W zależności co dostanie w action zmienia globalną zmienną initialNotesState na podstawie prevState
 * @param prevState - wartość initialNotesState
 * @param action - wartość w zależności od której wybieramy co zrboić
 * @returns nowa wartość initialNotesState
 */
export const notesReducer = (prevState: {totalNotes: number, notes: Array<Note>}, action: any) => {};

/**
 * Funkcja dodająca nową karteczkę, wysyła żądanie dispatch która dodaje do globalnej zmiennej initialNotesState nową karteczkę.
 * @param {Event} event 
 */
export const addNote = (event: { preventDefault: () => void; }) => {};

/**
 * Funkcja pozwalająca na przeciąganie elementów nad główną tablicą
 * @param {Event} event - wydarzenie (przeciągnięcie)
 */
export const dragOver = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {};

/**
 * Funkcja która jest wykonywana gdy użytkownik skończy przesuwanie (upuści karteczkę).
 * Ustawia nową pozycję karteczki poprzez wykonanie funkcji dispatch.
 * @param {Event} event - wydarzenie (upuszczenie)
 * @param {Note} note - notatka którą upuszczamy
 */
export const dropNote = (event: Event, note: Note) => {};

/**
 * Funkcja zmieniająca zawartość notatki poprzez wykonanie funkcji dispatch.
 * @param {Event} event - wydarzenie (edytowanie)
 * @param {Note} note - notatka którą edytujemy
 * @param event - wydarzenie (edytowanie)
 * @param note - notatka którą edytujemy
 */
export const editNote = (event: Event, note: Note) => {};

/**
 * Funkcja tworząca panel wyboru koloru karteczki
 * @param {Event} event - wydarzenie (edytowanie)
 * @param {Note} note - notatka, której kolor zmieniamy
 */
export function displayColors(event: Event, note: Note) {};

/**
 * Funkcja zmieniająca kolor karteczki, do której przypisany jest panel wyboru koloru, poprzez funkcję dispatch.
 */
export function changeColor() {};

/**
 * Funkcja przełączająca motyw aplikacji między jasnym a ciemnym
 */
export function toggleTheme() {};


/**
 * Reprezentacja karteczki w aplikacji
 */
export const Notes = {
    id: 0,
    contents: "text",
    position: [300 + Math.random() * 150, 175 + Math.random() * 150],
    color: "yellow"
}

/**
 * Reprezentacja stanu tablicy z karteczkami
 */
export const initialNotesState = {
    totalNotes: 0,
    notes: Array<Note>,
};