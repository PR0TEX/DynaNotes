import { BiEdit, BiXCircle } from "react-icons/bi";
import React, { useState, useReducer, useEffect } from 'react';
import './App.scss';
import { v4 as uuid } from 'uuid';
import axios from "axios";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

const initialNotesState = {
    lastNoteCreated: "",
    totalNotes: 0,
    notes: [],
};

const notesReducer = (prevState: any, action: any) => {
    switch (action.type) {
        case 'ADD_NOTE': {
            console.log('prev state in add', prevState)
            const newState = { 
                notes: [...prevState.notes, action.payload],
                totalNotes: prevState.notes.length + 1,
                lastNoteCreated: new Date().toTimeString().slice(0, 8),
            };
            console.log('After ADD_NOTE: ', newState);

            axios.post(`http://localhost:8080/api/notes`, {
                id: action.payload.id,
                contents: action.payload.contents,
                xcoord: action.payload.position[0],
                ycoord: action.payload.position[1]
            })
            .then(res => {
                // console.log(res);
                // console.log(res.data)
            })
            .catch(err => {
                console.log(err)
            });

            return newState;
        }

        case 'DELETE_NOTE': {

            axios.delete(`http://localhost:8080/api/notes/${action.payload.id}`)
            .then(res => {
                console.log(res);
                console.log(res.data);
            })

            const newState = {
                ...prevState,
                notes: prevState.notes.filter((note: { id: any; }) => note.id !== action.payload.id),
                totalNotes: prevState.notes.length - 1,
            };
            // console.log('After DELETE_NOTE: ', newState);          

            return newState;
        }

        case 'EDIT_NOTE': {
            //changing internal note contents
            prevState.notes.filter((note: { id: any; }) => note.id === action.payload.id)[0].contents="test";

            axios.patch(`http://localhost:8080/api/notes/${action.payload.id}`,{
                contents: action.payload.contents
            })
            .catch(err => console.log(err))

            // console.log('After EDIT_NOTE: ', prevState);
            return prevState;
        }
    }
};

export function App() {
    useEffect(() => {
        axios.get(`http://localhost:8080/api/notes`)
        .then(res => {
            
            initialNotesState["notes"] = res.data;
            initialNotesState["totalNotes"] = res.data.length ;
            initialNotesState["lastNoteCreated"] = new Date().toTimeString().slice(0, 8); // TODO delete this variable
            // TODO display notes
            // console.log('Initial notes state', initialNotesState)
        })
    }, []);

    console.log('Initial notes state', initialNotesState)
    const [notesState, dispatch] = useReducer(notesReducer, initialNotesState);
    const [noteInput, setNoteInput] = useState('');


    const addNote = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        if (!noteInput) {
            return;
        }

        const newNote = {
            id: uuid(),
            contents: noteInput,
            rotate: Math.floor(Math.random() * 20),
            position: [0, 0]
        }

        dispatch({ type: 'ADD_NOTE', payload: newNote });
        setNoteInput('');
    };

    const dragOver = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {
        event.stopPropagation();
        event.preventDefault();
    }

    const dropNote = (event: any, note: any) => {
        // console.log('DROP NOTE', event);        
        note.position = [event.clientX, event.clientY];
        // console.log('note', note)
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

            pre.className = "contents";
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
        // console.log(pre)

        //end editing
        if(pre === undefined || pre === null){
            let pre = document.createElement("pre");
            let textarea = note.getElementsByTagName("textarea")[0];

            pre.className = "contents"
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
                .map((note: { rotate: Number; id: React.Key; contents: string, position: [Number, Number] }) => (
                    <div className="note"
                        style={{ transform: `rotate(${note.rotate}deg)` }}                                       
                        onDragEnd={(event) => dropNote(event, note)}
                        draggable="true"
                        onDoubleClick={startEditing}
                        id={note.id?.toString()}
                        key={note.id}>

                        <div onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note })}
                            className="close">
                            <BiXCircle />
                        </div>

                        <div onClick={startEditing}
                            className="edit">
                            <BiEdit/>
                        </div>

                        <pre className="contents">{note.contents}</pre>
                    </div>
                ))
            }
        </div>
    );
}

export default App;
