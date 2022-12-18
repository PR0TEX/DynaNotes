import React, { useState, useReducer } from 'react';
import logo from './logo.svg';
import './App.scss';
import { v4 as uuid } from 'uuid';
import { nodeModuleNameResolver, updateUnionTypeNode } from 'typescript';

const initialNotesState = {
    lastNoteCreated: null,
    totalNotes: 0,
    notes: [],
};

const notesReducer = (prevState: any, action: any) => {
    switch (action.type) {
        case 'ADD_NOTE': {
            const newState = { 
                notes: [...prevState.notes, action.payload],
                totalNotes: prevState.notes.length + 1,
                lastNoteCreated: new Date().toTimeString().slice(0, 8),
            };
            console.log('After ADD_NOTE: ', newState);
            return newState;
        }

        case 'DELETE_NOTE': {
            const newState = {
                ...prevState,
                notes: prevState.notes.filter((note: { id: any; }) => note.id !== action.payload.id),
                totalNotes: prevState.notes.length - 1,
            };
            console.log('After DELETE_NOTE: ', newState);
            return newState;
        }

        case 'EDIT_NOTE': {
            //changing internal note text
            prevState.notes.filter((note: { id: any; }) => note.id === action.payload.id)[0].text="test";

            console.log('After EDIT_NOTE: ', prevState);
            return prevState;
        }
    }
};

export function App() {
    const [notesState, dispatch] = useReducer(notesReducer, initialNotesState);
    const [noteInput, setNoteInput] = useState('');

    const addNote = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        if (!noteInput) {
            return;
        }

        const newNote = {
            id: uuid(),
            text: noteInput,
            rotate: Math.floor(Math.random() * 20)
        }

        dispatch({ type: 'ADD_NOTE', payload: newNote });
        setNoteInput('');
    };

    const dragOver = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {
        event.stopPropagation();
        event.preventDefault();
    }

    const dropNote = (event: any) => {
        console.log(event);
        event.target.style.left = `${event.pageX - 50}px`;
        event.target.style.top = `${event.pageY - 50}px`;
    };

    //TODO save and end all edits
    const endEdit = (event: any) => {
        event.preventDefault();
        
        let elems = Array.from(document.getElementsByTagName("textarea"));

        elems.forEach(textarea => {
            let note = textarea.parentElement;
            if(note === null || note === undefined || note.className !== "note") return;

            let pre = document.createElement("pre");

            pre.className = "text";
            pre.innerHTML = textarea.value;

            note.removeChild(textarea);
            note.appendChild(pre);

            //update note
        });
    }

    const startEditing = (event: any) =>{

        //find note element
        let note = event.target;
        while(note.className !== "note"){
            note = note.parentElement;
        }

        let pre = note.getElementsByTagName("pre")[0];
        console.log(pre)

        //end editing
        if(pre === undefined || pre === null){
            let pre = document.createElement("pre");
            let textarea = note.getElementsByTagName("textarea")[0];

            pre.className = "text"
            pre.innerHTML = textarea.value;

            note.removeChild(textarea);
            note.appendChild(pre);

            //update note state
            //dispatch({ type: 'UPDATE_NOTE', payload: })
        }

        //start editing
        else{
            let textarea = document.createElement("textarea");
            textarea.value = pre.innerHTML;
            textarea.className = "editBox";

            note.removeChild(pre);
            note.appendChild(textarea);
        }
        
    }

    return (
        <div className="app" onDragOver={dragOver}>
            <h1>
                Sticky Notes ({notesState.totalNotes})
                <span>{notesState.notes.length ? `Last note created: ${notesState.lastNoteCreated}` : ' '}</span>
            </h1>

            <form className="note-form" onSubmit={addNote}>
                <textarea placeholder="Create a new note..." 
                    value={noteInput}
                    onChange={event => setNoteInput(event.target.value)}>
                </textarea>
                <button type="submit">Add</button>
            </form>

            {notesState
                .notes
                .map((note: { rotate: any; id: React.Key | null | undefined; text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => (
                    <div className="note"
                        style={{ transform: `rotate(${note.rotate}deg)` }}
                        onDragEnd={dropNote}
                        draggable="true"
                        onDoubleClick={startEditing}
                        id={note.id?.toString()}
                        key={note.id}>

                        <div onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note })}
                            className="close">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <div onClick={startEditing}
                            className="edit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round">
                                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
                                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                            </svg>
                        </div>

                        <pre className="text">{note.text}</pre>
                    </div>
                ))
            }
        </div>
    );
}

export default App;
