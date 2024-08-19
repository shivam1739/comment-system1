
'use client'
import { RichTextEditorProps } from '@/utils/types';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// var icons: any = ReactQuill.Quill.import('ui/icons');

import styled from 'styled-components';
// icons['bold'] = '<i class="fa fa-bold" aria-hidden="true"></i>';
// icons['italic'] = '<i class="fa fa-italic" aria-hidden="true"></i>';
// icons['underline'] = '<i class="fa fa-underline" aria-hidden="true"></i>';
// icons['link'] = '<i class="fa fa-link" aria-hidden="true"></i>';






const toolbarOptions = [
    // [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    // [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['image'],

];

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ handleSend, text, setText, closeEditor, showCancleBtn }) => {

    const editorRef = React.useRef<ReactQuill>(null);


    const handleChange = (value: any) => {
        setText(value);
    };

    const handleCancelClick = () => {
        closeEditor()
    }

    const handleSendClick = () => {
        const editor = editorRef.current?.getEditor();
        if (editor) {
            const delta: any = editor.getContents();
            handleSend(delta);
        } else {
            console.error("Editor instance not available");
        }
    }

    useEffect(() => {
        const toolbar = document.querySelector('.ql-toolbar');
        if (toolbar) {

            if (editorRef.current) {
                const quill = editorRef.current.getEditor();

                // Define custom button functionality
                const sendButton = document.createElement('button');
                sendButton.innerText = 'Send';
                sendButton.className = 'btn';
                sendButton.onclick = handleSendClick


                const cancelButton = document.createElement('button');
                cancelButton.innerText = 'Cancel';
                cancelButton.className = 'btn2';
                cancelButton.onclick = handleCancelClick;


                // Add buttons to the Quill toolbar
                const toolbar = quill.getModule('toolbar');
                toolbar.addHandler('myButton', () => {
                    // Handler for your custom button
                });
                toolbar.container.appendChild(sendButton);
                if (showCancleBtn) {
                    toolbar.container.appendChild(cancelButton);

                }
            }
        }



    }, [handleSend]);



    return (
        <div>

            <StyledEditer

                ref={editorRef}
                value={text}
                modules={{
                    toolbar: toolbarOptions,
                }}
                formats={formats}
                onChange={handleChange}

            />


        </div>
    );
};

const StyledEditer = styled(ReactQuill)`
min-height: 12.125rem;
height: auto;
width:100%;
margin: auto;
border: 1px solid #ccc;
border-radius: 15px;
position: relative !important;
box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

.ql-toolbar{
    border:none;
    position: absolute;
    bottom: 0;
 padding:1.5rem 0 2rem 0;
    border-top:1px solid ;
    margin: 0 1rem;
    min-width: -webkit-fill-available;
    z-index: 111;
    display: flex;
  

    .btn{
        margin-left: 1rem;
        height: 2rem;
        width: 4rem;
        color: white;
        background-color: black;
        border-radius: 10px;
        position: absolute;
        right: 0;
    }

    .btn2{
        margin-left: 1rem;
        height: 2rem;
        width: 4rem;
        color: white;
        background-color: gray;
        border-radius: 10px;
        position: absolute;
        right: 5rem;
    }

   .btn2:hover{
        color: white;
    }
  .btn:hover{
        color: white;
    }
}

.ql-container{
   border: none;
   margin-bottom: 5rem;
   min-height: 7rem;
}

.ql-editor{
    min-height: inherit;
}

.ql-editor>p > img{
    /* height: 9.1875rem;  */
    width: 9.1875rem;
}
`

export default RichTextEditor;

