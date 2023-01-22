/**
 * 
 */
export const notesReducer = (prevState: any, action: any) => {};

/**
 * 
 */
export const addNote = (event: { preventDefault: () => void; }) => {};

/**
 * 
 */
export const dragOver = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {};

/**
 * 
 */
export const dropNote = (event: any, note: any) => {};

/**
 * 
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